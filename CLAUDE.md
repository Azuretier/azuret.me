# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build (also generates sitemap via postbuild)
npm run lint         # Run Next.js linting
npm start            # Start production server
```

No test framework is configured.

## Architecture

**Next.js 15 App Router** personal philosophy gallery (思想発表会) and community platform (React 19, TypeScript 5). The site serves as a space for showcasing philosophical ideas alongside community interaction features.

### Key Architectural Patterns

- **Configuration-driven content**: All site text, navigation, links, and card content lives in `src/config/siteConfig.ts`. Edit content there, not in components.
- **CSS Modules + Tailwind 4**: Components use `.module.css` files for scoped styles. Global theme variables (colors, fonts) are defined in `src/app/globals.css` using Tailwind's `@theme` directive.
- **Client-side rendering**: Pages use `'use client'` with `fetch` on mount. No SSR data fetching.
- **SQLite database**: `data/azuret.db` (auto-created). Uses `better-sqlite3` with WAL mode. DB utilities in `src/lib/db.ts`.
- **Path alias**: `@/*` maps to `src/*`.

### Pages & Routes

| Route | Purpose |
|-------|---------|
| `/` | Home — hero, about cards, comment wall, profile banner |
| `/links` | Social links grid |
| `/profiles` | Community profiles (create + browse) |
| `GET/POST /api/comments` | Comment CRUD (latest 100) |
| `POST /api/comments/[id]/like` | Increment comment likes |
| `GET/POST /api/profiles` | Profile CRUD (latest 200) |

### Components

- `Nav.tsx` — Navigation with community advancement widget (level 1-5 based on comments + likes + profiles)
- `RainCanvas.tsx` — WebGL rain effect with embedded GLSL shader
- `VoxelTerrainCanvas.tsx` — Three.js 3D voxel terrain background
- `Footer.tsx` — Footer with link sections from siteConfig

### Database Schema

- **comments**: id, author, content, likes, created_at
- **profiles**: id, username (UNIQUE), display_name, bio, website, created_at

### Environment Variables

- `NEXT_PUBLIC_GA_ID` — Google Analytics tracking ID (optional)
