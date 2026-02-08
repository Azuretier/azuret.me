import { NextResponse } from 'next/server'
import { likeComment } from '@/src/lib/db'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const numId = parseInt(id, 10)
  if (isNaN(numId)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  }

  const comment = likeComment(numId)
  if (!comment) {
    return NextResponse.json({ error: 'comment not found' }, { status: 404 })
  }

  return NextResponse.json(comment)
}
