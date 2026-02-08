'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './links.module.css'

/* ── data ───────────────────────────────────────────────────── */

const socials = [
  {
    id: 'x',
    name: 'X (Twitter)',
    handle: '@c2c546',
    description: 'Thoughts, updates, and daily musings.',
    href: 'https://x.com/c2c546',
    color: '#1d9bf0',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: 'github',
    name: 'GitHub',
    handle: '@Azuretier',
    description: 'Open-source projects and contributions.',
    href: 'https://github.com/Azuretier',
    color: '#8b5cf6',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    id: 'discord',
    name: 'Discord',
    handle: 'Community Server',
    description: 'Join the community and chat in real-time.',
    href: 'https://discord.gg/azuretier',
    color: '#5865f2',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
  {
    id: 'website',
    name: 'azuretier.net',
    handle: 'Game Website',
    description: 'The main hub for all things Azuretier.',
    href: 'https://azuretier.net',
    color: '#10b981',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
]

/* ── component ──────────────────────────────────────────────── */

export default function LinksPage() {
  const [scrolled, setScrolled] = useState(false)
  const [visible, setVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    // stagger-in entrance
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={styles.page}>
      {/* ── ambient glow ─────────────────────────────────────── */}
      <div className={styles.ambientTop} />
      <div className={styles.ambientBottom} />

      {/* ── nav ──────────────────────────────────────────────── */}
      <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
        <div className={styles.navInner}>
          <a href="/" className={styles.logo}>
            <span className={styles.logoAccent}>azuret</span>.me
          </a>

          <div className={styles.navLinks}>
            <a href="/" className={styles.navLink}>Home</a>
            <a href="/links" className={`${styles.navLink} ${styles.navLinkActive}`}>Links</a>
          </div>
        </div>
      </nav>

      {/* ── hero ─────────────────────────────────────────────── */}
      <header
        ref={heroRef}
        className={`${styles.hero} ${visible ? styles.heroVisible : ''}`}
      >
        <div className={styles.heroContainer}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatar}>
              <span>A</span>
            </div>
            <div className={styles.statusDot} />
          </div>

          <h1 className={styles.heroTitle}>Connect with me</h1>
          <p className={styles.heroSub}>
            Developer, creator, and cat-person based in Kanagawa.
            <br />
            Find me across the internet.
          </p>
        </div>
      </header>

      {/* ── cards grid ───────────────────────────────────────── */}
      <main className={styles.main}>
        <div className={styles.grid}>
          {socials.map((s, i) => (
            <a
              key={s.id}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.card} ${visible ? styles.cardVisible : ''}`}
              style={{ '--delay': `${i * 80 + 200}ms`, '--accent': s.color } as React.CSSProperties}
            >
              {/* glow */}
              <div className={styles.cardGlow} />

              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  {s.icon}
                </div>
                <svg className={styles.cardArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.cardName}>{s.name}</h3>
                <span className={styles.cardHandle}>{s.handle}</span>
                <p className={styles.cardDesc}>{s.description}</p>
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.cardCta}>
                  Visit
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>
      </main>

      {/* ── footer ───────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerCol}>
            <h4 className={styles.footerHeading}>Resources</h4>
            <a href="https://azuretier.net" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>azuretier.net</a>
            <a href="https://github.com/Azuretier" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>GitHub</a>
          </div>
          <div className={styles.footerCol}>
            <h4 className={styles.footerHeading}>Social</h4>
            <a href="https://x.com/c2c546" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>X (Twitter)</a>
            <a href="https://discord.gg/azuretier" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Discord</a>
          </div>
          <div className={styles.footerCol}>
            <h4 className={styles.footerHeading}>Site</h4>
            <a href="/" className={styles.footerLink}>Home</a>
            <a href="/links" className={styles.footerLink}>Links</a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; {new Date().getFullYear()} azuret.me</p>
          <p>made with {'<3'}</p>
        </div>
      </footer>
    </div>
  )
}
