'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import styles from './page.module.css'
import CustomCursor from '@/components/CustomCursor'
import FloatingParticles from '@/components/FloatingParticles'
import NavigationDots from '@/components/NavigationDots'
import HeroSection from '@/components/HeroSection'
import AboutSection from '@/components/AboutSection'
import WorksSection from '@/components/WorksSection'
import PhilosophySection from '@/components/PhilosophySection'
import ContactSection from '@/components/ContactSection'
const IntentExperience = dynamic(() => import('@/components/IntentExperience'), {
  ssr: false,
})

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false)

  return (
    <main className={styles.main}>
      <IntentExperience onComplete={() => setIntroComplete(true)} />
      {introComplete && (
        <>
          <CustomCursor />
          <FloatingParticles />
          <NavigationDots />

          <HeroSection />
          <AboutSection />
          <WorksSection />
          <PhilosophySection />
          <ContactSection />
        </>
      )}
    </main>
  )
}
