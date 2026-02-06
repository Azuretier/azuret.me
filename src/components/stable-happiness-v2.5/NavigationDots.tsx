'use client'

import { useEffect, useState } from 'react'
import styles from './NavigationDots.module.css'

const sections = [
  { id: 'home', label: 'ホーム' },
  { id: 'about', label: '私について' },
  { id: 'works', label: '作品' },
  { id: 'philosophy', label: '哲学' },
  { id: 'contact', label: '連絡' }
]

export default function NavigationDots() {
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const observerOptions = {
      threshold: 0.5
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id)
        }
      })
    }, observerOptions)

    sections.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav className={styles.navDots}>
      {sections.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          className={`${styles.dot} ${activeSection === id ? styles.active : ''}`}
          data-label={label}
          onClick={(e) => handleClick(e, id)}
        />
      ))}
    </nav>
  )
}
