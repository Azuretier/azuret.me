'use client'

import { useState, useEffect } from 'react'

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#about', label: 'About' },
  { href: '#docs', label: 'Docs' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-bg-primary/70 backdrop-blur-2xl shadow-[0_1px_0_0_rgba(42,42,58,0.6)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-[64px]">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-accent-glow/20">
              A
            </div>
            <span className="text-[15px] font-semibold text-text-primary group-hover:text-accent-light transition-colors duration-200">
              azuret.me
            </span>
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-[13px] font-medium text-text-secondary hover:text-text-primary rounded-lg hover:bg-white/[0.04] transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
            <div className="w-px h-5 bg-border-subtle mx-2" />
            <a
              href="#get-started"
              className="ml-1 text-[13px] font-medium px-5 py-2 rounded-lg bg-accent hover:bg-accent-light text-white transition-all duration-200 shadow-sm shadow-accent/20 hover:shadow-md hover:shadow-accent/30"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileOpen ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M6 18L18 6" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? 'max-h-[280px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-bg-secondary/95 backdrop-blur-2xl border-t border-border-subtle">
          <div className="max-w-[1200px] mx-auto px-6 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2.5 text-[14px] text-text-secondary hover:text-text-primary rounded-lg hover:bg-white/[0.04] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 pt-3 border-t border-border-subtle">
              <a
                href="#get-started"
                className="block text-[14px] font-medium px-4 py-2.5 rounded-lg bg-accent hover:bg-accent-light text-white transition-colors text-center"
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
