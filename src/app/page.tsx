'use client'

import { useState, useEffect } from 'react'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import HomeTab from '../components/tabs/HomeTab'
import ProfilesTab from '../components/tabs/ProfilesTab'
import LinksTab from '../components/tabs/LinksTab'
import styles from './home.module.css'
import type { TabKey } from '../types'

/* ── component ──────────────────────────────────────────────── */

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('home')
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
