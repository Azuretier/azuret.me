const http = require('node:http')
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const { execFile } = require('node:child_process')
const { promisify } = require('node:util')

const execFileAsync = promisify(execFile)
const HELPER_PORT = Number(process.env.ELECTRON_HELPER_PORT || 4317)
const PROFILE_NAME_PATTERN = /^(Default|Profile \d+)$/i
const URL_PATTERN = /(https?:\/\/[^\x00\s]+|edge:\/\/[^\x00\s]+)/g
const MAX_RESULTS = 40

function cleanTitle(title) {
  return title
    .replace(/\u0000/g, '')
    .replace(/^\d+\s+\|\s*/u, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanUrl(url) {
  return url.replace(/[\u0000-\u001f]+/g, '').trim()
}

function isUsefulTitle(title) {
  if (title.length < 2) return false
  if (/^\d+$/u.test(title)) return false
  if (!/[\p{L}\p{N}]/u.test(title)) return false
  if (/^[\uE000-\uF8FF]$/u.test(title)) return false
  return true
}

function shouldIgnoreUrl(url) {
  return url === 'about:blank' || url === 'edge://newtab/' || url.startsWith('https://ntp.msn.com/edge/ntp')
}

function extractTitledEntries(buffer) {
  const latin = buffer.toString('latin1')
  const entries = []

  for (const match of latin.matchAll(URL_PATTERN)) {
    const rawUrl = match[1]
    if (!rawUrl) continue

    const url = cleanUrl(rawUrl)
    if (shouldIgnoreUrl(url)) continue

    const start = match.index ?? 0
    let pos = start + Buffer.byteLength(rawUrl, 'latin1') + 1
    if (pos < buffer.length && buffer[pos] === 0) pos += 1
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

function finalizeTabs(entries, candidate) {
  const byUrl = new Map()

  for (const entry of entries) {
    const current = byUrl.get(entry.url)
    if (!current || current.offset < entry.offset) byUrl.set(entry.url, entry)
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

async function collectLatestCandidates(userDataDir) {
  const dirEntries = await fs.readdir(userDataDir, { withFileTypes: true })
  const profiles = dirEntries.filter((entry) => entry.isDirectory() && PROFILE_NAME_PATTERN.test(entry.name))
  const candidates = []

  for (const profile of profiles) {
    const sessionsDir = path.join(userDataDir, profile.name, 'Sessions')

    try {
      const files = await fs.readdir(sessionsDir, { withFileTypes: true })

      for (const kind of ['tabs', 'session']) {
        const prefix = kind === 'tabs' ? 'Tabs_' : 'Session_'
        const latest = await Promise.all(
          files
            .filter((entry) => entry.isFile() && entry.name.startsWith(prefix))
            .map(async (entry) => {
              const fullPath = path.join(sessionsDir, entry.name)
              const stat = await fs.stat(fullPath)
              return stat.size > 0 ? { fullPath, kind, profile: profile.name, mtimeMs: stat.mtimeMs } : null
            }),
        )

        candidates.push(
          ...latest
            .filter(Boolean)
            .sort((a, b) => b.mtimeMs - a.mtimeMs)
            .slice(0, 4),
        )
      }
    } catch {
      // ignore missing profile session directory
    }
  }

  return candidates
}

function psEscape(value) {
  return value.replace(/'/g, "''")
}

async function snapshotLockedFile(sourcePath) {
  const tempDir = path.join(os.tmpdir(), 'azuret-edge-helper')
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

async function parseCandidate(candidate) {
  const snapshotPath = await snapshotLockedFile(candidate.fullPath)

  try {
    const buffer = await fs.readFile(snapshotPath)
    return finalizeTabs(extractTitledEntries(buffer), candidate)
  } finally {
    await fs.unlink(snapshotPath).catch(() => undefined)
  }
}

async function findFirstParsed(candidates) {
  for (const candidate of [...candidates].sort((a, b) => b.mtimeMs - a.mtimeMs)) {
    try {
      const items = await parseCandidate(candidate)
      if (items.length > 0) return { items, candidate }
    } catch {
      // try older snapshots
    }
  }

  return null
}

async function getEdgeTabs() {
  if (process.platform !== 'win32') {
    return {
      ok: false,
      status: 400,
      body: {
        tabs: [],
        error: 'The Electron Edge helper only works on Windows.',
      },
    }
  }

  const localAppData = process.env.LOCALAPPDATA
  if (!localAppData) {
    return {
      ok: false,
      status: 500,
      body: { tabs: [], error: 'LOCALAPPDATA is not available.' },
    }
  }

  const userDataDir = path.join(localAppData, 'Microsoft', 'Edge', 'User Data')
  const candidates = await collectLatestCandidates(userDataDir)
  const chosenTabs = await findFirstParsed(candidates.filter((item) => item.kind === 'tabs'))
  const chosenSession = await findFirstParsed(candidates.filter((item) => item.kind === 'session'))
  const tabsIsFresh = chosenTabs ? Date.now() - chosenTabs.candidate.mtimeMs < 1000 * 60 * 60 * 4 : false
  const chosen = tabsIsFresh && chosenTabs ? chosenTabs : chosenSession ?? chosenTabs

  if (!chosen) {
    return {
      ok: false,
      status: 404,
      body: { tabs: [], error: 'No Edge session snapshot could be parsed.' },
    }
  }

  return {
    ok: true,
    status: 200,
    body: {
      tabs: chosen.items,
      source: {
        kind: chosen.candidate.kind,
        profile: chosen.candidate.profile,
        updatedAt: new Date(chosen.candidate.mtimeMs).toISOString(),
      },
    },
  }
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  response.end(JSON.stringify(body))
}

async function startHelperServer({ port = HELPER_PORT } = {}) {
  const server = http.createServer(async (request, response) => {
    if (!request.url) {
      sendJson(response, 404, { error: 'Not found' })
      return
    }

    if (request.method === 'OPTIONS') {
      sendJson(response, 204, {})
      return
    }

    if (request.method === 'GET' && request.url === '/health') {
      sendJson(response, 200, { ok: true, port })
      return
    }

    if (request.method === 'GET' && request.url === '/api/edge-tabs') {
      try {
        const result = await getEdgeTabs()
        sendJson(response, result.status, result.body)
      } catch (error) {
        sendJson(response, 500, {
          tabs: [],
          error: error instanceof Error ? error.message : 'Failed to read Edge tabs.',
        })
      }
      return
    }

    sendJson(response, 404, { error: 'Not found' })
  })

  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, '127.0.0.1', () => {
      server.off('error', reject)
      resolve()
    })
  })

  return {
    port,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()))
      }),
  }
}

module.exports = {
  HELPER_PORT,
  getEdgeTabs,
  startHelperServer,
}
