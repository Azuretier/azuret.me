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
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true
            const els = entry.target.querySelectorAll<HTMLElement>('[data-animate]')
            els.forEach((el, i) => {
              setTimeout(() => {
                el.classList.add('animate-fade-in-up')
              }, i * 100)
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
    <section id="about" ref={sectionRef} className="relative py-24 md:py-32 px-6 lg:px-8">
      {/* Subtle background tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-secondary/30 via-bg-secondary/50 to-bg-secondary/30 pointer-events-none" />

      <div className="relative max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-20 items-center">
          {/* Left: Text Content */}
          <div className="max-w-xl">
            <div data-animate className="opacity-0">
              <span className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase text-accent-secondary mb-3">
                About
              </span>
            </div>
            <h2 data-animate className="text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-tight mb-6 opacity-0">
              Built with{' '}
              <span className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
                passion
              </span>
            </h2>
            <p data-animate className="text-text-secondary leading-relaxed mb-5 text-[15px] opacity-0">
              azuret.me is more than a website — it&apos;s a living document of ideas,
              projects, and the journey of building things that matter. From interactive
              experiences to practical tools, everything here is crafted with care.
            </p>
            <p data-animate className="text-text-secondary leading-relaxed mb-8 text-[15px] opacity-0">
              The goal is simple: make something useful, make it beautiful, and share it
              with the world. All features are completely free — no paywalls, no premium
              tiers, just open creativity.
            </p>
            <div data-animate className="opacity-0">
              <a
                href="#docs"
                className="group inline-flex items-center gap-2 text-accent hover:text-accent-light transition-colors text-[14px] font-medium"
              >
                Read the documentation
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right: Stats Grid */}
          <div className="grid grid-cols-2 gap-3 w-full lg:w-[320px]">
            {stats.map((stat, i) => (
              <div
                key={i}
                data-animate
                className="p-5 rounded-2xl bg-bg-card/40 border border-border-subtle text-center hover:border-accent/20 transition-colors duration-300 opacity-0"
              >
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent mb-0.5 leading-tight">
                  {stat.value}
                </div>
                <div className="text-[12px] text-text-muted font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
