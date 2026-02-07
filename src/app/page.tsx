'use client'

import AnimatedBackground from '@/src/components/AnimatedBackground'
import Navbar from '@/src/components/Navbar'
import HeroSection from '@/src/components/HeroSection'
import FeaturesSection from '@/src/components/FeaturesSection'
import AboutSection from '@/src/components/AboutSection'
import DocsSection from '@/src/components/DocsSection'
import CTASection from '@/src/components/CTASection'
import Footer from '@/src/components/Footer'

export default function Home() {
  return (
    <>
      <AnimatedBackground />
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <AboutSection />
        <DocsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
