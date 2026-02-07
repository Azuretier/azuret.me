import RainCanvas from '@/src/components/RainCanvas'

export default function Home() {
  return (
    <>
      <RainCanvas />
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
        {/* Editor-style card */}
        <div
          className="w-full max-w-2xl rounded-xl overflow-hidden border border-border-subtle shadow-2xl"
          style={{ backgroundColor: 'rgba(10, 10, 15, 0.88)', backdropFilter: 'blur(24px)' }}
        >
          {/* Window chrome */}
          <div className="flex items-center px-4 py-2.5 border-b border-border-subtle" style={{ backgroundColor: 'rgba(18, 18, 26, 0.6)' }}>
            <div className="flex gap-1.5 mr-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            </div>
            <span className="text-xs text-text-muted font-mono">README.md</span>
            <span className="ml-auto text-[10px] text-text-muted font-mono">UTF-8</span>
          </div>

          {/* Document content */}
          <div className="p-6 md:p-10 space-y-7">
            {/* Package header */}
            <div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  <span className="text-accent font-mono">#</span> azuret.me
                </h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent/15 text-accent-light border border-accent/20">
                  v1.0.0
                </span>
              </div>
              <p className="text-text-secondary mt-3 text-sm border-l-2 border-accent/30 pl-3">
                A life spelled out in code, creativity, and connection.
              </p>
            </div>

            {/* Whoami */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-2 font-mono">
                <span className="text-accent mr-1">##</span> $ whoami
              </h2>
              <p className="text-text-primary text-sm leading-relaxed">
                Developer crafting digital experiences. Building things at the
                intersection of creativity and code, one commit at a time.
              </p>
            </section>

            {/* Links */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3 font-mono">
                <span className="text-accent mr-1">##</span> Links
              </h2>
              <ul className="space-y-1.5">
                <li>
                  <a
                    href="https://azuretier.net"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-sm py-1 hover:text-accent transition-colors"
                  >
                    <span className="text-text-muted font-mono text-xs">-</span>
                    <span className="font-mono text-accent-light group-hover:underline underline-offset-2">
                      azuretier.net
                    </span>
                    <span className="text-text-muted text-xs font-mono">
                      {'//'} main website
                    </span>
                    <span className="text-text-muted group-hover:text-accent transition-colors ml-auto text-xs">
                      &#8599;
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://azuretier.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-sm py-1 hover:text-accent transition-colors"
                  >
                    <span className="text-text-muted font-mono text-xs">-</span>
                    <span className="font-mono text-accent-light group-hover:underline underline-offset-2">
                      azuretier.com
                    </span>
                    <span className="text-text-muted text-xs font-mono">
                      {'//'} portfolio
                    </span>
                    <span className="text-text-muted group-hover:text-accent transition-colors ml-auto text-xs">
                      &#8599;
                    </span>
                  </a>
                </li>
              </ul>
            </section>

            {/* Social - code block style */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3 font-mono">
                <span className="text-accent mr-1">##</span> Connect
              </h2>
              <div className="rounded-lg border border-border-subtle overflow-hidden">
                <div className="flex items-center px-4 py-1.5 border-b border-border-subtle" style={{ backgroundColor: 'rgba(18, 18, 26, 0.5)' }}>
                  <span className="text-[10px] text-text-muted font-mono">social.ts</span>
                </div>
                <div className="p-4 font-mono text-sm leading-relaxed" style={{ backgroundColor: 'rgba(12, 12, 20, 0.5)' }}>
                  <div className="text-text-muted">{'//'} where to find me</div>
                  <div className="mt-1">
                    <span className="text-purple-400">export const</span>{' '}
                    <span className="text-blue-300">social</span>{' '}
                    <span className="text-text-muted">=</span>{' '}
                    <span className="text-yellow-300">{'{'}</span>
                  </div>
                  <div className="pl-4">
                    <a
                      href="https://github.com/Azuretier"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1 hover:brightness-125 transition"
                    >
                      <span className="text-green-400">github</span>
                      <span className="text-text-muted">:</span>{' '}
                      <span className="text-orange-300 group-hover:underline underline-offset-2">
                        &quot;@Azuretier&quot;
                      </span>
                      <span className="text-text-muted">,</span>
                    </a>
                  </div>
                  <div className="pl-4">
                    <a
                      href="https://twitter.com/Azuretier"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1 hover:brightness-125 transition"
                    >
                      <span className="text-green-400">twitter</span>
                      <span className="text-text-muted">:</span>{' '}
                      <span className="text-orange-300 group-hover:underline underline-offset-2">
                        &quot;@Azuretier&quot;
                      </span>
                      <span className="text-text-muted">,</span>
                    </a>
                  </div>
                  <div>
                    <span className="text-yellow-300">{'}'}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
              <p className="text-text-muted text-xs font-mono">
                MIT &copy; {new Date().getFullYear()} azuret.me
              </p>
              <p className="text-text-muted text-[10px] font-mono">
                made with {'<3'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
