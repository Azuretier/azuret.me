'use client'

import { useEffect, useRef } from 'react'

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
      color: string
    }> = []

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    const colors = ['#5865F2', '#7289DA', '#57F287', '#FEE75C', '#EB459E']

    const init = () => {
      resize()
      particles.length = 0
      for (let i = 0; i < 60; i++) {
        particles.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.3 + 0.1,
          color: colors[Math.floor(Math.random() * colors.length)],
        })
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > canvas.offsetWidth) p.vx *= -1
        if (p.y < 0 || p.y > canvas.offsetHeight) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.fill()
      })

      // Draw connections
      ctx.globalAlpha = 1
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = '#5865F2'
            ctx.globalAlpha = (1 - dist / 120) * 0.08
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      ctx.globalAlpha = 1
      animationId = requestAnimationFrame(animate)
    }

    init()
    animate()

    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.6 }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#5865F2]/5 via-transparent to-[#0a0a0f]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#5865F2]/8 blur-[120px]" />

      {/* Content */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/20 mb-8">
          <span className="w-2 h-2 rounded-full bg-[#57F287] animate-pulse" />
          <span className="text-xs font-medium text-[#8888a0]">
            v14.16.3 リリース済み
          </span>
          <span className="text-xs text-[#5865F2]">→</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
          <span className="bg-gradient-to-r from-white via-white to-[#8888a0] bg-clip-text text-transparent">
            強力な
          </span>
          <br />
          <span className="bg-gradient-to-r from-[#5865F2] to-[#7289DA] bg-clip-text text-transparent">
            Discord Bot
          </span>
          <br />
          <span className="bg-gradient-to-r from-white via-white to-[#8888a0] bg-clip-text text-transparent">
            フレームワーク
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-lg mx-auto text-[#8888a0] text-lg leading-relaxed mb-10">
          discord.jsは、Discord APIと簡単にやり取りできる、
          強力なNode.jsモジュールです。TypeScriptで完全にサポートされています。
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#guide"
            className="px-8 py-3 text-sm font-semibold bg-[#5865F2] text-white rounded-xl hover:bg-[#4752C4] transition-all duration-200 hover:shadow-lg hover:shadow-[#5865F2]/25 hover:-translate-y-0.5"
          >
            はじめる
          </a>
          <a
            href="#docs"
            className="px-8 py-3 text-sm font-semibold text-[#e8e8f0] bg-white/5 border border-[#2a2a3a] rounded-xl hover:bg-white/10 hover:border-[#3a3a4a] transition-all duration-200 hover:-translate-y-0.5"
          >
            ドキュメント
          </a>
        </div>

        {/* Install snippet */}
        <div className="mt-12 inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-[#12121a] border border-[#2a2a3a]">
          <span className="text-[#57F287] font-mono text-sm">$</span>
          <code className="font-mono text-sm text-[#e8e8f0]">npm install discord.js</code>
          <button
            className="p-1 text-[#55556a] hover:text-[#5865F2] transition-colors cursor-pointer"
            onClick={() => navigator.clipboard.writeText('npm install discord.js')}
            title="コピー"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
          </button>
        </div>

        {/* Stats row */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">25M+</div>
            <div className="text-xs text-[#55556a] mt-1">毎週のダウンロード</div>
          </div>
          <div className="w-px h-8 bg-[#2a2a3a] hidden sm:block" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">15K+</div>
            <div className="text-xs text-[#55556a] mt-1">GitHub Stars</div>
          </div>
          <div className="w-px h-8 bg-[#2a2a3a] hidden sm:block" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">400+</div>
            <div className="text-xs text-[#55556a] mt-1">コントリビューター</div>
          </div>
          <div className="w-px h-8 bg-[#2a2a3a] hidden sm:block" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">100%</div>
            <div className="text-xs text-[#55556a] mt-1">TypeScript</div>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
    </section>
  )
}
