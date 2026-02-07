'use client'

import { useEffect, useRef } from 'react'

const docCategories = [
  {
    title: 'Getting Started',
    description: 'Quick setup guide to get up and running.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    links: ['Introduction', 'Installation', 'Quick Start', 'Configuration'],
  },
  {
    title: 'Core Concepts',
    description: 'Understand the fundamentals and architecture.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    links: ['Architecture', 'Components', 'Routing', 'State Management'],
  },
  {
    title: 'Features',
    description: 'Deep dive into all available features.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    links: ['Interactive Background', 'Dashboard', 'Themes', 'Customization'],
  },
  {
    title: 'API Reference',
    description: 'Complete API documentation and examples.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    links: ['Endpoints', 'Authentication', 'Rate Limits', 'Webhooks'],
  },
]

export default function DocsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true
            const cards = entry.target.querySelectorAll<HTMLElement>('[data-doc-card]')
            cards.forEach((el, i) => {
              setTimeout(() => {
                el.classList.add('animate-fade-in-up')
              }, i * 100)
            })
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    )

    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="docs" ref={sectionRef} className="relative py-24 md:py-32 px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase text-accent mb-3">
            Documentation
          </span>
          <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-tight mb-4">
            Explore the docs
          </h2>
          <p className="text-text-secondary max-w-md mx-auto text-[15px] leading-relaxed">
            Comprehensive documentation to help you understand and use everything azuret.me has to offer.
          </p>
        </div>

        {/* Doc Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {docCategories.map((category, i) => (
            <div
              key={i}
              data-doc-card
              className="group p-5 md:p-6 rounded-2xl bg-bg-card/40 border border-border-subtle hover:border-accent/25 hover:bg-bg-card-hover/60 transition-all duration-300 opacity-0"
            >
              {/* Card Header */}
              <div className="flex items-start gap-3.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0 group-hover:bg-accent/15 transition-colors duration-300">
                  {category.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold text-text-primary mb-0.5">
                    {category.title}
                  </h3>
                  <p className="text-[13px] text-text-secondary leading-snug">
                    {category.description}
                  </p>
                </div>
              </div>

              {/* Tag Pills — aligned to content, not icon */}
              <div className="flex flex-wrap gap-1.5 pl-[52px]">
                {category.links.map((link, j) => (
                  <span
                    key={j}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-bg-primary/60 border border-border-subtle text-text-muted hover:text-accent hover:border-accent/25 transition-colors duration-200 cursor-pointer"
                  >
                    {link}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
