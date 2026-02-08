'use client'

import { useEffect, useState, useCallback } from 'react'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import styles from './profiles.module.css'

/* ── types ────────────────────────────────────────────────── */

interface Profile {
  id: number
  username: string
  display_name: string
  bio: string
  website: string
  created_at: string
}

/* ── helpers ───────────────────────────────────────────────── */

const AVATAR_COLORS = [
  '#10b981', '#5b6ee1', '#8b5cf6', '#1d9bf0',
  '#f59e0b', '#f43f5e', '#ec4899', '#6366f1',
]

function avatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'Z').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/* ── component ──────────────────────────────────────────────── */

export default function ProfilesPage() {
  const [visible, setVisible] = useState(false)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [website, setWebsite] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  const fetchProfiles = useCallback(async () => {
    try {
      const res = await fetch('/api/profiles')
      if (res.ok) {
        const data = await res.json()
        setProfiles(data)
      }
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  const handleSubmit = async () => {
    if (!username.trim() || !displayName.trim() || submitting) return
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          display_name: displayName.trim(),
          bio: bio.trim(),
          website: website.trim(),
        }),
      })

      if (res.ok) {
        setUsername('')
        setDisplayName('')
        setBio('')
        setWebsite('')
        setSuccess('Profile created!')
        fetchProfiles()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await res.json()
        setError(data.error || 'Something went wrong')
      }
    } catch {
      setError('Network error, please try again')
    }

    setSubmitting(false)
  }

  return (
    <div className={styles.page}>
      {/* ── ambient glow ─────────────────────────────────────── */}
      <div className={styles.ambientTop} />
      <div className={styles.ambientBottom} />

      {/* ── nav ──────────────────────────────────────────────── */}
      <Nav activePage="profiles" />

      {/* ── hero ─────────────────────────────────────────────── */}
      <header className={`${styles.hero} ${visible ? styles.heroVisible : ''}`}>
        <div className={styles.heroContainer}>
          <div className={styles.heroIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>

          <h1 className={styles.heroTitle}>Community Profiles</h1>
          <p className={styles.heroSub}>
            Leave your mark, share who you are.
          </p>
        </div>
      </header>

      {/* ── create profile form ──────────────────────────────── */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Create Profile</h2>
      </div>

      <section className={styles.formSection}>
        <div className={styles.formCard}>
          <div className={styles.formTitle}>Your Details</div>
          <div className={styles.formSub}>Fill in the fields below to create your profile on azuret.me</div>

          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Username</label>
              <input
                className={styles.input}
                type="text"
                placeholder="coolperson"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={30}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Display Name</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Cool Person"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
              />
            </div>
          </div>

          <div className={styles.inputGroup} style={{ marginBottom: '12px' }}>
            <label className={styles.inputLabel}>Bio</label>
            <textarea
              className={styles.textarea}
              placeholder="A short bio about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={300}
            />
          </div>

          <div className={styles.inputGroup} style={{ marginBottom: '16px' }}>
            <label className={styles.inputLabel}>Website (optional)</label>
            <input
              className={styles.input}
              type="text"
              placeholder="https://yoursite.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className={styles.formFooter}>
            <div>
              {error && <span className={styles.formError}>{error}</span>}
              {success && <span className={styles.formSuccess}>{success}</span>}
            </div>
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={!username.trim() || !displayName.trim() || submitting}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              {submitting ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        </div>
      </section>

      {/* ── profiles grid header ─────────────────────────────── */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Members</h2>
        <span className={styles.sectionBadge}>{profiles.length} profiles</span>
      </div>

      {/* ── profiles grid ────────────────────────────────────── */}
      <section className={styles.profilesSection}>
        <div className={styles.profilesGrid}>
          {profiles.length === 0 ? (
            <div className={styles.emptyState}>
              <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
              <p className={styles.emptyText}>No profiles yet. Be the first to join!</p>
            </div>
          ) : (
            profiles.map((p, i) => {
              const color = avatarColor(p.username)
              return (
                <div
                  key={p.id}
                  className={`${styles.profileCard} ${visible ? styles.profileCardVisible : ''}`}
                  style={{ '--delay': `${i * 60 + 100}ms`, '--accent': color } as React.CSSProperties}
                >
                  <div className={styles.profileCardHeader}>
                    <div className={styles.profileAvatar} style={{ background: color }}>
                      {p.display_name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className={styles.profileDisplayName}>{p.display_name}</div>
                      <div className={styles.profileUsername}>@{p.username}</div>
                    </div>
                  </div>

                  {p.bio && <p className={styles.profileBio}>{p.bio}</p>}

                  {p.website && (
                    <a
                      href={p.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.profileWebsite}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                      </svg>
                      {p.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  )}

                  <div className={styles.profileTime}>
                    Joined {formatDate(p.created_at)}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>

      {/* ── footer ───────────────────────────────────────────── */}
      <Footer />
    </div>
  )
}
