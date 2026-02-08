import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'azuret.me - Links',
  description: 'All my social links in one place — X, GitHub, Discord, and more.',
}

export default function LinksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
