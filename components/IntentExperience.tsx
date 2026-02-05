'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import type { Mesh, WebGLRenderer } from 'three'
import styles from './IntentExperience.module.css'

type IntentExperienceProps = {
  onComplete?: () => void
}

type WebGpuRendererType = new (options: {
  canvas: HTMLCanvasElement
  antialias?: boolean
  alpha?: boolean
}) => { init?: () => Promise<unknown> }

function FloatingDialog() {
  const meshRef = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (!mesh) return
    const time = clock.getElapsedTime()
    mesh.position.y = Math.sin(time * 0.8) * 0.15
    mesh.rotation.y = Math.sin(time * 0.4) * 0.25
    mesh.rotation.x = Math.cos(time * 0.3) * 0.15
  })

  return (
    <group>
      <mesh ref={meshRef}>
        <boxGeometry args={[2.8, 1.5, 0.1]} />
        <meshStandardMaterial
          color="#0b0b0b"
          emissive="#1d1d1d"
          metalness={0.15}
          roughness={0.3}
        />
      </mesh>
      <mesh scale={1.03}>
        <boxGeometry args={[2.8, 1.5, 0.1]} />
        <meshStandardMaterial color="#ffffff" opacity={0.06} transparent />
      </mesh>
    </group>
  )
}

export default function IntentExperience({ onComplete }: IntentExperienceProps) {
  const [intent, setIntent] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [webGpuRenderer, setWebGpuRenderer] = useState<WebGpuRendererType | null>(null)

  const webGpuSupported = useMemo(() => {
    if (typeof navigator === 'undefined') return false
    return 'gpu' in navigator
  }, [])

  useEffect(() => {
    if (!webGpuSupported) return
    let active = true
    import('three/webgpu')
      .then((module) => {
        if (!active) return
        const rendererModule = module as unknown as {
          WebGPURenderer?: WebGpuRendererType
          default?: WebGpuRendererType
        }
        const renderer = rendererModule.WebGPURenderer ?? rendererModule.default
        if (renderer) {
          setWebGpuRenderer(() => renderer)
        }
      })
      .catch(() => null)

    return () => {
      active = false
    }
  }, [webGpuSupported])

  if (dismissed) return null

  const trimmedIntent = intent.trim()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!trimmedIntent) return
    setSubmitted(true)
  }

  const handleComplete = () => {
    setDismissed(true)
    onComplete?.()
  }

  const webGpuReady = Boolean(webGpuRenderer && webGpuSupported)
  const glRenderer = webGpuRenderer
    ? ((canvas: HTMLCanvasElement | OffscreenCanvas) =>
        new webGpuRenderer({
          canvas: canvas as HTMLCanvasElement,
          antialias: true,
          alpha: true,
        }) as unknown as WebGLRenderer)
    : undefined

  return (
    <section className={styles.intro} aria-live="polite">
      <div className={styles.panel}>
        {!submitted ? (
          <form className={styles.intentForm} onSubmit={handleSubmit}>
            <span className={styles.kicker}>PERSONALIZE YOUR ENTRY</span>
            <h1 className={styles.title}>A quiet space to set your intention.</h1>
            <p className={styles.subtitle}>
              Share why you&apos;re here so we can tune the experience to you.
            </p>
            <label className={styles.label} htmlFor="intent-input">
              Your intent
            </label>
            <input
              id="intent-input"
              className={styles.intentInput}
              type="text"
              value={intent}
              onChange={(event) => setIntent(event.target.value)}
              placeholder="e.g. Focused creativity, calm exploration"
              maxLength={80}
              required
            />
            <button className={styles.intentButton} type="submit">
              Begin the experience
            </button>
          </form>
        ) : (
          <div className={styles.result}>
            <div className={styles.canvasWrap}>
              {webGpuReady ? (
                <Canvas
                  className={styles.canvas}
                  camera={{ position: [0, 0, 4], fov: 35 }}
                  dpr={[1, 2]}
                  gl={glRenderer}
                  onCreated={({ gl }) => {
                    void (gl as { init?: () => Promise<unknown> }).init?.()
                  }}
                >
                  <ambientLight intensity={0.6} />
                  <directionalLight position={[2, 2, 3]} intensity={0.8} />
                  <FloatingDialog />
                </Canvas>
              ) : (
                <Canvas className={styles.canvas} camera={{ position: [0, 0, 4], fov: 35 }} dpr={[1, 2]}>
                  <ambientLight intensity={0.6} />
                  <directionalLight position={[2, 2, 3]} intensity={0.8} />
                  <FloatingDialog />
                </Canvas>
              )}
              <div className={styles.dialogContent}>
                <span className={styles.dialogLabel}>Intent detected</span>
                <p className={styles.dialogTitle}>{trimmedIntent}</p>
                <p className={styles.dialogSubtitle}>
                  We&apos;ll shape a personalized journey with this focus.
                </p>
              </div>
              <div className={styles.webGpuBadge}>
                {webGpuReady ? 'WebGPU active' : 'WebGPU ready'}
              </div>
            </div>
            <button className={styles.enterButton} type="button" onClick={handleComplete}>
              Enter the site
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
