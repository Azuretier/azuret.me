import { NextRequest, NextResponse } from 'next/server'
import { getHybridWorkspace, saveHybridWorkspace } from '@/src/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SYNC_KEY_PATTERN = /^[a-z0-9][a-z0-9_-]{3,63}$/i
const MAX_PAYLOAD_LENGTH = 1024 * 1024

function normalizeSyncKey(value: string) {
  return value.trim().toLowerCase()
}

function isValidSyncKey(value: string) {
  return SYNC_KEY_PATTERN.test(value)
}

export async function GET(req: NextRequest) {
  const syncKey = normalizeSyncKey(req.nextUrl.searchParams.get('syncKey') || '')

  if (!isValidSyncKey(syncKey)) {
    return NextResponse.json(
      { error: 'syncKey must be 4-64 chars and use only letters, numbers, _ or -.' },
      { status: 400 },
    )
  }

  const record = getHybridWorkspace(syncKey)

  return NextResponse.json({
    workspace: record?.workspace ?? null,
    updatedAt: record?.updatedAt ?? null,
  })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const syncKey = normalizeSyncKey(typeof body?.syncKey === 'string' ? body.syncKey : '')
  const workspace = body?.workspace

  if (!isValidSyncKey(syncKey)) {
    return NextResponse.json(
      { error: 'syncKey must be 4-64 chars and use only letters, numbers, _ or -.' },
      { status: 400 },
    )
  }

  if (!workspace || typeof workspace !== 'object') {
    return NextResponse.json({ error: 'workspace is required.' }, { status: 400 })
  }

  const payloadLength = JSON.stringify(workspace).length
  if (payloadLength > MAX_PAYLOAD_LENGTH) {
    return NextResponse.json({ error: 'workspace payload is too large.' }, { status: 413 })
  }

  const saved = saveHybridWorkspace(syncKey, workspace)

  return NextResponse.json({
    workspace: saved?.workspace ?? null,
    updatedAt: saved?.updatedAt ?? null,
  })
}
