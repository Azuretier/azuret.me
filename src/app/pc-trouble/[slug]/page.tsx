import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import MarkdownContent from '@/src/components/pc-trouble/MarkdownContent'
import {
  formatJapaneseDate,
  getAllPcTroublePosts,
  getPcTroubleCategoryByName,
  getPcTroublePost,
  pcTroubleBlog,
} from '@/src/lib/pcTroubleBlog'
import styles from '../pc-trouble.module.css'

type ArticlePageProps = {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return getAllPcTroublePosts().map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPcTroublePost(slug)

  if (!post) {
    return {
      title: pcTroubleBlog.name,
    }
  }

  const url = `${pcTroubleBlog.siteUrl}${pcTroubleBlog.basePath}/${post.slug}`

  return {
    title: `${post.meta.title} | ${pcTroubleBlog.name}`,
    description: post.meta.description,
    alternates: {
      canonical: `${pcTroubleBlog.basePath}/${post.slug}`,
    },
    openGraph: {
      title: post.meta.title,
      description: post.meta.description,
      url,
      siteName: pcTroubleBlog.name,
      locale: 'ja_JP',
      type: 'article',
      publishedTime: post.meta.date,
      modifiedTime: post.meta.updated,
      section: post.meta.category,
      tags: post.meta.tags,
    },
  }
}

export default async function PcTroubleArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const post = getPcTroublePost(slug)

  if (!post) notFound()

  const category = getPcTroubleCategoryByName(post.meta.category)

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

        <div className={styles.articleLayout}>
          <article>
            <header className={styles.articleHeader}>
              <Link href={`${pcTroubleBlog.basePath}/category/${category?.slug ?? ''}`} className={`${styles.metaPill} ${styles.categoryPill}`}>
                {post.meta.category}
              </Link>
              <h1 className={styles.articleTitle}>{post.meta.title}</h1>
              <p className={styles.articleDescription}>{post.meta.description}</p>
              <div className={styles.articleMeta}>
                <span className={styles.metaPill}>投稿日 {formatJapaneseDate(post.meta.date)}</span>
                <span className={styles.metaPill}>更新日 {formatJapaneseDate(post.meta.updated)}</span>
                <span className={styles.readingTime}>{post.readingMinutes}分で読む</span>
              </div>
              <div className={styles.tagList} aria-label="タグ">
                {post.meta.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    #{tag}
                  </span>
                ))}
              </div>
            </header>

            <MarkdownContent content={post.content} />

            <footer className={styles.articleFooter}>
              <Link href={pcTroubleBlog.basePath} className={styles.backLink}>
                記事一覧へ戻る
              </Link>
            </footer>
          </article>

          <aside className={styles.tocPanel} aria-label="目次">
            <h2 className={styles.tocTitle}>目次</h2>
            <ol className={styles.tocList}>
              {post.toc.map((item) => (
                <li key={item.id} className={item.level === 3 ? styles.tocLevel3 : undefined}>
                  <a href={`#${item.id}`} className={styles.tocLink}>
                    {item.text}
                  </a>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </div>
    </main>
  )
}
