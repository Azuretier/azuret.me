'use client'

import { useEffect } from 'react'

export default function FloatingParticles() {
  useEffect(() => {
    const container = document.querySelector('.particle-container')
    if (!container) return

    const particleCount = 20
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      particle.className = 'particle'
      particle.style.left = Math.random() * 100 + '%'
      particle.style.animationDelay = Math.random() * 20 + 's'
      particle.style.animationDuration = (Math.random() * 20 + 20) + 's'
      container.appendChild(particle)
    }
  }, [])

  return <div className="particle-container" />
}
