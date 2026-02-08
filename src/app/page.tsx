'use client'

import { useState } from 'react'
import Header from '@/src/components/discord/Header'
import SearchModal from '@/src/components/discord/SearchModal'
import Hero from '@/src/components/discord/Hero'
import Features from '@/src/components/discord/Features'
import CodeShowcase from '@/src/components/discord/CodeShowcase'
import Stats from '@/src/components/discord/Stats'
import Community from '@/src/components/discord/Community'
import Footer from '@/src/components/discord/Footer'

export default function Home() {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <Header onSearchOpen={() => setSearchOpen(true)} />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <main>
        <Hero />
        <Features />
        <CodeShowcase />
        <Stats />
        <Community />
      </main>
      <Footer />
    </>
  )
}
