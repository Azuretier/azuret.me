'use client'

import { useState, useEffect } from 'react'
import styles from './LanguageSwitcher.module.css'
import { useLanguage } from '../i18n/LanguageContext'
import { type Locale, localeNames, localeLabels } from '../i18n/translations'

const locales: Locale[] = ['en', 'th', 'es']

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest(`.${styles.wrapper}`)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [open])

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.btn}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        aria-label="Select language"
      >
        <svg className={styles.globeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
        <span className={styles.btnLabel}>{localeNames[locale]}</span>
        <svg className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className={styles.dropdown}>
          {locales.map((l) => (
            <button
              key={l}
              className={`${styles.option} ${l === locale ? styles.optionActive : ''}`}
              onClick={() => {
                setLocale(l)
                setOpen(false)
              }}
            >
              <span className={styles.optionCode}>{localeNames[l]}</span>
              <span className={styles.optionLabel}>{localeLabels[l]}</span>
              {l === locale && (
                <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
