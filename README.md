# azuret.me - Personal Portfolio

A modern personal portfolio website built with Next.js 15 and React 19, featuring interactive 3D visualizations with WebGL shaders and voxel terrain effects.

## Features

- 🎨 Beautiful Japanese-inspired design
- 🌧️ Rain shader animation with WebGL
- 🏔️ Interactive voxel terrain visualization
- 📱 Fully responsive layout
- 🚀 Built with Next.js 15 and React 19
- 🎮 Three.js + React Three Fiber integration
- 💅 CSS Modules & Tailwind CSS for styling

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
azuret.me/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Main page component
│   │   ├── globals.css         # Global styles
│   │   ├── home.module.css     # Homepage styles
│   │   ├── api/                # API routes
│   │   ├── links/              # Links page
│   │   └── profiles/           # Profile pages
│   ├── components/
│   │   ├── RainCanvas.tsx      # WebGL rain shader effect
│   │   └── VoxelTerrainCanvas.tsx  # 3D voxel terrain visualization
│   ├── lib/                    # Utility libraries
│   └── styles/                 # Additional styles
├── public/
│   ├── shaders/                # GLSL shader files
│   └── media/                  # Media assets
└── package.json
```

## Technologies

- Next.js 15
- React 19
- TypeScript
- Three.js with React Three Fiber
- Tailwind CSS 4
- CSS Modules
- WebGL/GLSL Shaders

## Deployment

This site can be deployed to Vercel, Netlify, or any hosting platform that supports Next.js.

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

## License

MIT
