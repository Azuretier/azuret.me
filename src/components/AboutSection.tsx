'use client'

import { useEffect, useRef } from 'react'

const stats = [
  { value: '100%', label: 'Free to use' },
  { value: 'Open', label: 'Source code' },
  { value: 'Fast', label: 'Performance' },
  { value: '24/7', label: 'Available' },
]

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-32 px-6"
    >
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-secondary/50 to-transparent pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div>
            <span className="text-xs font-medium tracking-widest uppercase text-accent-secondary mb-4 block">
              About
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Built with{' '}
              <span className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
                passion
              </span>
            </h2>
            <p className="text-text-secondary leading-relaxed mb-6">
              azuret.me is more than a website — it&apos;s a living document of ideas,
              projects, and the journey of building things that matter. From interactive
              experiences to practical tools, everything here is crafted with care.
            </p>
            <p className="text-text-secondary leading-relaxed mb-8">
              The goal is simple: make something useful, make it beautiful, and share it
              with the world. All features are completely free — no paywalls, no premium
              tiers, just open creativity.
            </p>
            <a
              href="#docs"
              className="inline-flex items-center gap-2 text-accent hover:text-accent-light transition-colors text-sm font-medium"
            >
              Read the documentation
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Right: Stats */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-bg-card/50 border border-border-subtle text-center hover:border-accent/20 transition-colors"
              >
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
