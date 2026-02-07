'use client'

import { useEffect, useRef } from 'react'

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const els = container.querySelectorAll<HTMLElement>('[data-animate]')
    els.forEach((el, i) => {
      el.style.opacity = '0'
      el.style.transform = 'translateY(28px)'
      setTimeout(() => {
        el.style.transition = 'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)'
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
      }, 150 + i * 150)
    })
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col">
      {/* Gradient orbs — positioned relative to section, not content */}
      <div className="absolute top-[20%] left-[15%] w-[420px] h-[420px] bg-accent/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[15%] right-[10%] w-[380px] h-[380px] bg-accent-secondary/6 rounded-full blur-[140px] pointer-events-none" />

      {/* Content — vertically centered with navbar offset */}
      <div className="flex-1 flex items-center justify-center pt-[64px] px-6 lg:px-8">
        <div ref={containerRef} className="relative z-10 text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div data-animate className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bg-card/80 border border-border-subtle text-xs text-text-secondary mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Documentation Site
          </div>

          {/* Title */}
          <h1 data-animate className="text-[clamp(2.5rem,8vw,5.5rem)] font-bold tracking-[-0.03em] leading-[1.05] mb-5">
            <span className="bg-gradient-to-r from-accent via-accent-light to-accent-secondary bg-clip-text text-transparent">
              azuret
            </span>
            <span className="text-text-muted">.me</span>
          </h1>

          {/* Subtitle */}
          <p data-animate className="text-[clamp(1rem,2.5vw,1.2rem)] text-text-secondary max-w-xl mx-auto mb-10 leading-relaxed">
            A life spelled out in code, creativity, and connection.
            <br className="hidden sm:block" />
            Explore the documentation for everything that makes up{' '}
            <span className="text-accent font-medium">azuret.me</span>.
          </p>

          {/* CTAs */}
          <div data-animate className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#get-started"
              className="group inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-light text-white font-medium text-sm transition-all duration-300 hover:shadow-[0_8px_30px_-4px_rgba(91,110,225,0.4)] hover:-translate-y-0.5"
            >
              Get Started
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl border border-border-subtle text-text-secondary font-medium text-sm hover:bg-bg-card/60 hover:text-text-primary hover:border-border-accent/30 transition-all duration-200"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator — pinned to bottom of the section */}
      <div className="relative z-10 flex flex-col items-center gap-2 pb-8 pt-4">
        <span className="text-[11px] tracking-wider uppercase text-text-muted">Scroll</span>
        <div className="w-[22px] h-[34px] rounded-full border border-border-subtle/70 flex justify-center pt-2">
          <div className="w-[3px] h-[6px] rounded-full bg-accent/60 animate-bounce" />
        </div>
      </div>
    </section>
  )
}
