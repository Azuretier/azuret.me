import fs from 'fs'
import path from 'path'

export const pcTroubleBlog = {
  name: 'PCトラブル実験記',
  subtitle: '自作/BTO PC、GPUクラッシュ、温度監視、失敗から学ぶ技術メモ',
  description:
    'PCトラブル、GPUクラッシュ、LiveKernelEvent 141、M.2 SSD、CPUグリス、GPUドライバ、電源ユニット、HWiNFO温度監視の作業記録。',
  basePath: '/pc-trouble',
  siteUrl: 'https://azuret.me',
}

export const pcTroubleCategories = [
  { name: 'GPU', slug: 'gpu', description: 'GPUクラッシュ、ドライバ、補助電源、ゲーム中の画面出力トラブル。' },
  { name: 'SSD', slug: 'ssd', description: 'M.2 SSD、BIOS認識、サーマルパッド、温度監視の記録。' },
  { name: 'CPU', slug: 'cpu', description: 'CPUグリス、CPUクーラー、温度、取り付け作業のメモ。' },
  { name: '電源ユニット', slug: 'psu', description: 'PSUの可能性を疑う時の安全な確認観点。分解は推奨しません。' },
  { name: 'Windowsログ', slug: 'windows-log', description: 'Reliability Monitor、イベントログ、LiveKernelEventなどの読み方。' },
  { name: 'HWiNFO', slug: 'hwinfo', description: '温度、電圧、センサー値を観察するための監視メモ。' },
  { name: 'ゲーム設定', slug: 'game-settings', description: 'ゲーム中のクラッシュ、負荷、グラフィック設定の切り分け。' },
  { name: '作業記録', slug: 'worklog', description: '実際に触った手順、迷った点、判断した理由のログ。' },
] as const

export type PcTroubleCategoryName = (typeof pcTroubleCategories)[number]['name']
export type PcTroubleCategorySlug = (typeof pcTroubleCategories)[number]['slug']

export interface PcTroublePostMeta {
  title: string
  date: string
  updated: string
  category: PcTroubleCategoryName
  tags: string[]
  description: string
}

export interface TocItem {
  id: string
  text: string
  level: number
}

export interface PcTroublePost {
  slug: string
  meta: PcTroublePostMeta
  content: string
  readingMinutes: number
  toc: TocItem[]
}

const contentDirectory = path.join(process.cwd(), 'content', 'pc-trouble')

function stripQuotes(value: string) {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function parseFrontmatter(source: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)

  if (!match) {
    throw new Error('Markdown frontmatter is required for PC trouble posts.')
  }

  const rawFrontmatter = match[1]
  const content = match[2].trim()
  const data: Record<string, string | string[]> = {}
  let currentArrayKey: string | null = null

  for (const line of rawFrontmatter.split(/\r?\n/)) {
    if (!line.trim()) continue

    const listItem = line.match(/^\s*-\s+(.+)$/)
    if (listItem && currentArrayKey) {
      const currentValue = data[currentArrayKey]
      data[currentArrayKey] = Array.isArray(currentValue)
        ? [...currentValue, stripQuotes(listItem[1])]
        : [stripQuotes(listItem[1])]
      continue
    }

    const keyValue = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!keyValue) continue

    const [, key, rawValue] = keyValue
    if (rawValue.trim() === '') {
      data[key] = []
      currentArrayKey = key
      continue
    }

    data[key] = stripQuotes(rawValue)
    currentArrayKey = null
  }

  return { data, content }
}

function getString(data: Record<string, string | string[]>, key: string) {
  const value = data[key]
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Missing required frontmatter field: ${key}`)
  }
  return value
}

function getStringArray(data: Record<string, string | string[]>, key: string) {
  const value = data[key]
  if (Array.isArray(value)) return value
  if (typeof value === 'string' && value.length > 0) return [value]
  return []
}

function getCategoryName(category: string): PcTroubleCategoryName {
  const found = pcTroubleCategories.find((item) => item.name === category)
  if (!found) {
    throw new Error(`Unknown PC trouble category: ${category}`)
  }
  return found.name
}

export function slugifyHeading(text: string) {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s\u3040-\u30ff\u3400-\u9fff-]/g, '')
    .replace(/\s+/g, '-')

  return slug || 'section'
}

export function createHeadingIdFactory() {
  const counts = new Map<string, number>()

  return (text: string) => {
    const base = slugifyHeading(text)
    const count = counts.get(base) ?? 0
    counts.set(base, count + 1)

    return count === 0 ? base : `${base}-${count + 1}`
  }
}

export function extractTableOfContents(content: string): TocItem[] {
  const createId = createHeadingIdFactory()

  return content
    .split(/\r?\n/)
    .map((line) => line.match(/^(#{2,3})\s+(.+)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => {
      const text = match[2].trim()
      return {
        id: createId(text),
        text,
        level: match[1].length,
      }
    })
}

function getReadingMinutes(content: string) {
  const compactLength = content.replace(/\s+/g, '').length
  return Math.max(1, Math.ceil(compactLength / 600))
}

function readPostFromFile(fileName: string): PcTroublePost {
  const slug = fileName.replace(/\.md$/, '')
  const fullPath = path.join(contentDirectory, fileName)
  const source = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = parseFrontmatter(source)

  const meta: PcTroublePostMeta = {
    title: getString(data, 'title'),
    date: getString(data, 'date'),
    updated: getString(data, 'updated'),
    category: getCategoryName(getString(data, 'category')),
    tags: getStringArray(data, 'tags'),
    description: getString(data, 'description'),
  }

  return {
    slug,
    meta,
    content,
    readingMinutes: getReadingMinutes(content),
    toc: extractTableOfContents(content),
  }
}

export function getAllPcTroublePosts() {
  if (!fs.existsSync(contentDirectory)) return []

  return fs
    .readdirSync(contentDirectory)
    .filter((fileName) => fileName.endsWith('.md'))
    .map(readPostFromFile)
    .sort((a, b) => b.meta.date.localeCompare(a.meta.date))
}

export function getPcTroublePost(slug: string) {
  return getAllPcTroublePosts().find((post) => post.slug === slug)
}

export function getPcTroubleCategory(slug: string) {
  return pcTroubleCategories.find((category) => category.slug === slug)
}

export function getPcTroubleCategoryByName(name: PcTroubleCategoryName) {
  return pcTroubleCategories.find((category) => category.name === name)
}

export function getPcTroublePostsByCategory(slug: string) {
  const category = getPcTroubleCategory(slug)
  if (!category) return []

  return getAllPcTroublePosts().filter((post) => post.meta.category === category.name)
}

export function getPcTroubleCategoryCounts() {
  const posts = getAllPcTroublePosts()

  return pcTroubleCategories.map((category) => ({
    ...category,
    count: posts.filter((post) => post.meta.category === category.name).length,
  }))
}

export function formatJapaneseDate(date: string) {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00+09:00`))
}

export function pcTroubleUrl(pathname = '') {
  return `${pcTroubleBlog.siteUrl}${pcTroubleBlog.basePath}${pathname}`
}
