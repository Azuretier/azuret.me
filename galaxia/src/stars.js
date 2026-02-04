import * as THREE from 'three';

export class Stars {
    constructor() {
        this.points = null;
        this.init();
    }

    init() {
        // Detect device capability for LOD
        const isLowSpec = this.detectLowSpec();
        const starCount = isLowSpec ? 800 : 3000;

        // Create star field geometry
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        // Generate stars in a sphere around the scene
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;

            // Spherical distribution
            const radius = 50 + Math.random() * 150;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);

            // Star colors - mostly white with some blue and yellow tints
            const colorChoice = Math.random();
            if (colorChoice > 0.95) {
                // Blue stars
                colors[i3] = 0.7;
                colors[i3 + 1] = 0.8;
                colors[i3 + 2] = 1.0;
            } else if (colorChoice > 0.90) {
                // Yellow/orange stars
                colors[i3] = 1.0;
                colors[i3 + 1] = 0.9;
                colors[i3 + 2] = 0.7;
            } else {
                // White stars
                colors[i3] = 1.0;
                colors[i3 + 1] = 1.0;
                colors[i3 + 2] = 1.0;
            }

            // Varying star sizes
            sizes[i] = Math.random() * 2.5 + 0.5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Star material with size attenuation
        const material = new THREE.PointsMaterial({
            size: 2.0,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        this.points = new THREE.Points(geometry, material);
    }

    detectLowSpec() {
        // Simple heuristic for device capability
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!gl) return true;

        // Check for mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Check renderer
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            if (renderer.toLowerCase().includes('intel')) {
                return true; // Intel integrated graphics
            }
        }

        return isMobile;
    }

    update(time) {
        // Gentle rotation of the starfield
        if (this.points) {
            this.points.rotation.y = time * 0.01;
            this.points.rotation.x = Math.sin(time * 0.005) * 0.1;
        }
    }

    getPoints() {
        return this.points;
    }
}
