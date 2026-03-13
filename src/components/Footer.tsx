'use client'

import styles from './Footer.module.css'
import { siteIdentity, footerLinks } from '../config/siteConfig'
import { useLanguage } from '../i18n/LanguageContext'

type TabKey = 'home' | 'profiles' | 'links'

export default function Footer({ onTabChange }: { onTabChange?: (tab: TabKey) => void }) {
  const { t } = useLanguage()

  const siteLinks: { label: string; tab: TabKey }[] = [
    { label: t.nav.home, tab: 'home' },
    { label: t.nav.profiles, tab: 'profiles' },
    { label: t.nav.links, tab: 'links' },
  ]

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerCol}>
          <h4 className={styles.footerHeading}>{t.footer.resources}</h4>
          {footerLinks.resources.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className={styles.footerLink}
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className={styles.footerCol}>
          <h4 className={styles.footerHeading}>{t.footer.social}</h4>
          {footerLinks.social.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className={styles.footerLink}
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className={styles.footerCol}>
          <h4 className={styles.footerHeading}>{t.footer.site}</h4>
          {siteLinks.map((link) => (
            <button
              key={link.tab}
              onClick={() => { onTabChange?.(link.tab); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className={styles.footerLink}
              style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} {siteIdentity.copyright}</p>
        <p>{t.footer.madeWith} {siteIdentity.madeWith}</p>
      </div>
    </footer>
  )
}
