import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'discord.js | 強力なDiscord Botフレームワーク',
  description: 'discord.jsは、Discord APIと簡単にやり取りできる、強力なNode.jsモジュールです。TypeScriptで完全にサポートされています。',
  icons: {
    icon: '/favicon.ico',
  },
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
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+JP:wght@300;400;500;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
