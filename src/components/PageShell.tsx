'use client'

import { useState, useEffect } from 'react'
import Nav from './Nav'
import Footer from './Footer'
import HomeTab from './tabs/HomeTab'
import ProfilesTab from './tabs/ProfilesTab'
import LinksTab from './tabs/LinksTab'
import styles from '../app/home.module.css'
import type { TabKey } from '../types'

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

  return (
    <div className={styles.page}>
      {/* ── ambient glow ─────────────────────────────────── */}
      <div className={styles.ambientTop} />
      <div className={styles.ambientBottom} />

      {/* ── nav ──────────────────────────────────────────── */}
      <Nav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── tab content ──────────────────────────────────── */}
      {activeTab === 'home' && <HomeTab visible={visible} />}
      {activeTab === 'profiles' && <ProfilesTab visible={visible} />}
      {activeTab === 'links' && <LinksTab visible={visible} />}

      {/* ── footer ───────────────────────────────────────── */}
      <Footer onTabChange={setActiveTab} />
    </div>
  )
}
