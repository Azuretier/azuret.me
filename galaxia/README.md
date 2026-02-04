# 🌌 GALAXIA

A stunning WebGL visual system featuring procedural galaxies, starfields, and animated planets powered by Three.js and advanced GLSL shaders.

![GALAXIA](https://img.shields.io/badge/WebGL-Powered-blue?style=for-the-badge)
![Three.js](https://img.shields.io/badge/Three.js-0.182-black?style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge)

## ✨ Features

### 🌀 Procedural Galaxy Background
- Fullscreen GLSL shader rendering
- Animated spiral arms with multi-layer depth
- Nebula clouds using fractal brownian motion (FBM)
- Dynamic rotation and color gradients
- Realistic distance falloff and vignetting

### ⭐ Adaptive Starfield
- LOD system: 800 stars (low-spec) / 3000 stars (high-spec)
- Automatic device capability detection
- Realistic star colors (white, blue, yellow)
- Spherical distribution around scene
- Gentle rotation animation

### 🪐 Animated Planet System
- Procedural terrain generation
- Dynamic continents and oceans
- Polar ice caps based on latitude
- Advanced lighting with specular highlights
- Subsurface scattering effects
- Self-rotation and orbital motion

### 🌊 Atmospheric Glow
- Fresnel-based edge detection
- Day/night side gradient
- Additive blending for realistic glow
- Subtle atmospheric shimmer
- Follows planet position

## 🏗️ Architecture

```
galaxia/
├── src/
│   ├── main.js          # Application entry & orchestration
│   ├── galaxy.js        # Procedural background module
│   ├── stars.js         # Starfield with LOD
│   ├── planet.js        # Planet body with orbit
│   ├── atmosphere.js    # Atmospheric glow effect
│   └── style.css        # Modern UI styling
├── shaders/
│   ├── galaxy.frag      # Galaxy fragment shader
│   ├── planet.vert      # Planet vertex shader
│   ├── planet.frag      # Planet fragment shader
│   └── atmosphere.frag  # Atmosphere fragment shader
└── index.html           # HTML entry point
```

## 🚀 Getting Started

### Installation

```bash
cd galaxia
npm install
```

### Development

```bash
npm run dev
```

Open your browser to the URL shown in the terminal (typically `http://localhost:5173`)

### Production Build

```bash
npm run build
npm run preview
```

## 🎨 Technical Highlights

### Dual-Scene Rendering
The application uses a sophisticated dual-scene rendering approach:
1. **Galaxy Scene**: Fullscreen orthographic camera for background
2. **Main Scene**: Perspective camera for 3D objects (stars, planet, atmosphere)

This ensures optimal performance while maintaining visual quality.

### Performance Optimizations
- **Adaptive LOD**: Automatically adjusts star count based on device
- **Minimal shader complexity**: Optimized for broader device support
- **Device pixel ratio limiting**: Caps at 2x to prevent over-rendering
- **Depth buffer management**: Strategic clearing for multi-scene rendering

### Shader Architecture
All shaders use custom GLSL code with:
- Procedural noise functions (hash, noise, FBM)
- Advanced lighting calculations (diffuse, specular, rim, subsurface)
- Time-based animations via uniforms
- Physically-inspired color palettes

## 🎯 Planned Extensions

- [ ] Multiple planets in orbital systems
- [ ] Cloud layers and ocean waves
- [ ] Habitable planet variations
- [ ] Audio-reactive visual effects
- [ ] Interactive camera controls
- [ ] Planet surface details (cities, forests)
- [ ] Asteroid belts and moons
- [ ] Comet trails
- [ ] Black hole effects
- [ ] VR/AR support

## 🛠️ Technology Stack

- **Renderer**: Three.js (r182)
- **Graphics API**: WebGL
- **Shaders**: GLSL (OpenGL Shading Language)
- **Bundler**: Vite 7.2
- **Animation**: requestAnimationFrame loop

## 📊 Performance Targets

- **High-spec devices**: 60 FPS at 1080p+
- **Low-spec devices**: 30+ FPS with reduced star count
- **Mobile**: Optimized shader complexity and LOD

## 🎓 Learning Resources

This project demonstrates:
- Multi-scene rendering techniques
- Custom shader development
- Procedural generation algorithms
- Performance optimization strategies
- Modular Three.js architecture
- Time-based animations

## 📝 License

MIT License - Feel free to use this project for learning and inspiration!

## 🌟 Credits

Created with ❤️ by Azuretia

---

**Enjoy your cosmic journey! 🚀✨**
