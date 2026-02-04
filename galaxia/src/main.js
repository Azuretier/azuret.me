import * as THREE from 'three';
import { Galaxy } from './galaxy.js';
import { Stars } from './stars.js';
import { Planet } from './planet.js';
import { Atmosphere } from './atmosphere.js';
import './style.css';

class Galaxia {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.galaxyScene = null; // Separate scene for background
    this.galaxyCamera = null;

    // Modules
    this.galaxy = null;
    this.stars = null;
    this.planet = null;
    this.atmosphere = null;

    // Time
    this.clock = new THREE.Clock();

    this.init();
  }

  async init() {
    // Create main scene
    this.scene = new THREE.Scene();

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 3, 15);
    this.camera.lookAt(0, 0, 0);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.autoClear = false; // We'll manually clear for multi-scene rendering
    document.body.appendChild(this.renderer.domElement);

    // Create separate scene for galaxy background
    this.galaxyScene = new THREE.Scene();
    this.galaxyCamera = new THREE.Camera(); // Orthographic for fullscreen quad

    // Initialize galaxy background
    this.galaxy = new Galaxy(this.renderer);
    await this.galaxy.init();
    this.galaxyScene.add(this.galaxy.getMesh());

    // Initialize stars
    this.stars = new Stars();
    this.scene.add(this.stars.getPoints());

    // Initialize planet
    this.planet = new Planet();
    await this.planet.init();
    this.scene.add(this.planet.getGroup());

    // Initialize atmosphere
    this.atmosphere = new Atmosphere(this.planet);
    await this.atmosphere.init();

    // Add subtle ambient light
    const ambientLight = new THREE.AmbientLight(0x222244, 0.5);
    this.scene.add(ambientLight);

    // Add main directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffee, 2.0);
    sunLight.position.set(10, 5, 10);
    this.scene.add(sunLight);

    // Event listeners
    window.addEventListener('resize', () => this.onResize());

    // Start animation loop
    this.animate();

    // Log initialization
    console.log('🌌 GALAXIA initialized successfully');
    console.log(`✨ Stars: ${this.stars.detectLowSpec() ? '800 (Low Spec)' : '3000 (High Spec)'}`);
  }

  onResize() {
    // Update camera
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    // Update renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Update galaxy resolution
    if (this.galaxy) {
      this.galaxy.onResize();
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const time = this.clock.getElapsedTime();

    // Update all modules
    if (this.galaxy) this.galaxy.update(time);
    if (this.stars) this.stars.update(time);
    if (this.planet) this.planet.update(time);
    if (this.atmosphere) this.atmosphere.update(time);

    // Camera animation - gentle orbit
    const cameraRadius = 15;
    const cameraSpeed = 0.05;
    this.camera.position.x = Math.sin(time * cameraSpeed) * cameraRadius;
    this.camera.position.z = Math.cos(time * cameraSpeed) * cameraRadius;
    this.camera.position.y = 3 + Math.sin(time * cameraSpeed * 0.5) * 2;
    this.camera.lookAt(0, 0, 0);

    // Render
    this.render();
  }

  render() {
    // Clear
    this.renderer.clear();

    // 1. Render galaxy background (fullscreen)
    this.renderer.render(this.galaxyScene, this.galaxyCamera);

    // 2. Render main scene (stars, planet, atmosphere) on top
    this.renderer.clearDepth(); // Clear depth buffer but keep color
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new Galaxia());
} else {
  new Galaxia();
}
