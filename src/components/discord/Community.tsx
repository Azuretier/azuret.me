'use client'

export default function Community() {
  return (
    <section id="community" className="relative py-12 md:py-16 overflow-x-clip">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* CTA Card */}
        <div className="relative overflow-hidden rounded-2xl border border-[#2a2a3a]">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#5865F2]/20 via-[#12121a] to-[#5865F2]/10" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[#5865F2]/10 blur-[100px]" />

          <div className="relative px-8 py-16 md:px-16 md:py-20">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                コミュニティに参加しよう
              </h2>
              <p className="text-[#8888a0] text-lg leading-relaxed mb-8">
                20,000人以上の開発者が集うDiscordサーバーで、
                質問をしたり、プロジェクトを共有したり、
                最新のアップデート情報を入手しましょう。
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://discord.gg/djs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold bg-[#5865F2] text-white rounded-xl hover:bg-[#4752C4] transition-all duration-200 hover:shadow-lg hover:shadow-[#5865F2]/25 hover:-translate-y-0.5"
                >
                  <svg width="18" height="14" viewBox="0 0 71 55" fill="currentColor">
                    <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.3052 54.5139 18.3638 54.4378C19.7295 52.4868 20.9105 50.4159 21.9099 48.2326C21.9661 48.1198 21.9127 47.9878 21.7963 47.9411C19.7756 47.1726 17.8536 46.2316 16.0062 45.1555C15.8764 45.0807 15.8653 44.8953 15.9838 44.8063C16.3742 44.514 16.7647 44.2106 17.1383 43.9044C17.1775 43.8724 17.2307 43.8668 17.2754 43.8878C28.7504 49.0939 41.3255 49.0939 52.6713 43.8878C52.716 43.864 52.7692 43.8696 52.8112 43.9016C53.1848 44.2078 53.5753 44.514 53.9685 44.8063C54.087 44.8953 54.0787 45.0807 53.9489 45.1555C52.1015 46.2512 50.1795 47.1726 48.156 47.9383C48.0396 47.985 47.989 48.1198 48.0452 48.2326C49.0674 50.4131 50.2428 52.484 51.6191 54.435C51.6658 54.5139 51.7667 54.5505 51.8591 54.5195C57.6606 52.7249 63.5432 50.0174 69.6161 45.5576C69.6693 45.5182 69.7029 45.459 69.7085 45.3942C71.1901 30.0564 67.2908 16.7573 60.1885 4.9823C60.169 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"/>
                  </svg>
                  Discordに参加する
                </a>
                <a
                  href="https://github.com/discordjs/discord.js"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-[#e8e8f0] bg-white/5 border border-[#2a2a3a] rounded-xl hover:bg-white/10 hover:border-[#3a3a4a] transition-all duration-200 hover:-translate-y-0.5"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHubで見る
                </a>
              </div>
            </div>

            {/* Floating online count */}
            <div className="mt-8 flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#57F287]" />
                <span className="text-sm text-[#8888a0]">
                  <span className="text-white font-semibold">3,421</span> 人がオンライン
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8888a0]" />
                <span className="text-sm text-[#8888a0]">
                  <span className="text-white font-semibold">21,847</span> メンバー
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
