'use client'

import styles from './Footer.module.css'
import { siteIdentity, footerLinks } from '../config/siteConfig'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerCol}>
          <h4 className={styles.footerHeading}>{footerLinks.resources.heading}</h4>
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
          <h4 className={styles.footerHeading}>{footerLinks.social.heading}</h4>
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
          <h4 className={styles.footerHeading}>{footerLinks.site.heading}</h4>
          {footerLinks.site.links.map((link) => (
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
        <p>made with {siteIdentity.madeWith}</p>
      </div>
    </footer>
  )
}
