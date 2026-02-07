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
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <div className="section-divider" />
        <FeaturesSection />
        <div className="section-divider" />
        <AboutSection />
        <div className="section-divider" />
        <DocsSection />
        <div className="section-divider" />
        <CTASection />
      </main>
      <footer className="relative z-10">
        <Footer />
      </footer>
    </div>
  )
}
