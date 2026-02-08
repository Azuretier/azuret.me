'use client'

const packages = [
  {
    name: 'discord.js',
    description: 'メインライブラリ - Discord APIの完全なラッパー',
    version: '14.16.3',
    downloads: '2.1M/週',
    status: '安定',
    statusColor: '#57F287',
  },
  {
    name: '@discordjs/rest',
    description: 'Discord REST APIクライアント',
    version: '2.4.2',
    downloads: '1.8M/週',
    status: '安定',
    statusColor: '#57F287',
  },
  {
    name: '@discordjs/voice',
    description: 'ボイスチャンネル接続ライブラリ',
    version: '0.18.0',
    downloads: '450K/週',
    status: '安定',
    statusColor: '#57F287',
  },
  {
    name: '@discordjs/builders',
    description: 'スラッシュコマンド・UIコンポーネントビルダー',
    version: '1.10.0',
    downloads: '1.6M/週',
    status: '安定',
    statusColor: '#57F287',
  },
  {
    name: '@discordjs/collection',
    description: '拡張Mapユーティリティ',
    version: '2.1.1',
    downloads: '2.0M/週',
    status: '安定',
    statusColor: '#57F287',
  },
  {
    name: '@discordjs/ws',
    description: 'Discord Gateway WebSocketクライアント',
    version: '1.1.2',
    downloads: '1.5M/週',
    status: 'Beta',
    statusColor: '#FEE75C',
  },
]

export default function Stats() {
  return (
    <section id="docs" className="relative py-24 md:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#5865F2]/3 to-transparent" />

      <div className="relative max-w-[1200px] mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/20 mb-4">
            <span className="text-xs font-medium text-[#5865F2]">パッケージ</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            モジュラーアーキテクチャ
          </h2>
          <p className="max-w-md mx-auto text-[#8888a0] text-base">
            必要な機能だけを選んでインストール。軽量で柔軟な構成が可能です。
          </p>
        </div>

        {/* Packages grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg, i) => (
            <div
              key={i}
              className="group p-5 rounded-xl bg-[#12121a]/80 border border-[#2a2a3a] hover:border-[#5865F2]/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#5865F2]/10 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5865F2" strokeWidth="1.5">
                      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                      <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
                      <line x1="12" y1="22.08" x2="12" y2="12"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white font-mono">{pkg.name}</h3>
                    <span className="text-[10px] text-[#55556a] font-mono">v{pkg.version}</span>
                  </div>
                </div>
                <span
                  className="px-2 py-0.5 text-[10px] font-medium rounded-full border"
                  style={{
                    color: pkg.statusColor,
                    backgroundColor: `${pkg.statusColor}10`,
                    borderColor: `${pkg.statusColor}30`,
                  }}
                >
                  {pkg.status}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-[#8888a0] mb-4 leading-relaxed">
                {pkg.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-[#2a2a3a]">
                <span className="text-xs text-[#55556a]">
                  <span className="text-[#57F287]">↓</span> {pkg.downloads}
                </span>
                <a
                  href="#"
                  className="text-xs text-[#5865F2] hover:text-[#7289DA] transition-colors"
                >
                  npm →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
