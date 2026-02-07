'use client'

import { useEffect, useRef } from 'react'

export default function HeroSection() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const elements = [titleRef.current, subtitleRef.current, ctaRef.current]
    elements.forEach((el, i) => {
      if (el) {
        el.style.opacity = '0'
        el.style.transform = 'translateY(30px)'
        setTimeout(() => {
          el.style.transition = 'opacity 0.8s ease, transform 0.8s ease'
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
        }, 200 + i * 200)
      }
    })
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bg-card border border-border-subtle text-xs text-text-secondary mb-8">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          Documentation Site
        </div>

        <h1
          ref={titleRef}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
        >
          <span className="bg-gradient-to-r from-accent via-accent-light to-accent-secondary bg-clip-text text-transparent">
            azuret
          </span>
          <span className="text-text-muted">.me</span>
        </h1>

        <p
          ref={subtitleRef}
          className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          A life spelled out in code, creativity, and connection.
          <br className="hidden md:block" />
          Explore the documentation for everything that makes up{' '}
          <span className="text-accent">azuret.me</span>.
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#get-started"
            className="group px-8 py-3 rounded-xl bg-gradient-to-r from-accent to-accent-secondary text-white font-medium text-sm transition-all hover:shadow-lg hover:shadow-accent-glow hover:-translate-y-0.5"
          >
            Get Started
            <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">&rarr;</span>
          </a>
          <a
            href="#features"
            className="px-8 py-3 rounded-xl border border-border-subtle text-text-secondary font-medium text-sm hover:bg-bg-card hover:text-text-primary transition-all"
          >
            Learn More
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs text-text-muted">Scroll</span>
          <div className="w-5 h-8 rounded-full border border-border-subtle flex justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-accent animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  )
}
