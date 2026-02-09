'use client'

import styles from './Footer.module.css'

export default function Footer() {
  return (
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
          <a href="/profiles" className={styles.footerLink}>Profiles</a>
          <a href="/links" className={styles.footerLink}>Links</a>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} azuret.me</p>
        <p>made with {'<3'}</p>
      </div>
    </footer>
  )
}
