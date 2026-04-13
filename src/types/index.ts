/* ── Shared Types ──────────────────────────────────────────── */

export type TabKey = 'home' | 'profiles' | 'links' | 'l' | 'n' | 'workout' | 'english' | 'h'

export interface Comment {
  id: number
  author: string
  content: string
  likes: number
  created_at: string
}

export interface Profile {
  id: number
  username: string
  display_name: string
  bio: string
  website: string
  created_at: string
}

export interface SiteStats {
  comments: number
  likes: number
  profiles: number
}
