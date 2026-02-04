import * as THREE from 'three';

export class Galaxy {
  constructor(renderer) {
    this.renderer = renderer;
    this.mesh = null;
    this.material = null;
    this.init();
  }

  async init() {
    // Load shaders
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShaderResponse = await fetch('/shaders/galaxy.frag');
    const fragmentShader = await fragmentShaderResponse.text();

    // Create fullscreen plane material
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0.0 },
        u_resolution: { 
          value: new THREE.Vector2(
            window.innerWidth * window.devicePixelRatio,
            window.innerHeight * window.devicePixelRatio
          )
        }
      },
      vertexShader,
      fragmentShader,
      depthWrite: false,
      depthTest: false,
    });

    // Create fullscreen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -1; // Render first (background)
  }

  update(time) {
    if (this.material) {
      this.material.uniforms.u_time.value = time;
    }
  }

  onResize() {
    if (this.material) {
      this.material.uniforms.u_resolution.value.set(
        window.innerWidth * window.devicePixelRatio,
        window.innerHeight * window.devicePixelRatio
      );
    }
  }

  getMesh() {
    return this.mesh;
  }
}
