'use client'

import { useEffect, useState, useCallback } from 'react'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import styles from './home.module.css'
import {
  hero,
  mediaFiles,
  slideshowInterval,
} from '../config/siteConfig'
import { useLanguage } from '../i18n/LanguageContext'

/* ── types ────────────────────────────────────────────────── */

interface Comment {
  id: number
  author: string
  content: string
  likes: number
  created_at: string
}

/* ── about icons ──────────────────────────────────────────── */

const aboutIcons: Record<string, React.ReactNode> = {
  location: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1116 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  interests: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  goal: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21l5.5-5.5M21 3l-5.5 5.5M12.5 7l-3-3-6 6 3 3M17 11.5l3 3-6 6-3-3" />
    </svg>
  ),
  stack: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
    </svg>
  ),
}

/* ── helpers ───────────────────────────────────────────────── */

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr + 'Z').getTime()
  const diff = Math.max(0, now - then)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

const AVATAR_COLORS = [
  '#5b6ee1', '#8b5cf6', '#1d9bf0', '#10b981',
  '#f59e0b', '#f43f5e', '#ec4899', '#6366f1',
]

function avatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

/* ── component ──────────────────────────────────────────────── */

export default function HomePage() {
  const [visible, setVisible] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set())
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const { t } = useLanguage()

  const aboutItems = [
    { key: 'location', label: t.about.location, value: t.about.locationValue, color: '#1d9bf0' },
    { key: 'interests', label: t.about.interests, value: t.about.interestsValue, color: '#a78bfa' },
    { key: 'goal', label: t.about.goal, value: t.about.goalValue, color: '#10b981' },
    { key: 'stack', label: t.about.stack, value: t.about.stackValue, color: '#f59e0b' },
  ]

  // Slideshow effect - cycle through media
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMediaIndex((prev) => (prev + 1) % mediaFiles.length)
    }, slideshowInterval)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch('/api/comments')
      if (res.ok) {
        const data = await res.json()
        setComments(data)
      }
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmit = async () => {
    if (!author.trim() || !content.trim() || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: author.trim(), content: content.trim() }),
      })
      if (res.ok) {
        setContent('')
        fetchComments()
      }
    } catch { /* silent */ }
    setSubmitting(false)
  }

  const handleLike = async (id: number) => {
    if (likedIds.has(id)) return
    setLikedIds((prev) => new Set(prev).add(id))
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c))
    )
    try {
      await fetch(`/api/comments/${id}/like`, { method: 'POST' })
    } catch { /* silent */ }
  }

  return (
    <div className={styles.page}>
      {/* ── ambient glow ─────────────────────────────────────── */}
      <div className={styles.ambientTop} />
      <div className={styles.ambientBottom} />

      {/* ── nav ──────────────────────────────────────────────── */}
      <Nav activePage="home" />

      {/* ── hero ─────────────────────────────────────────────── */}
      <header className={`${styles.hero} ${visible ? styles.heroVisible : ''}`}>
        <div className={styles.heroContainer}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatar}>
              <img
                src={mediaFiles[currentMediaIndex]}
                alt={hero.avatarAlt}
                className={styles.avatarImage}
              />
            </div>
            <div className={styles.statusDot} />
          </div>

          <h1 className={styles.heroTitle}>{hero.title}</h1>
          <p className={styles.heroSub}>
            {t.hero.subtitle}
            <br />
            {t.hero.description}
            <br />
            <span style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: '13px', opacity: 0.8, marginTop: '8px', display: 'inline-block' }}>
              {hero.japanese}
            </span>
          </p>
        </div>
      </header>

      {/* ── about me cards ───────────────────────────────────── */}
      <section className={styles.aboutSection}>
        <div className={styles.aboutGrid}>
          {aboutItems.map((item, i) => (
            <div
              key={item.key}
              className={`${styles.aboutCard} ${visible ? styles.aboutCardVisible : ''}`}
              style={{ '--delay': `${i * 80 + 200}ms`, '--accent': item.color } as React.CSSProperties}
            >
              <div className={styles.aboutIcon}>{aboutIcons[item.key]}</div>
              <div className={styles.aboutLabel}>{item.label}</div>
              <div className={styles.aboutValue}>{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── comment wall header ──────────────────────────────── */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t.commentWall.sectionTitle}</h2>
        <span className={styles.sectionBadge}>{comments.length} {t.commentWall.messagesLabel}</span>
      </div>

      {/* ── comment wall ─────────────────────────────────────── */}
      <section className={styles.wallSection}>
        {/* compose */}
        <div className={styles.compose}>
          <div className={styles.composeRow}>
            <input
              className={styles.input}
              type="text"
              placeholder={t.commentWall.namePlaceholder}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              maxLength={50}
            />
          </div>
          <textarea
            className={styles.textarea}
            placeholder={t.commentWall.messagePlaceholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
          />
          <div className={styles.composeFooter}>
            <span className={`${styles.charCount} ${content.length > 450 ? styles.charCountWarn : ''}`}>
              {content.length}/500
            </span>
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={!author.trim() || !content.trim() || submitting}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4z" />
              </svg>
              {submitting ? t.commentWall.sendingButton : t.commentWall.sendButton}
            </button>
          </div>
        </div>

        {/* comments list */}
        {comments.length === 0 ? (
          <div className={styles.emptyState}>
            <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            <p className={styles.emptyText}>{t.commentWall.emptyMessage}</p>
          </div>
        ) : (
          <div className={styles.commentList}>
            {comments.map((c) => (
              <div key={c.id} className={styles.comment}>
                <div className={styles.commentHeader}>
                  <div
                    className={styles.commentAvatar}
                    style={{ background: avatarColor(c.author) }}
                  >
                    {c.author[0].toUpperCase()}
                  </div>
                  <span className={styles.commentAuthor}>{c.author}</span>
                  <span className={styles.commentTime}>{timeAgo(c.created_at)}</span>
                </div>
                <p className={styles.commentBody}>{c.content}</p>
                <div className={styles.commentActions}>
                  <button
                    className={`${styles.likeBtn} ${likedIds.has(c.id) ? styles.likeBtnLiked : ''}`}
                    onClick={() => handleLike(c.id)}
                  >
                    <svg viewBox="0 0 24 24" fill={likedIds.has(c.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                    {c.likes > 0 && c.likes}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── profiles banner ──────────────────────────────────── */}
      <section className={styles.profileBanner}>
        <a href="/profiles" className={styles.profileBannerCard}>
          <div className={styles.profileBannerInfo}>
            <div className={styles.profileBannerIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <div>
              <div className={styles.profileBannerTitle}>{t.profileBanner.title}</div>
              <div className={styles.profileBannerSub}>{t.profileBanner.subtitle}</div>
            </div>
          </div>
          <svg className={styles.profileBannerArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
        </a>
      </section>

      {/* ── footer ───────────────────────────────────────────── */}
      <Footer />
    </div>
  )
}
