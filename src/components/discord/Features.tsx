'use client'

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
    title: '高速で軽量',
    description: '最小限のオーバーヘッドで最大のパフォーマンスを実現。Discordの全APIを効率的にカバーします。',
    badge: null,
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16,18 22,12 16,6"/>
        <polyline points="8,6 2,12 8,18"/>
      </svg>
    ),
    title: 'TypeScript対応',
    description: '完全なTypeScript型定義を搭載。IDEのインテリセンスで快適な開発体験を提供します。',
    badge: null,
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: '信頼性の高い接続',
    description: '自動再接続とレートリミット処理で、安定したBot運用を実現します。',
    badge: (
      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#57F287]/10 text-[#57F287] border border-[#57F287]/20">
        安定
      </span>
    ),
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="9" y1="21" x2="9" y2="9"/>
      </svg>
    ),
    title: 'ビルダーパターン',
    description: '直感的なビルダーパターンで、複雑なメッセージやインタラクションを簡単に構築できます。',
    badge: (
      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#5865F2]/10 text-[#5865F2] border border-[#5865F2]/20">
        New
      </span>
    ),
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
        <path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    title: 'シャーディング',
    description: '大規模なBotのためのシャーディングサポート。数百万のギルドにスケーリング可能です。',
    badge: null,
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
      </svg>
    ),
    title: 'REST & WebSocket',
    description: 'Discord REST APIとGateway WebSocketの両方を完全にカバーする包括的なライブラリです。',
    badge: null,
  },
]

export default function Features() {
  return (
    <section id="features" className="relative py-12 md:py-16 overflow-x-clip">
      {/* Background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[#5865F2]/3 blur-[150px]" />

      <div className="relative max-w-[1200px] mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/20 mb-4">
            <span className="text-xs font-medium text-[#5865F2]">機能</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            なぜdiscord.jsなのか？
          </h2>
          <p className="max-w-md mx-auto text-[#8888a0] text-base">
            最も人気のあるDiscordライブラリとして、開発者に必要な全ての機能を提供します。
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative p-6 rounded-xl bg-[#12121a]/80 border border-[#2a2a3a] hover:border-[#5865F2]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#5865F2]/5"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center text-[#5865F2] mb-4 group-hover:bg-[#5865F2]/20 transition-colors duration-300">
                {feature.icon}
              </div>

              {/* Title + Badge */}
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-base font-semibold text-white">
                  {feature.title}
                </h3>
                {feature.badge}
              </div>

              {/* Description */}
              <p className="text-sm text-[#8888a0] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
