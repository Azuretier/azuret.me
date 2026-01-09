import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '安定した幸せ - A Personal Journey',
  description: 'A journey of stable happiness through creation and harmony',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;600;800&family=EB+Garamond:ital,wght@0,400;1,400&family=Zen+Kaku+Gothic+New:wght@300;400;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
