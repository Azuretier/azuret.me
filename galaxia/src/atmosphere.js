import * as THREE from 'three';

export class Atmosphere {
    constructor(planet) {
        this.planet = planet;
        this.mesh = null;
        this.material = null;
        this.init();
    }

    async init() {
        // Load atmosphere shader
        const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

        const fragmentShaderResponse = await fetch('/shaders/atmosphere.frag');
        const fragmentShader = await fragmentShaderResponse.text();

        // Create atmosphere material with additive blending
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                u_lightPosition: { value: new THREE.Vector3(10, 5, 10) },
                u_planetPosition: { value: new THREE.Vector3() },
            },
            vertexShader,
            fragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            depthWrite: false,
        });

        // Create atmosphere geometry (slightly larger than planet)
        const geometry = new THREE.SphereGeometry(2.15, 64, 64);
        this.mesh = new THREE.Mesh(geometry, this.material);

        // Add to planet's mesh (so it follows the planet)
        const planetMesh = this.planet.getPlanetMesh();
        if (planetMesh) {
            planetMesh.add(this.mesh);
        }
    }

    update(time) {
        if (this.material && this.planet) {
            // Update planet position for shader
            const planetPos = this.planet.getPlanetPosition();
            this.material.uniforms.u_planetPosition.value.copy(planetPos);
        }
    }

    getMesh() {
        return this.mesh;
    }
}
