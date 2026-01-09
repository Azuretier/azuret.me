# 安定した幸せ - Personal Portfolio

A modern personal portfolio website built with Next.js 14, featuring smooth animations, custom cursor effects, and interactive sections.

## Features

- 🎨 Beautiful Japanese-inspired design
- ✨ Custom cursor with hover effects
- 🎭 Floating particle animations
- 📱 Fully responsive layout
- 🚀 Built with Next.js 14 and React 18
- 💅 CSS Modules for styling
- 🎯 Smooth scroll navigation with active section tracking

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
azuretia.com/
├── app/
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx            # Main page component
│   ├── globals.css         # Global styles
│   └── page.module.css     # Page-specific styles
├── components/
│   ├── CustomCursor.tsx    # Custom cursor effect
│   ├── FloatingParticles.tsx
│   ├── NavigationDots.tsx  # Section navigation
│   ├── HeroSection.tsx
│   ├── AboutSection.tsx
│   ├── WorksSection.tsx
│   ├── PhilosophySection.tsx
│   └── ContactSection.tsx
└── public/                 # Static assets

```

## Sections

- **Home**: Hero section with animated title
- **About**: Personal introduction with visual element
- **Works**: Portfolio showcase cards
- **Philosophy**: Core beliefs and values
- **Contact**: Social media links

## Technologies

- Next.js 14
- React 18
- TypeScript
- CSS Modules
- Google Fonts (Shippori Mincho, EB Garamond, Zen Kaku Gothic New)

## Deployment

This site can be deployed to Vercel, Netlify, or any hosting platform that supports Next.js.

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

## License

MIT
