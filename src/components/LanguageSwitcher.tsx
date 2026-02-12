'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import styles from './LanguageSwitcher.module.css'
import { useLanguage } from '../i18n/LanguageContext'
import { type Locale, localeLabels, locales } from '../i18n/translations'

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage()
  const trackRef = useRef<HTMLDivElement>(null)
  const btnRefs = useRef<Map<Locale, HTMLButtonElement>>(new Map())
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  const updateIndicator = useCallback(() => {
    const btn = btnRefs.current.get(locale)
    const track = trackRef.current
    if (!btn || !track) return
    const trackRect = track.getBoundingClientRect()
    const btnRect = btn.getBoundingClientRect()
    setIndicator({
      left: btnRect.left - trackRect.left,
      width: btnRect.width,
    })
  }, [locale])

  useEffect(() => {
    updateIndicator()
  }, [updateIndicator])

  useEffect(() => {
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [updateIndicator])

  return (
    <div className={styles.bar} ref={trackRef}>
      <div
        className={styles.indicator}
        style={{
          transform: `translateX(${indicator.left}px)`,
          width: `${indicator.width}px`,
        }}
      />
      {locales.map((l) => (
        <button
          key={l}
          ref={(el) => {
            if (el) btnRefs.current.set(l, el)
          }}
          className={`${styles.langBtn} ${l === locale ? styles.langBtnActive : ''}`}
          onClick={() => setLocale(l)}
          aria-label={`Switch to ${localeLabels[l]}`}
        >
          {localeLabels[l]}
        </button>
      ))}
    </div>
  )
}
