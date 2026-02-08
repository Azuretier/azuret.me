import { NextRequest, NextResponse } from 'next/server'
import { getComments, createComment } from '@/src/lib/db'

export async function GET() {
  const comments = getComments()
  return NextResponse.json(comments)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { author, content } = body

  if (!author || !content) {
    return NextResponse.json(
      { error: 'author and content are required' },
      { status: 400 }
    )
  }

  if (author.length > 50 || content.length > 500) {
    return NextResponse.json(
      { error: 'author max 50 chars, content max 500 chars' },
      { status: 400 }
    )
  }

  const comment = createComment(author.trim(), content.trim())
  return NextResponse.json(comment, { status: 201 })
}
