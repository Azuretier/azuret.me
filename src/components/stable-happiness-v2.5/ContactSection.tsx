'use client'

import styles from './ContactSection.module.css'

const contactLinks = [
  { icon: '✉️', label: 'メール', href: '#' },
  { icon: '🐦', label: 'Twitter', href: '#' },
  { icon: '💼', label: 'GitHub', href: '#' }
]

export default function ContactSection() {
  return (
    <section id="contact" className={styles.section}>
      <div className={styles.sectionContent}>
        <div className={styles.contactContent}>
          <h2 className={styles.sectionTitle}>つながる</h2>
          <p className={styles.sectionText}>
            新しい出会いと創造的な対話を楽しみにしています。
          </p>
          <div className={styles.contactLinks}>
            {contactLinks.map((link) => (
              <a key={link.label} href={link.href} className={styles.contactLink}>
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
