'use client'

import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues with Three.js
const KatanaStableHappiness = dynamic(
  () => import('./katana-stable-happiness'),
  { ssr: false }
)

export default function Home() {
  return <KatanaStableHappiness />
}
