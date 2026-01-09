'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './page.module.css'
import CustomCursor from '@/components/CustomCursor'
import FloatingParticles from '@/components/FloatingParticles'
import NavigationDots from '@/components/NavigationDots'
import HeroSection from '@/components/HeroSection'
import AboutSection from '@/components/AboutSection'
import WorksSection from '@/components/WorksSection'
import PhilosophySection from '@/components/PhilosophySection'
import ContactSection from '@/components/ContactSection'

export default function Home() {
  return (
    <main className={styles.main}>
      <CustomCursor />
      <FloatingParticles />
      <NavigationDots />
      
      <HeroSection />
      <AboutSection />
      <WorksSection />
      <PhilosophySection />
      <ContactSection />
    </main>
  )
}
