'use client'

import styles from './Footer.module.css'
import { siteIdentity, footerLinks } from '../config/siteConfig'
import { useLanguage } from '../i18n/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()

  const siteLinks = [
    { label: t.nav.home, href: '/' },
    { label: t.nav.profiles, href: '/profiles' },
    { label: t.nav.links, href: '/links' },
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
            <a
              key={link.href}
              href={link.href}
              className={styles.footerLink}
            >
              {link.label}
            </a>
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
