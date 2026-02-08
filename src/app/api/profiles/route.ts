import { NextRequest, NextResponse } from 'next/server'
import { getProfiles, createProfile } from '@/src/lib/db'

export async function GET() {
  const profiles = getProfiles()
  return NextResponse.json(profiles)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { username, display_name, bio, website } = body

  if (!username || !display_name) {
    return NextResponse.json(
      { error: 'username and display_name are required' },
      { status: 400 }
    )
  }

  if (username.length > 30 || display_name.length > 50) {
    return NextResponse.json(
      { error: 'username max 30 chars, display_name max 50 chars' },
      { status: 400 }
    )
  }

  if (bio && bio.length > 300) {
    return NextResponse.json(
      { error: 'bio max 300 chars' },
      { status: 400 }
    )
  }

  if (website && website.length > 200) {
    return NextResponse.json(
      { error: 'website max 200 chars' },
      { status: 400 }
    )
  }

  // basic username validation
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return NextResponse.json(
      { error: 'username can only contain letters, numbers, _ and -' },
      { status: 400 }
    )
  }

  try {
    const profile = createProfile(
      username.trim(),
      display_name.trim(),
      (bio || '').trim(),
      (website || '').trim()
    )
    return NextResponse.json(profile, { status: 201 })
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('UNIQUE constraint')) {
      return NextResponse.json(
        { error: 'username already taken' },
        { status: 409 }
      )
    }
    throw e
  }
}
