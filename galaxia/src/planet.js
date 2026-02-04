import * as THREE from 'three';

export class Planet {
    constructor() {
        this.orbitGroup = null;
        this.planetMesh = null;
        this.material = null;
        this.init();
    }

    async init() {
        // Create orbit group for orbital motion
        this.orbitGroup = new THREE.Group();

        // Load shaders
        const vertexShaderResponse = await fetch('/shaders/planet.vert');
        const vertexShader = await vertexShaderResponse.text();

        const fragmentShaderResponse = await fetch('/shaders/planet.frag');
        const fragmentShader = await fragmentShaderResponse.text();

        // Create planet material
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                u_time: { value: 0.0 },
                u_lightPosition: { value: new THREE.Vector3(10, 5, 10) },
            },
            vertexShader,
            fragmentShader,
        });

        // Create planet geometry
        const geometry = new THREE.SphereGeometry(2, 64, 64);
        this.planetMesh = new THREE.Mesh(geometry, this.material);

        // Position planet in orbit
        this.planetMesh.position.set(8, 0, 0);

        // Add to orbit group
        this.orbitGroup.add(this.planetMesh);
    }

    update(time) {
        if (this.orbitGroup && this.planetMesh) {
            // Orbital motion around center
            this.orbitGroup.rotation.y = time * 0.1;

            // Planet self-rotation
            this.planetMesh.rotation.y = time * 0.3;
            this.planetMesh.rotation.x = 0.2; // Axial tilt

            // Update shader time
            if (this.material) {
                this.material.uniforms.u_time.value = time;
            }
        }
    }

    getGroup() {
        return this.orbitGroup;
    }

    getPlanetMesh() {
        return this.planetMesh;
    }

    getPlanetPosition() {
        if (this.planetMesh) {
            const worldPos = new THREE.Vector3();
            this.planetMesh.getWorldPosition(worldPos);
            return worldPos;
        }
        return new THREE.Vector3();
    }
}
