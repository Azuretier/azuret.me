'use client'

export default function CTASection() {
  return (
    <section id="get-started" className="relative py-24 md:py-32 px-6 lg:px-8">
      {/* Glow — parent is relative, so this works */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[280px] bg-accent/6 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-2xl mx-auto text-center">
        <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-tight mb-5">
          Ready to explore{' '}
          <span className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
            azuret.me
          </span>
          ?
        </h2>
        <p className="text-text-secondary max-w-md mx-auto mb-10 text-[15px] leading-relaxed">
          Dive into the docs, explore the features, and see what makes this project tick.
          Everything is free and open.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="#docs"
            className="group inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-light text-white font-medium text-sm transition-all duration-300 hover:shadow-[0_8px_30px_-4px_rgba(91,110,225,0.4)] hover:-translate-y-0.5"
          >
            Read the Docs
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl border border-border-subtle text-text-secondary font-medium text-sm hover:bg-bg-card/60 hover:text-text-primary hover:border-border-accent/30 transition-all duration-200"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </section>
  )
}
