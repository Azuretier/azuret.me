import Link from 'next/link'
import styles from './hybrid-notes-showcase.module.css'

const featureCards = [
  {
    title: 'Analog Capture',
    body: '紙ノートの勢いをそのまま残しながら、あとで拾い上げるための要点・ページ・タグを整えます。',
  },
  {
    title: 'Live Edge Extension',
    body: 'Microsoft Edge 拡張機能が現在のアクティブタブを localhost helper へ送信し、リアルタイムに近い形で取り込めます。',
  },
  {
    title: 'Bridge View',
    body: '紙で生まれた思考とデジタルで育てたノートを、リンク単位で追いかけられる設計です。',
  },
]

const workflow = [
  ['1', 'Capture on paper', '会議・読書・散歩中のメモを、まずは紙で速く書く。'],
  ['2', 'Pull into desktop', '後から必要なページだけを Electron アプリに取り込む。'],
  ['3', 'Distill and connect', '検索したい知識・次の行動・元ページの関係を残す。'],
]

const downloadItems = [
  { label: 'Platform', value: 'Windows + Electron desktop' },
  { label: 'Storage', value: 'Offline local workspace' },
  { label: 'Import', value: 'Microsoft Edge session helper' },
  { label: 'Updated', value: '2026-04-13' },
]

export default function HybridNotesShowcase() {
  return (
    <main className={styles.page}>
      <div className={styles.meshOne} />
      <div className={styles.meshTwo} />

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.badge}>
            <img src="/hybrid-notes-icon.svg" alt="Hybrid Notes icon" className={styles.badgeIcon} />
            Hybrid Notes Desktop
          </div>
          <h1 className={styles.title}>Web では魅せる。実際に使うのは、デスクトップで。</h1>
          <p className={styles.lead}>
            Hybrid Notes は、アナログのノートとデジタルのノートをひとつの流れで扱うための
            Electron アプリです。Web ページでは製品の雰囲気と導線だけを見せ、実務はローカルのアプリで進めます。
          </p>

          <div className={styles.ctaRow}>
            <a className={styles.primaryCta} href="/downloads/hybrid-notes-desktop-source.zip" download>
              Download Desktop Source
            </a>
            <a className={styles.secondaryCta} href="/downloads/hybrid-notes-desktop-guide.txt" download>
              Download Setup Guide
            </a>
            <a className={styles.secondaryCta} href="/downloads/hybrid-notes-edge-extension.zip" download>
              Download Edge Extension
            </a>
            <Link className={styles.ghostCta} href="#preview">
              See the interface
            </Link>
          </div>

          <div className={styles.metaRow}>
            {downloadItems.map((item) => (
              <div key={item.label} className={styles.metaCard}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div id="preview" className={styles.previewWrap}>
          <div className={styles.previewFrame}>
            <div className={styles.previewTopbar}>
              <div className={styles.previewLights}>
                <span />
                <span />
                <span />
              </div>
              <div className={styles.previewLabel}>Hybrid Notes Desktop UI</div>
            </div>

            <div className={styles.previewContent}>
              <aside className={styles.sidebarPreview}>
                <div className={styles.sidebarBrand}>
                  <img src="/hybrid-notes-icon.svg" alt="" />
                  <div>
                    <strong>Hybrid Notes</strong>
                    <span>Desktop workspace</span>
                  </div>
                </div>
                <div className={styles.navStack}>
                  <div className={`${styles.navPill} ${styles.navPillActive}`}>Overview</div>
                  <div className={styles.navPill}>Capture</div>
                  <div className={styles.navPill}>Bridge</div>
                  <div className={styles.navPill}>Settings</div>
                </div>
              </aside>

              <div className={styles.previewMain}>
                <div className={styles.previewHeroCard}>
                  <span>Today&apos;s pulse</span>
                  <strong>Paper ideas, web research, and next actions in one place.</strong>
                  <div className={styles.miniStats}>
                    <div><span>Paper Inbox</span><strong>06</strong></div>
                    <div><span>Digital Notes</span><strong>18</strong></div>
                    <div><span>Coverage</span><strong>82%</strong></div>
                  </div>
                </div>

                <div className={styles.previewGrid}>
                  <div className={styles.previewPanel}>
                    <div className={styles.panelHeading}>Edge Import</div>
                    <div className={styles.importItem}>
                      <strong>Research tabs ready to save</strong>
                      <span>pricing strategy notes</span>
                    </div>
                    <div className={styles.importItem}>
                      <strong>Meeting reference</strong>
                      <span>design review deck</span>
                    </div>
                  </div>

                  <div className={styles.previewPanel}>
                    <div className={styles.panelHeading}>Bridge Links</div>
                    <div className={styles.linkLine}>
                      <span className={styles.paperDot} />
                      Daily Log p.21
                      <span className={styles.linkConnector} />
                      Product brief
                    </div>
                    <div className={styles.linkLine}>
                      <span className={styles.paperDotAlt} />
                      Study Pad p.7
                      <span className={styles.linkConnector} />
                      Reading digest
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionEyebrow}>Why Desktop</span>
          <h2>ブラウザでは届かない情報に、ローカルアプリから触れる</h2>
        </div>

        <div className={styles.featureGrid}>
          {featureCards.map((item) => (
            <article key={item.title} className={styles.featureCard}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionEyebrow}>Workflow</span>
          <h2>紙とデジタルを分断しない、3ステップの使い方</h2>
        </div>

        <div className={styles.workflowRow}>
          {workflow.map(([step, title, body]) => (
            <article key={step} className={styles.workflowCard}>
              <div className={styles.stepBadge}>{step}</div>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.downloadSection}>
        <div className={styles.downloadCard}>
          <div>
            <span className={styles.sectionEyebrow}>Get The App</span>
            <h2>ダウンロードして、そのまま手元で使い始める</h2>
            <p>
              このページはショーケースです。実際の操作、保存、Edge タブ取り込み、ノートの接続は
              Electron デスクトップアプリ側で行います。リアルタイムの現在タブ取得は Edge 拡張機能を使います。
            </p>
          </div>

          <div className={styles.downloadButtons}>
            <a className={styles.primaryCta} href="/downloads/hybrid-notes-desktop-source.zip" download>
              Desktop Source
            </a>
            <a className={styles.secondaryCta} href="/downloads/hybrid-notes-desktop-guide.txt" download>
              Setup Guide
            </a>
            <a className={styles.secondaryCta} href="/downloads/hybrid-notes-edge-extension.zip" download>
              Edge Extension
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
