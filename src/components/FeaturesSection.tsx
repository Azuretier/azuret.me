'use client'

import { useEffect, useRef } from 'react'

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: 'Modular Design',
    description: 'Clean, modular components organized into logical layers that work together seamlessly.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: 'High Performance',
    description: 'Optimized for speed with smooth 60fps interactions and minimal bundle overhead.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
        <path d="M9 21V9" />
      </svg>
    ),
    title: 'Rich Dashboard',
    description: 'Centralized dashboard to manage and configure every feature in one place.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Secure & Private',
    description: 'Security-first approach with best practices baked into every layer of the stack.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    title: 'Open & Accessible',
    description: 'Fully open source, designed for accessibility, and welcoming to contributors.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    title: 'Full Documentation',
    description: 'Comprehensive docs with guides, examples, and reference material for every feature.',
  },
]

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true
            const cards = entry.target.querySelectorAll<HTMLElement>('[data-feature-card]')
            cards.forEach((el, i) => {
              setTimeout(() => {
                el.classList.add('animate-fade-in-up')
              }, i * 80)
            })
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    )

    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" ref={sectionRef} className="relative py-24 md:py-32 px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase text-accent mb-3">
            Features
          </span>
          <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-tight mb-4">
            Everything you need
          </h2>
          <p className="text-text-secondary max-w-md mx-auto text-[15px] leading-relaxed">
            A complete set of features designed for the best experience, all completely free.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {features.map((feature, i) => (
            <div
              key={i}
              data-feature-card
              className="group relative p-6 rounded-2xl bg-bg-card/40 border border-border-subtle hover:border-accent/25 hover:bg-bg-card-hover/60 transition-all duration-300 hover:-translate-y-0.5 opacity-0"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4 group-hover:bg-accent/15 transition-colors duration-300">
                {feature.icon}
              </div>
              <h3 className="text-[15px] font-semibold mb-2 text-text-primary">
                {feature.title}
              </h3>
              <p className="text-[13px] text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
