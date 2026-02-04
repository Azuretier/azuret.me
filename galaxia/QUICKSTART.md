# 🚀 GALAXIA Quick Start Guide

## Instant Setup

```bash
# Navigate to project
cd d:\-\GitHub\azuretia.com\galaxia

# Start dev server (already installed!)
npm run dev
```

Then open: **http://localhost:5173/**

---

## What You'll See

### 🌌 Visual Features
1. **Animated spiral galaxy** rotating in the background
2. **Thousands of stars** twinkling in space
3. **A living planet** with continents, oceans, and ice caps
4. **Blue atmospheric glow** around the planet
5. **Cinematic camera** orbiting the scene

### 🎨 UI Elements
- Top-left: "GALAXIA" title with animated gradient
- Glassmorphism overlay with cosmic theme
- Smooth fade-in loading animation

---

## Controls

Currently **no manual controls** - the camera orbits automatically for a cinematic experience.

---

## Customization Tips

### Change Star Count
Edit `src/stars.js`, line ~17:
```javascript
const starCount = isLowSpec ? 800 : 3000; // Adjust numbers
```

### Change Planet Speed
Edit `src/planet.js`, line ~52:
```javascript
this.orbitGroup.rotation.y = time * 0.1; // Orbital speed
this.planetMesh.rotation.y = time * 0.3;  // Rotation speed
```

### Change Galaxy Colors
Edit `shaders/galaxy.frag`, lines ~73-77:
```glsl
vec3 coreColor = vec3(0.9, 0.8, 1.0);
vec3 armColor1 = vec3(0.4, 0.2, 0.8);
vec3 armColor2 = vec3(0.1, 0.4, 0.9);
vec3 nebulaColor = vec3(0.8, 0.3, 0.6);
```

### Change Camera Orbit
Edit `src/main.js`, lines ~93-96:
```javascript
const cameraRadius = 15;      // Distance from center
const cameraSpeed = 0.05;      // Rotation speed
```

---

## Performance

### If Running Slow
1. Star count automatically reduces on low-spec devices
2. Manually reduce stars in `src/stars.js`
3. Reduce shader iterations in `galaxy.frag` (line ~23, change `6` to `4`)

### If You Want MAXIMUM Quality
1. Increase star count to 5000+
2. Increase shader iterations to 8
3. Add higher resolution planet geometry (line ~22 in `planet.js`)

---

## Building for Production

```bash
# Create optimized build
npm run build

# Preview production build
npm run preview
```

Build output goes to `dist/` folder.

---

## Troubleshooting

### Page is Blank
- Open browser console (F12)
- Check for shader loading errors
- Ensure all files in `shaders/` folder exist

### Stars Not Visible
- They might be behind the camera
- Wait a few seconds for animation to reveal them

### Low FPS
- System automatically detects and adjusts
- Try closing other applications
- Check GPU acceleration is enabled in browser

---

## Browser Compatibility

✅ **Best**: Chrome, Edge (Chromium-based)  
✅ **Good**: Firefox, Safari  
⚠️ **Limited**: Older browsers without WebGL 2.0  

---

## Next Steps

### Add Interactivity
```bash
npm install three/examples/jsm/controls/OrbitControls
```

Then in `main.js`:
```javascript
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// In init() after camera creation:
const controls = new OrbitControls(this.camera, this.renderer.domElement);
controls.enableDamping = true;

// In animate():
controls.update();
```

### Add More Planets
In `main.js`:
```javascript
this.planet2 = new Planet();
await this.planet2.init();
this.planet2.orbitGroup.position.set(15, 0, 0); // Different position
this.scene.add(this.planet2.getGroup());
```

---

## Resources

- 📚 **Full Docs**: See `README.md`
- 🏗️ **Architecture**: See `PROJECT_SUMMARY.md`
- 🎨 **Shaders**: Check `shaders/` folder
- 🔧 **Three.js Docs**: https://threejs.org/docs/

---

**Enjoy exploring the cosmos! 🌟**
