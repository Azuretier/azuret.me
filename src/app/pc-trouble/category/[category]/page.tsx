import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  formatJapaneseDate,
  getPcTroubleCategory,
  getPcTroublePostsByCategory,
  pcTroubleBlog,
  pcTroubleCategories,
} from '@/src/lib/pcTroubleBlog'
import styles from '../../pc-trouble.module.css'

type CategoryPageProps = {
  params: Promise<{ category: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return pcTroubleCategories.map((category) => ({
    category: category.slug,
  }))
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params
  const category = getPcTroubleCategory(categorySlug)

  if (!category) {
    return {
      title: pcTroubleBlog.name,
    }
  }

  const title = `${category.name}の記事 | ${pcTroubleBlog.name}`
  const description = category.description

  return {
    title,
    description,
    alternates: {
      canonical: `${pcTroubleBlog.basePath}/category/${category.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${pcTroubleBlog.siteUrl}${pcTroubleBlog.basePath}/category/${category.slug}`,
      siteName: pcTroubleBlog.name,
      locale: 'ja_JP',
      type: 'website',
    },
  }
}

export default async function PcTroubleCategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params
  const category = getPcTroubleCategory(categorySlug)

  if (!category) notFound()

  const posts = getPcTroublePostsByCategory(category.slug)

  return (
    <main className={styles.blogPage}>
      <div className={styles.blogShell}>
        <nav className={styles.topNav} aria-label="ブログナビゲーション">
          <Link href={pcTroubleBlog.basePath} className={styles.brandLink}>
            <span className={styles.brandMark}>PC</span>
            <span>{pcTroubleBlog.name}</span>
          </Link>
          <div className={styles.navLinks}>
            <Link href={pcTroubleBlog.basePath} className={styles.navLink}>
              トップ
            </Link>
            <Link href="/" className={styles.navLink}>
              azuret.me
            </Link>
          </div>
        </nav>

        <header className={styles.heroPanel}>
          <div className={styles.kicker}>CATEGORY</div>
          <h1 className={styles.heroTitle}>{category.name}</h1>
          <p className={styles.heroSubtitle}>{category.description}</p>
        </header>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionEyebrow}>ARTICLES</div>
              <h2 className={styles.sectionTitle}>{category.name}の記事</h2>
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
            <div className={styles.emptyState}>このカテゴリの記事はまだありません。</div>
          )}
        </section>
      </div>
    </main>
  )
}
