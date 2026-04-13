'use client'

import { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import Nav from './Nav'
import Footer from './Footer'
import HomeTab from './tabs/HomeTab'
import ProfilesTab from './tabs/ProfilesTab'
import LinksTab from './tabs/LinksTab'
import styles from '../app/home.module.css'
import type { TabKey } from '../types'

/* ── lazy-loaded app components ──────────────────────────── */

const LolMemo = dynamic(() => import('../app/lol-memo/LolMemo'), { ssr: false })
const NutritionApp = dynamic(() => import('../app/nutrition/NutritionApp'), { ssr: false })
const WorkoutApp = dynamic(() => import('../app/workout/WorkoutApp'), { ssr: false })
const EnglishApp = dynamic(() => import('../app/english/EnglishApp'), { ssr: false })
const HybridNotesApp = dynamic(() => import('../app/hybrid-notes/HybridNotesApp'), { ssr: false })

/* ── loading spinner ─────────────────────────────────────── */

function AppLoading() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      color: 'var(--color-text-secondary, #888)',
      fontSize: '14px',
      gap: '8px',
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
        <path d="M21 12a9 9 0 11-6.219-8.56" />
      </svg>
      Loading…
    </div>
  )
}

/* ── Shared page shell used by all route pages ──────────────── */

export default function PageShell({ defaultTab = 'home' }: { defaultTab?: TabKey }) {
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab)
  const [visible, setVisible] = useState(false)

  /* Re-trigger entrance animation on tab change */
  useEffect(() => {
    setVisible(false)
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [activeTab])

  /* ── is this an "app" tab (full-screen, no shell chrome) ── */
  const isAppTab = activeTab === 'l' || activeTab === 'n' || activeTab === 'workout' || activeTab === 'english' || activeTab === 'h'

  return (
    <div className={styles.page}>
      {/* ── ambient glow ─────────────────────────────────── */}
      {!isAppTab && <div className={styles.ambientTop} />}
      {!isAppTab && <div className={styles.ambientBottom} />}

      {/* ── nav ──────────────────────────────────────────── */}
      <Nav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── tab content ──────────────────────────────────── */}
      {activeTab === 'home' && <HomeTab visible={visible} onTabChange={setActiveTab} />}
      {activeTab === 'profiles' && <ProfilesTab visible={visible} />}
      {activeTab === 'links' && <LinksTab visible={visible} />}

      {/* ── app tabs (lazy-loaded) ────────────────────────── */}
      {activeTab === 'l' && (
        <Suspense fallback={<AppLoading />}>
          <LolMemo />
        </Suspense>
      )}
      {activeTab === 'n' && (
        <Suspense fallback={<AppLoading />}>
          <NutritionApp />
        </Suspense>
      )}
      {activeTab === 'workout' && (
        <Suspense fallback={<AppLoading />}>
          <WorkoutApp />
        </Suspense>
      )}
      {activeTab === 'english' && (
        <Suspense fallback={<AppLoading />}>
          <EnglishApp />
        </Suspense>
      )}
      {activeTab === 'h' && (
        <Suspense fallback={<AppLoading />}>
          <HybridNotesApp />
        </Suspense>
      )}

      {/* ── footer ───────────────────────────────────────── */}
      {!isAppTab && <Footer onTabChange={setActiveTab} />}
    </div>
  )
}
