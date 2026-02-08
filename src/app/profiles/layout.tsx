import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profiles — azuret.me',
  description: 'Community profiles at azuret.me — create yours and join the community.',
}

export default function ProfilesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
