import type { Metadata } from 'next'
import Link from 'next/link'
import {
  formatJapaneseDate,
  getAllPcTroublePosts,
  getPcTroubleCategoryCounts,
  pcTroubleBlog,
} from '@/src/lib/pcTroubleBlog'
import styles from './pc-trouble.module.css'

export const metadata: Metadata = {
  title: `${pcTroubleBlog.name} | azuret.me`,
  description: pcTroubleBlog.description,
  alternates: {
    canonical: pcTroubleBlog.basePath,
  },
  openGraph: {
    title: pcTroubleBlog.name,
    description: pcTroubleBlog.description,
    url: `${pcTroubleBlog.siteUrl}${pcTroubleBlog.basePath}`,
    siteName: pcTroubleBlog.name,
    locale: 'ja_JP',
    type: 'website',
  },
}

export default function PcTroubleBlogPage() {
  const posts = getAllPcTroublePosts()
  const categories = getPcTroubleCategoryCounts()

  return (
    <main className={styles.blogPage}>
      <div className={styles.blogShell}>
        <nav className={styles.topNav} aria-label="ブログナビゲーション">
          <Link href={pcTroubleBlog.basePath} className={styles.brandLink}>
            <span className={styles.brandMark}>PC</span>
            <span>{pcTroubleBlog.name}</span>
          </Link>
          <div className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>
              azuret.me
            </Link>
            <a href="#articles" className={styles.navLink}>
              最新記事
            </a>
            <a href="#categories" className={styles.navLink}>
              カテゴリ
            </a>
          </div>
        </nav>

        <section className={styles.heroGrid}>
          <div className={styles.heroPanel}>
            <div className={styles.kicker}>PC TROUBLE LOG</div>
            <h1 className={styles.heroTitle}>{pcTroubleBlog.name}</h1>
            <p className={styles.heroSubtitle}>{pcTroubleBlog.subtitle}</p>
            <div className={styles.safetyStrip} aria-label="安全方針">
              <div className={styles.safetyItem}>電源OFF・コンセント抜き・静電気対策を前提に記録します。</div>
              <div className={styles.safetyItem}>GPUやPSUの診断は断定せず、可能性として扱います。</div>
              <div className={styles.safetyItem}>電源ユニットの分解は危険なため推奨しません。</div>
            </div>
          </div>

          <aside className={styles.profilePanel} aria-label="プロフィール">
            <div className={styles.profileEyebrow}>PROFILE</div>
            <h2 className={styles.profileTitle}>実験しながら直すPCメモ</h2>
            <p className={styles.profileText}>
              自作/BTO PCで起きた不具合を、作業前後の状態、温度、Windowsログ、試した切り分けごとに残す技術ブログです。
            </p>
            <ul className={styles.profileList}>
              <li>HWiNFOで温度とセンサー値を確認</li>
              <li>Reliability Monitorとイベントログを記録</li>
              <li>読者が真似する場合は自己責任で安全優先</li>
            </ul>
          </aside>
        </section>

        <section id="articles" className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionEyebrow}>LATEST ARTICLES</div>
              <h2 className={styles.sectionTitle}>最新記事</h2>
            </div>
            <p className={styles.sectionNote}>{posts.length}件の記事</p>
          </div>

          {posts.length > 0 ? (
            <div className={styles.postGrid}>
              {posts.map((post) => (
                <Link key={post.slug} href={`${pcTroubleBlog.basePath}/${post.slug}`} className={styles.postCard}>
                  <div className={styles.metaRow}>
                    <span className={`${styles.metaPill} ${styles.categoryPill}`}>{post.meta.category}</span>
                    <span className={styles.metaPill}>{formatJapaneseDate(post.meta.date)}</span>
                  </div>
                  <h3 className={styles.postTitle}>{post.meta.title}</h3>
                  <p className={styles.postDescription}>{post.meta.description}</p>
                  <div className={styles.postFooter}>
                    <span>{post.readingMinutes}分で読む</span>
                    <span>読む</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>まだ記事がありません。</div>
          )}
        </section>

        <section id="categories" className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionEyebrow}>CATEGORIES</div>
              <h2 className={styles.sectionTitle}>カテゴリ一覧</h2>
            </div>
          </div>

          <div className={styles.categoryGrid}>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`${pcTroubleBlog.basePath}/category/${category.slug}`}
                className={styles.categoryCard}
              >
                <div className={styles.categoryName}>
                  <span>{category.name}</span>
                  <span className={styles.categoryCount}>{category.count}</span>
                </div>
                <p className={styles.categoryDescription}>{category.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
