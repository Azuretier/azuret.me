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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('[data-doc-card]')
            cards.forEach((card, i) => {
              const el = card as HTMLElement
              setTimeout(() => {
                el.style.opacity = '1'
                el.style.transform = 'translateY(0)'
              }, i * 120)
            })
          }
        })
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="docs" ref={sectionRef} className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-medium tracking-widest uppercase text-accent mb-4 block">
            Documentation
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Explore the docs
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Comprehensive documentation to help you understand and use everything
            azuret.me has to offer.
          </p>
        </div>

        {/* Doc Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {docCategories.map((category, i) => (
            <div
              key={i}
              data-doc-card
              className="group p-6 rounded-2xl bg-bg-card/50 border border-border-subtle hover:border-accent/30 hover:bg-bg-card-hover transition-all duration-300"
              style={{
                opacity: 0,
                transform: 'translateY(20px)',
                transition: 'opacity 0.6s ease, transform 0.6s ease, border-color 0.3s, background-color 0.3s',
              }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                  {category.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    {category.title}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {category.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 ml-14">
                {category.links.map((link, j) => (
                  <span
                    key={j}
                    className="text-xs px-3 py-1 rounded-full bg-bg-primary/80 border border-border-subtle text-text-muted hover:text-accent hover:border-accent/30 transition-colors cursor-pointer"
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
