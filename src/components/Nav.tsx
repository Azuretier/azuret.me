'use client'

import { useEffect, useState, useCallback } from 'react'
import styles from './Nav.module.css'

/* ── types ────────────────────────────────────────────────── */

interface SiteStats {
  comments: number
  likes: number
  profiles: number
}

/* ── component ──────────────────────────────────────────────── */

export default function Nav({ activePage }: { activePage: 'home' | 'profiles' | 'links' }) {
  const [scrolled, setScrolled] = useState(false)
  const [stats, setStats] = useState<SiteStats>({ comments: 0, likes: 0, profiles: 0 })
  const [widgetOpen, setWidgetOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const [commentsRes, profilesRes] = await Promise.all([
        fetch('/api/comments'),
        fetch('/api/profiles'),
      ])
      if (commentsRes.ok && profilesRes.ok) {
        const comments = await commentsRes.json()
        const profiles = await profilesRes.json()
        const totalLikes = comments.reduce((sum: number, c: { likes: number }) => sum + c.likes, 0)
        setStats({
          comments: comments.length,
          likes: totalLikes,
          profiles: profiles.length,
        })
      }
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const total = stats.comments + stats.likes + stats.profiles
  const level = total < 5 ? 1 : total < 15 ? 2 : total < 30 ? 3 : total < 60 ? 4 : 5
  const thresholds = [0, 5, 15, 30, 60, 100]
  const currentMin = thresholds[level - 1]
  const currentMax = thresholds[level]
  const progress = Math.min(((total - currentMin) / (currentMax - currentMin)) * 100, 100)

  useEffect(() => {
    if (!widgetOpen) return
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest(`.${styles.widgetWrapper}`)) {
        setWidgetOpen(false)
      }
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [widgetOpen])

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
      <div className={styles.navInner}>
        <a href="/" className={styles.logo}>
          <span className={styles.logoAccent}>azuret</span>.me
        </a>

        <div className={styles.navRight}>
          <div className={styles.navLinks}>
            <a href="/" className={`${styles.navLink} ${activePage === 'home' ? styles.navLinkActive : ''}`}>Home</a>
            <a href="/profiles" className={`${styles.navLink} ${activePage === 'profiles' ? styles.navLinkActive : ''}`}>Profiles</a>
            <a href="/links" className={`${styles.navLink} ${activePage === 'links' ? styles.navLinkActive : ''}`}>Links</a>
          </div>

          {/* advancement widget */}
          <div className={styles.widgetWrapper}>
            <button
              className={styles.widgetBtn}
              onClick={(e) => {
                e.stopPropagation()
                setWidgetOpen((v) => !v)
              }}
              aria-label="Site advancement"
            >
              <div className={styles.widgetLevel}>Lv.{level}</div>
              <div className={styles.widgetBarOuter}>
                <div
                  className={styles.widgetBarInner}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </button>

            {widgetOpen && (
              <div className={styles.widgetDropdown}>
                <div className={styles.widgetHeader}>
                  <span className={styles.widgetTitle}>Community Progress</span>
                  <span className={styles.widgetLevelBadge}>Level {level}</span>
                </div>

                <div className={styles.widgetProgressSection}>
                  <div className={styles.widgetBarLarge}>
                    <div
                      className={styles.widgetBarLargeInner}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className={styles.widgetProgressLabel}>
                    {total} / {currentMax} to next level
                  </div>
                </div>

                <div className={styles.widgetStats}>
                  <div className={styles.widgetStat}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                    <span className={styles.widgetStatValue}>{stats.comments}</span>
                    <span className={styles.widgetStatLabel}>Messages</span>
                  </div>
                  <div className={styles.widgetStat}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                    <span className={styles.widgetStatValue}>{stats.likes}</span>
                    <span className={styles.widgetStatLabel}>Likes</span>
                  </div>
                  <div className={styles.widgetStat}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                    </svg>
                    <span className={styles.widgetStatValue}>{stats.profiles}</span>
                    <span className={styles.widgetStatLabel}>Members</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
