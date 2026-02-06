'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import styles from './page.module.css'

import KatanaFairyTypewriter from '@/src/components/stable-happiness-v3.9';
import CustomCursor from '@/src/components/stable-happiness-v2.5/CustomCursor'
import FloatingParticles from '@/src/components/stable-happiness-v2.5/FloatingParticles'
import NavigationDots from '@/src/components/stable-happiness-v2.5/NavigationDots'
import HeroSection from '@/src/components/stable-happiness-v2.5/HeroSection'
import AboutSection from '@/src/components/stable-happiness-v2.5/AboutSection'
import WorksSection from '@/src/components/stable-happiness-v2.5/WorksSection'
import PhilosophySection from '@/src/components/stable-happiness-v2.5/PhilosophySection'
import ContactSection from '@/src/components/stable-happiness-v2.5/ContactSection'
const IntentExperience = dynamic(() => import('@/src/components/stable-happiness-v2.5/IntentExperience'), {
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
          <KatanaFairyTypewriter />
        </>
      )}
    </main>
  )
}
