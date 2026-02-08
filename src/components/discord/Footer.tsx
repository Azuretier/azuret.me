export default function Footer() {
  return (
    <footer className="border-t border-[#1e1e2e]">
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#5865F2] flex items-center justify-center">
                <svg width="16" height="12" viewBox="0 0 71 55" fill="white">
                  <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.3052 54.5139 18.3638 54.4378C19.7295 52.4868 20.9105 50.4159 21.9099 48.2326C21.9661 48.1198 21.9127 47.9878 21.7963 47.9411C19.7756 47.1726 17.8536 46.2316 16.0062 45.1555C15.8764 45.0807 15.8653 44.8953 15.9838 44.8063C16.3742 44.514 16.7647 44.2106 17.1383 43.9044C17.1775 43.8724 17.2307 43.8668 17.2754 43.8878C28.7504 49.0939 41.3255 49.0939 52.6713 43.8878C52.716 43.864 52.7692 43.8696 52.8112 43.9016C53.1848 44.2078 53.5753 44.514 53.9685 44.8063C54.087 44.8953 54.0787 45.0807 53.9489 45.1555C52.1015 46.2512 50.1795 47.1726 48.156 47.9383C48.0396 47.985 47.989 48.1198 48.0452 48.2326C49.0674 50.4131 50.2428 52.484 51.6191 54.435C51.6658 54.5139 51.7667 54.5505 51.8591 54.5195C57.6606 52.7249 63.5432 50.0174 69.6161 45.5576C69.6693 45.5182 69.7029 45.459 69.7085 45.3942C71.1901 30.0564 67.2908 16.7573 60.1885 4.9823C60.169 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"/>
                </svg>
              </div>
              <span className="text-base font-semibold">discord.js</span>
            </div>
            <p className="text-sm text-[#55556a] leading-relaxed">
              Discord APIと簡単にやり取りできる強力なNode.jsモジュール
            </p>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#55556a] mb-4">
              リソース
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-sm text-[#8888a0] hover:text-white transition-colors duration-200">
                  ドキュメント
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#8888a0] hover:text-white transition-colors duration-200">
                  ガイド
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#8888a0] hover:text-white transition-colors duration-200">
                  API リファレンス
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#8888a0] hover:text-white transition-colors duration-200">
                  チェンジログ
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#55556a] mb-4">
              ソーシャル
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a href="https://github.com/discordjs/discord.js" target="_blank" rel="noopener noreferrer" className="text-sm text-[#8888a0] hover:text-white transition-colors duration-200">
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://discord.gg/djs" target="_blank" rel="noopener noreferrer" className="text-sm text-[#8888a0] hover:text-white transition-colors duration-200">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#8888a0] hover:text-white transition-colors duration-200">
                  X (Twitter)
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#8888a0] hover:text-white transition-colors duration-200">
                  npm
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#55556a] mb-4">
              法的情報
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-sm text-[#8888a0] hover:text-white transition-colors duration-200">
                  プライバシーポリシー
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#8888a0] hover:text-white transition-colors duration-200">
                  利用規約
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#8888a0] hover:text-white transition-colors duration-200">
                  ライセンス (Apache-2.0)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#1e1e2e] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#55556a]">
            &copy; {new Date().getFullYear()} discord.js. All rights reserved.
          </p>
          <p className="text-xs text-[#55556a]">
            Made with <span className="text-[#EB459E]">&hearts;</span> by the discord.js community
          </p>
        </div>
      </div>
    </footer>
  )
}
