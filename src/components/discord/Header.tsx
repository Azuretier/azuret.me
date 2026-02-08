'use client'

import { useState, useEffect } from 'react'

interface HeaderProps {
  onSearchOpen: () => void
}

export default function Header({ onSearchOpen }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onSearchOpen()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSearchOpen])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-[#1e1e2e]'
          : 'border-b border-transparent'
      }`}
      style={{
        backgroundColor: scrolled ? 'rgba(10, 10, 15, 0.8)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(1.2)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.2)' : 'none',
      }}
    >
      <nav className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#5865F2] flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <svg width="18" height="14" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.3052 54.5139 18.3638 54.4378C19.7295 52.4868 20.9105 50.4159 21.9099 48.2326C21.9661 48.1198 21.9127 47.9878 21.7963 47.9411C19.7756 47.1726 17.8536 46.2316 16.0062 45.1555C15.8764 45.0807 15.8653 44.8953 15.9838 44.8063C16.3742 44.514 16.7647 44.2106 17.1383 43.9044C17.1775 43.8724 17.2307 43.8668 17.2754 43.8878C28.7504 49.0939 41.3255 49.0939 52.6713 43.8878C52.716 43.864 52.7692 43.8696 52.8112 43.9016C53.1848 44.2078 53.5753 44.514 53.9685 44.8063C54.087 44.8953 54.0787 45.0807 53.9489 45.1555C52.1015 46.2512 50.1795 47.1726 48.156 47.9383C48.0396 47.985 47.989 48.1198 48.0452 48.2326C49.0674 50.4131 50.2428 52.484 51.6191 54.435C51.6658 54.5139 51.7667 54.5505 51.8591 54.5195C57.6606 52.7249 63.5432 50.0174 69.6161 45.5576C69.6693 45.5182 69.7029 45.459 69.7085 45.3942C71.1901 30.0564 67.2908 16.7573 60.1885 4.9823C60.169 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="white"/>
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight">
            discord.js
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          <a href="#features" className="px-3 py-2 text-sm text-[#8888a0] hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5">
            機能
          </a>
          <a href="#guide" className="px-3 py-2 text-sm text-[#8888a0] hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5">
            ガイド
          </a>
          <a href="#docs" className="px-3 py-2 text-sm text-[#8888a0] hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5">
            ドキュメント
          </a>
          <a href="#community" className="px-3 py-2 text-sm text-[#8888a0] hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5">
            コミュニティ
          </a>
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {/* Search */}
          <button
            onClick={onSearchOpen}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#55556a] bg-[#12121a] border border-[#2a2a3a] rounded-lg hover:border-[#3a3a4a] hover:text-[#8888a0] transition-all duration-200 cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <span>検索...</span>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a1a25] border border-[#2a2a3a] font-mono">⌘K</kbd>
          </button>

          {/* GitHub */}
          <a
            href="https://github.com/discordjs/discord.js"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-[#8888a0] hover:text-white transition-colors duration-200"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>

          {/* Discord */}
          <a
            href="https://discord.gg/djs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 text-sm font-medium bg-[#5865F2] text-white rounded-lg hover:bg-[#4752C4] transition-colors duration-200"
          >
            Discord
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-[#8888a0] hover:text-white transition-colors cursor-pointer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t border-[#1e1e2e] px-6 py-4 space-y-1"
          style={{
            backgroundColor: 'rgba(10, 10, 15, 0.95)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <a href="#features" className="block px-3 py-2.5 text-sm text-[#8888a0] hover:text-white transition-colors rounded-lg hover:bg-white/5">
            機能
          </a>
          <a href="#guide" className="block px-3 py-2.5 text-sm text-[#8888a0] hover:text-white transition-colors rounded-lg hover:bg-white/5">
            ガイド
          </a>
          <a href="#docs" className="block px-3 py-2.5 text-sm text-[#8888a0] hover:text-white transition-colors rounded-lg hover:bg-white/5">
            ドキュメント
          </a>
          <a href="#community" className="block px-3 py-2.5 text-sm text-[#8888a0] hover:text-white transition-colors rounded-lg hover:bg-white/5">
            コミュニティ
          </a>
          <div className="pt-3 border-t border-[#1e1e2e] flex gap-2">
            <button
              onClick={() => { onSearchOpen(); setMobileMenuOpen(false) }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-[#8888a0] bg-[#12121a] border border-[#2a2a3a] rounded-lg cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
              検索
            </button>
            <a
              href="https://discord.gg/djs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium bg-[#5865F2] text-white rounded-lg"
            >
              Discord
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
