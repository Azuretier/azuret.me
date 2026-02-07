export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-16 md:py-24">
      <header className="w-full max-w-2xl mb-12">
        <h1 className="text-2xl font-semibold tracking-tight">azuret.me</h1>
        <p className="text-text-secondary mt-1 text-sm">Links and documentation</p>
      </header>

      <main className="w-full max-w-2xl space-y-10">
        <section>
          <h2 className="text-xs font-medium uppercase tracking-widest text-text-muted mb-4">
            Websites
          </h2>
          <ul className="space-y-3">
            <li>
              <a
                href="https://azuretier.net"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-lg border border-border-subtle px-4 py-3 transition-colors hover:border-accent hover:bg-bg-card"
              >
                <div>
                  <span className="font-medium">azuretier.net</span>
                </div>
                <span className="text-text-muted group-hover:text-accent transition-colors">&#8599;</span>
              </a>
            </li>
            <li>
              <a
                href="https://azuretier.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-lg border border-border-subtle px-4 py-3 transition-colors hover:border-accent hover:bg-bg-card"
              >
                <div>
                  <span className="font-medium">azuretier.com</span>
                </div>
                <span className="text-text-muted group-hover:text-accent transition-colors">&#8599;</span>
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xs font-medium uppercase tracking-widest text-text-muted mb-4">
            Social
          </h2>
          <ul className="space-y-3">
            <li>
              <a
                href="https://github.com/Azuretier"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-lg border border-border-subtle px-4 py-3 transition-colors hover:border-accent hover:bg-bg-card"
              >
                <span className="font-medium">GitHub</span>
                <span className="text-text-muted group-hover:text-accent transition-colors">&#8599;</span>
              </a>
            </li>
            <li>
              <a
                href="https://twitter.com/Azuretier"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-lg border border-border-subtle px-4 py-3 transition-colors hover:border-accent hover:bg-bg-card"
              >
                <span className="font-medium">X / Twitter</span>
                <span className="text-text-muted group-hover:text-accent transition-colors">&#8599;</span>
              </a>
            </li>
          </ul>
        </section>
      </main>

      <footer className="w-full max-w-2xl mt-16 pt-8 border-t border-border-subtle">
        <p className="text-text-muted text-xs">&copy; {new Date().getFullYear()} azuret.me</p>
      </footer>
    </div>
  )
}
