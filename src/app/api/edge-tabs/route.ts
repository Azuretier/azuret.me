import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type CandidateKind = 'tabs' | 'session'

type CandidateFile = {
  fullPath: string
  kind: CandidateKind
  profile: string
  mtimeMs: number
}

type RawEntry = {
  offset: number
  title: string
  url: string
}

const execFileAsync = promisify(execFile)
const PROFILE_NAME_PATTERN = /^(Default|Profile \d+)$/i
const URL_PATTERN = /(https?:\/\/[^\x00\s]+|edge:\/\/[^\x00\s]+)/g
const MAX_RESULTS = 40

function cleanTitle(title: string) {
  return title
    .replace(/\u0000/g, '')
    .replace(/^\d+\s+\|\s*/u, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanUrl(url: string) {
  return url.replace(/[\u0000-\u001f]+/g, '').trim()
}

function isUsefulTitle(title: string) {
  if (title.length < 2) return false
  if (/^\d+$/u.test(title)) return false
  if (!/[\p{L}\p{N}]/u.test(title)) return false
  if (/^[\uE000-\uF8FF]$/u.test(title)) return false
  return true
}

function shouldIgnoreUrl(url: string) {
  return (
    url === 'about:blank' ||
    url === 'edge://newtab/' ||
    url.startsWith('https://ntp.msn.com/edge/ntp')
  )
}

function extractTitledEntries(buffer: Buffer): RawEntry[] {
  const latin = buffer.toString('latin1')
  const entries: RawEntry[] = []

  for (const match of latin.matchAll(URL_PATTERN)) {
    const rawUrl = match[1]
    if (!rawUrl) continue

    const url = cleanUrl(rawUrl)
    if (shouldIgnoreUrl(url)) continue

    const start = match.index ?? 0
    let pos = start + Buffer.byteLength(rawUrl, 'latin1') + 1

    if (pos < buffer.length && buffer[pos] === 0) {
      pos += 1
    }

    if (pos + 4 > buffer.length) continue

    const titleLength = buffer.readUInt32LE(pos)
    if (titleLength < 1 || titleLength > 400) continue

    const titleStart = pos + 4
    const titleEnd = titleStart + titleLength * 2
    if (titleEnd > buffer.length) continue

    const title = cleanTitle(buffer.subarray(titleStart, titleEnd).toString('utf16le'))
    if (!isUsefulTitle(title)) continue

    entries.push({ offset: start, title, url })
  }

  return entries
}

function finalizeTabs(entries: RawEntry[], candidate: CandidateFile) {
  const byUrl = new Map<string, RawEntry>()

  for (const entry of entries) {
    const current = byUrl.get(entry.url)
    if (!current || current.offset < entry.offset) {
      byUrl.set(entry.url, entry)
    }
  }

  return [...byUrl.values()]
    .sort((a, b) => b.offset - a.offset)
    .slice(0, MAX_RESULTS)
    .map((entry, index) => ({
      id: `${candidate.profile}-${candidate.kind}-${index}-${Buffer.from(entry.url).toString('base64url').slice(0, 12)}`,
      title: entry.title,
      url: entry.url,
      profile: candidate.profile,
      sourceKind: candidate.kind,
    }))
}

async function collectLatestCandidates(userDataDir: string) {
  const dirEntries = await fs.readdir(userDataDir, { withFileTypes: true })
  const profiles = dirEntries.filter((entry) => entry.isDirectory() && PROFILE_NAME_PATTERN.test(entry.name))

  const candidates: CandidateFile[] = []

  for (const profile of profiles) {
    const sessionsDir = path.join(userDataDir, profile.name, 'Sessions')

    try {
      const files = await fs.readdir(sessionsDir, { withFileTypes: true })

      for (const kind of ['tabs', 'session'] as const) {
        const prefix = kind === 'tabs' ? 'Tabs_' : 'Session_'
        const latest = await Promise.all(
          files
            .filter((entry) => entry.isFile() && entry.name.startsWith(prefix))
            .map(async (entry) => {
              const fullPath = path.join(sessionsDir, entry.name)
              const stat = await fs.stat(fullPath)
              return stat.size > 0
                ? { fullPath, kind, profile: profile.name, mtimeMs: stat.mtimeMs }
                : null
            }),
        )

        const best = latest
          .filter((item): item is CandidateFile => item !== null)
          .sort((a, b) => b.mtimeMs - a.mtimeMs)[0]

        if (best) candidates.push(best)
      }
    } catch {
      // ignore missing profile session directory
    }
  }

  return candidates
}

function psEscape(value: string) {
  return value.replace(/'/g, "''")
}

async function snapshotLockedFile(sourcePath: string) {
  const tempDir = path.join(process.cwd(), 'data', '.edge-import')
  await fs.mkdir(tempDir, { recursive: true })
  const destinationPath = path.join(tempDir, `edge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.bin`)

  const command = [
    `$src='${psEscape(sourcePath)}'`,
    `$dst='${psEscape(destinationPath)}'`,
    "$inputFile=[System.IO.File]::Open($src,[System.IO.FileMode]::Open,[System.IO.FileAccess]::Read,[System.IO.FileShare]::ReadWrite)",
    'try {',
    '  $outputFile=[System.IO.File]::Create($dst)',
    '  try { $inputFile.CopyTo($outputFile) } finally { $outputFile.Dispose() }',
    '} finally { $inputFile.Dispose() }',
  ].join('; ')

  await execFileAsync('powershell.exe', ['-NoProfile', '-Command', command], {
    windowsHide: true,
    maxBuffer: 1024 * 1024 * 4,
  })

  return destinationPath
}

async function parseCandidate(candidate: CandidateFile) {
  const snapshotPath = await snapshotLockedFile(candidate.fullPath)

  try {
    const buffer = await fs.readFile(snapshotPath)
    return finalizeTabs(extractTitledEntries(buffer), candidate)
  } finally {
    await fs.unlink(snapshotPath).catch(() => undefined)
  }
}

export async function GET() {
  if (process.platform !== 'win32') {
    return NextResponse.json({ tabs: [], error: 'Edge import is only available on Windows.' }, { status: 400 })
  }

  const localAppData = process.env.LOCALAPPDATA
  if (!localAppData) {
    return NextResponse.json({ tabs: [], error: 'LOCALAPPDATA is not available.' }, { status: 500 })
  }

  const userDataDir = path.join(localAppData, 'Microsoft', 'Edge', 'User Data')

  try {
    const candidates = await collectLatestCandidates(userDataDir)
    const latestTabs = candidates.filter((item) => item.kind === 'tabs').sort((a, b) => b.mtimeMs - a.mtimeMs)[0]
    const latestSession = candidates.filter((item) => item.kind === 'session').sort((a, b) => b.mtimeMs - a.mtimeMs)[0]

    const tabsResult = latestTabs ? await parseCandidate(latestTabs).catch(() => []) : []
    const sessionResult = latestSession ? await parseCandidate(latestSession).catch(() => []) : []

    const tabsIsFresh =
      latestTabs ? Date.now() - latestTabs.mtimeMs < 1000 * 60 * 60 * 4 : false

    const chosen =
      tabsIsFresh && tabsResult.length
        ? { items: tabsResult, candidate: latestTabs }
        : sessionResult.length
          ? { items: sessionResult, candidate: latestSession! }
          : tabsResult.length
            ? { items: tabsResult, candidate: latestTabs! }
            : null

    if (!chosen) {
      return NextResponse.json({ tabs: [], error: 'No Edge session snapshot could be parsed.' }, { status: 404 })
    }

    return NextResponse.json({
      tabs: chosen.items,
      source: {
        kind: chosen.candidate.kind,
        profile: chosen.candidate.profile,
        updatedAt: new Date(chosen.candidate.mtimeMs).toISOString(),
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to read Edge session.'
    return NextResponse.json({ tabs: [], error: message }, { status: 500 })
  }
}
