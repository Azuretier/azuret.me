'use client'

import { useEffect, useRef, useCallback } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  color: string
  pulse: number
  pulseSpeed: number
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)
  const dprRef = useRef(1)

  const createParticles = useCallback((width: number, height: number) => {
    const count = Math.min(Math.floor((width * height) / 15000), 100)
    const colors = [
      'rgba(91, 110, 225,',
      'rgba(225, 91, 160,',
      'rgba(123, 142, 241,',
      'rgba(160, 91, 225,',
    ]
    const particles: Particle[] = []

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 1.8 + 0.5,
        opacity: Math.random() * 0.4 + 0.08,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.015 + 0.004,
      })
    }
    return particles
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      dprRef.current = dpr
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      particlesRef.current = createParticles(w, h)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 }
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseleave', handleMouseLeave)

    const w = () => canvas.width / dprRef.current
    const h = () => canvas.height / dprRef.current

    const animate = () => {
      const cw = w()
      const ch = h()
      ctx.clearRect(0, 0, cw, ch)

      const particles = particlesRef.current
      const mouse = mouseRef.current
      const connectionDistance = 140
      const mouseRadius = 180

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < mouseRadius && dist > 0) {
          const force = (mouseRadius - dist) / mouseRadius
          p.vx += dx * force * 0.0006
          p.vy += dy * force * 0.0006
        }

        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.997
        p.vy *= 0.997

        if (p.x < -10) p.x = cw + 10
        if (p.x > cw + 10) p.x = -10
        if (p.y < -10) p.y = ch + 10
        if (p.y > ch + 10) p.y = -10

        p.pulse += p.pulseSpeed
        const currentOpacity = p.opacity + Math.sin(p.pulse) * 0.12

        // Particle dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color + Math.max(0.04, currentOpacity) + ')'
        ctx.fill()

        // Glow
        if (p.radius > 1) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2)
          ctx.fillStyle = p.color + Math.max(0.01, currentOpacity * 0.12) + ')'
          ctx.fill()
        }

        // Particle-to-particle connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const cdx = p.x - p2.x
          const cdy = p.y - p2.y
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy)

          if (cdist < connectionDistance) {
            const lineOpacity = (1 - cdist / connectionDistance) * 0.1
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(91, 110, 225, ${lineOpacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }

        // Mouse connection
        if (dist < mouseRadius && dist > 0) {
          const lineOpacity = (1 - dist / mouseRadius) * 0.15
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.strokeStyle = `rgba(225, 91, 160, ${lineOpacity})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationRef.current)
    }
  }, [createParticles])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}
