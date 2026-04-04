import type { Comment, Profile, SiteStats } from '../types'

const SITE_DATA_CHANGED_EVENT = 'site-data-changed'

interface CreateCommentInput {
  author: string
  content: string
}

interface CreateProfileInput {
  username: string
  display_name: string
  bio: string
  website: string
}

interface ApiErrorPayload {
  error?: string
}

function emitSiteDataChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(SITE_DATA_CHANGED_EVENT))
  }
}

async function parseApiError(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as ApiErrorPayload
    return data.error || fallback
  } catch {
    return fallback
  }
}

export function subscribeToSiteDataChanged(callback: () => void) {
  if (typeof window === 'undefined') return () => {}

  const listener = () => callback()
  window.addEventListener(SITE_DATA_CHANGED_EVENT, listener)
  return () => window.removeEventListener(SITE_DATA_CHANGED_EVENT, listener)
}

export async function fetchComments(): Promise<Comment[]> {
  const response = await fetch('/api/comments')
  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Failed to load comments'))
  }
  return response.json()
}

export async function createComment(input: CreateCommentInput): Promise<Comment> {
  const response = await fetch('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Failed to create comment'))
  }

  const comment = (await response.json()) as Comment
  emitSiteDataChanged()
  return comment
}

export async function likeCommentById(id: number): Promise<Comment> {
  const response = await fetch(`/api/comments/${id}/like`, { method: 'POST' })
  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Failed to like comment'))
  }

  const comment = (await response.json()) as Comment
  emitSiteDataChanged()
  return comment
}

export async function fetchProfiles(): Promise<Profile[]> {
  const response = await fetch('/api/profiles')
  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Failed to load profiles'))
  }
  return response.json()
}

export async function createProfile(input: CreateProfileInput): Promise<Profile> {
  const response = await fetch('/api/profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Failed to create profile'))
  }

  const profile = (await response.json()) as Profile
  emitSiteDataChanged()
  return profile
}

export async function fetchSiteStats(): Promise<SiteStats> {
  const [comments, profiles] = await Promise.all([
    fetchComments(),
    fetchProfiles(),
  ])

  return {
    comments: comments.length,
    likes: comments.reduce((sum, comment) => sum + comment.likes, 0),
    profiles: profiles.length,
  }
}
