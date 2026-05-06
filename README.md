# azuret.me - Philosophy Gallery

A personal philosophy gallery built with Next.js 15 and React 19, featuring interactive 3D visualizations, a community comment wall, and profile system backed by SQLite.

思想発表会として構築されたパーソナルサイト。Next.js 15とReact 19を使用し、インタラクティブな3Dビジュアライゼーション、コミュニティコメントウォール、SQLiteによるプロフィールシステムを特徴としています。

## Features / 特徴
- Community comment wall with likes / いいね機能付きコミュニティコメントウォール
- User profile creation and listing / ユーザープロフィール作成・一覧
- Advancement widget showing community level / コミュニティレベルを表示する進捗ウィジェット
- Auto-rotating media slideshow / 自動回転メディアスライドショー
- PC trouble technical blog powered by Markdown / Markdown管理のPCトラブル技術ブログ
- Dark theme with staggered entrance animations / スタガードアニメーション付きダークテーマ
- Fully responsive layout / 完全レスポンシブレイアウト
- SEO sitemap and Google Analytics integration / SEOサイトマップとGoogle Analytics統合

## Tech Stack / 使用技術

- **Next.js 15** - App Router with React Server Components
- **React 19** - Latest React with enhanced hooks
- **TypeScript 5** - Type-safe development
- **Three.js** + **React Three Fiber** - 3D graphics
- **Tailwind CSS 4** - Utility-first styling via `@theme` directive
- **CSS Modules** - Scoped component styles
- **WebGL / GLSL** - Custom rain shader
- **better-sqlite3** - Embedded database for comments and profiles
- **next-sitemap** - Automatic sitemap and robots.txt generation
- **PostCSS** - CSS processing with autoprefixer

## Project Structure / プロジェクト構成

```
azuret.me/
├── src/
│   ├── app/
│   │   ├── pc-trouble/
│   │   │   ├── page.tsx             # PC trouble blog top / ブログトップ
│   │   │   ├── [slug]/page.tsx      # Markdown article page / 記事ページ
│   │   │   ├── category/[category]/page.tsx
│   │   │   └── pc-trouble.module.css
│   │   ├── layout.tsx              # Root layout with metadata / ルートレイアウト
│   │   ├── page.tsx                # Home page / メインページ
│   │   ├── globals.css             # Global styles and theme / グローバルスタイル
│   │   ├── home.module.css         # Home page styles / ホームページスタイル
│   │   ├── api/
│   │   │   ├── comments/
│   │   │   │   ├── route.ts        # GET/POST comments
│   │   │   │   └── [id]/
│   │   │   │       └── like/
│   │   │   │           └── route.ts # POST like
│   │   │   └── profiles/
│   │   │       └── route.ts        # GET/POST profiles
│   │   ├── links/
│   │   │   ├── page.tsx            # Social links page / リンクページ
│   │   │   ├── layout.tsx
│   │   │   └── links.module.css
│   │   └── profiles/
│   │       ├── page.tsx            # Community profiles / プロフィールページ
│   │       ├── layout.tsx
│   │       └── profiles.module.css
│   ├── components/
│   │   ├── Nav.tsx                 # Navigation with advancement widget
│   │   ├── Nav.module.css
│   │   ├── Footer.tsx              # Footer with resource/social links
│   │   ├── Footer.module.css
│   │   ├── RainCanvas.tsx          # WebGL rain shader effect
│   │   ├── VoxelTerrainCanvas.tsx  # 3D voxel terrain visualization
│   │   └── GoogleAnalytics.tsx     # GA tracking component
│   ├── lib/
│   │   ├── pcTroubleBlog.ts         # Markdown loader and blog metadata
│   │   └── db.ts                   # SQLite database utilities
│   └── config/
│       └── siteConfig.ts           # Centralized site configuration
├── content/
│   └── pc-trouble/                 # Markdown blog articles
├── public/
│   ├── shaders/
│   │   └── rain.frag               # GLSL fragment shader
│   └── media/                      # Slideshow images
├── next.config.js
├── next-sitemap.config.js
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

## Pages / ページ

| Route | Description |
|-------|-------------|
| `/` | Home page with hero, about cards, comment wall, and media slideshow |
| `/pc-trouble` | PCトラブル実験記 blog top with latest posts, categories, and profile |
| `/pc-trouble/[slug]` | Markdown article page with metadata, table of contents, callouts, and code blocks |
| `/pc-trouble/category/[category]` | Category archive page |
| `/links` | Social media links (X, GitHub, Discord, azuretier.net) |
| `/profiles` | Community profile creation and listing |

## PC Trouble Blog / PCトラブル実験記

The PC trouble blog lives under `/pc-trouble` and is designed for static generation with simple Markdown files.

PCトラブル実験記は `/pc-trouble` 配下にあります。記事は `content/pc-trouble/*.md` にMarkdownで追加します。

### Article frontmatter / 記事メタデータ

```md
---
title: "LiveKernelEvent 141とは何か"
date: "2026-05-07"
updated: "2026-05-07"
category: "Windowsログ"
tags:
  - "GPU"
  - "HWiNFO"
description: "記事一覧とSEOに使う概要文。"
---
```

Supported categories / 対応カテゴリ:

- GPU
- SSD
- CPU
- 電源ユニット
- Windowsログ
- HWiNFO
- ゲーム設定
- 作業記録

### Callouts / 注意喚起ブロック

```md
:::notice
PC内部を触る時は、電源OFF、コンセント抜き、静電気対策をします。
:::

:::warning
電源ユニットの分解は危険なため推奨しません。
:::

:::conclusion
ログだけで故障を断定せず、可能性として切り分けます。
:::
```

## API Routes / APIルート

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/comments` | GET | Fetch latest 100 comments |
| `/api/comments` | POST | Create a new comment |
| `/api/comments/[id]/like` | POST | Like a comment |
| `/api/profiles` | GET | Fetch latest 200 profiles |
| `/api/profiles` | POST | Create a new profile |

## Database / データベース

Uses SQLite via better-sqlite3, stored at `/data/azuret.db` with WAL mode enabled. Two tables:

- **comments** - id, author, content, likes, created_at
- **profiles** - id, username (unique), display_name, bio, website, created_at

Tables are auto-created on first run.

## Development / 開発

```bash
npm install
npm run dev
```

Available scripts / 利用できるスクリプト:

```bash
npm run dev
npm run build
npm run lint
```

## Building for Production / 本番ビルド

```bash
npm run build
npm start
```

## Environment Variables / 環境変数

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics tracking ID (optional) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 measurement ID (optional) |

## Deployment / デプロイ

This site can be deployed to Vercel, Netlify, or any hosting platform that supports Next.js.

このサイトはVercel、Netlify、またはNext.jsをサポートする任意のホスティングプラットフォームにデプロイできます。

## License / ライセンス

MIT
