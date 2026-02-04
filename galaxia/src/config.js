/**
 * GALAXIA Configuration File
 * 
 * Centralized configuration for easy customization without
 * diving into individual module files.
 */

export const GalaxiaConfig = {
    // ===== PERFORMANCE SETTINGS =====
    performance: {
        // Star count based on device capability
        stars: {
            lowSpec: 800,
            highSpec: 3000,
        },
        // Max device pixel ratio (prevent over-rendering)
        maxPixelRatio: 2,
        // Shader quality settings
        shaderQuality: {
            galaxyNoiseIterations: 6,  // Lower = faster, less detailed
            planetNoiseIterations: 5,   // Lower = simpler terrain
        },
    },

    // ===== VISUAL SETTINGS =====
    visual: {
        // Galaxy colors (RGB 0-1)
        galaxy: {
            coreColor: [0.9, 0.8, 1.0],      // Bright white-blue
            armColor1: [0.4, 0.2, 0.8],       // Deep purple
            armColor2: [0.1, 0.4, 0.9],       // Cosmic blue
            nebulaColor: [0.8, 0.3, 0.6],     // Pink nebula
            spaceColor: [0.02, 0.01, 0.05],   // Deep space black
            spiralArms: 4,                     // Number of spiral arms
        },

        // Planet appearance
        planet: {
            radius: 2.0,
            segments: 64,  // Higher = smoother but slower
            colors: {
                ocean: [0.1, 0.3, 0.6],
                land1: [0.2, 0.5, 0.2],         // Green vegetation
                land2: [0.6, 0.5, 0.3],         // Sandy/rocky
                polar: [0.9, 0.9, 1.0],         // Ice caps
            },
        },

        // Atmosphere settings
        atmosphere: {
            radius: 2.15,  // Larger than planet
            opacity: 0.6,
            colors: {
                day: [0.4, 0.6, 1.0],           // Blue atmosphere
                sunset: [1.0, 0.5, 0.3],        // Orange/red sunset
            },
        },

        // Lighting
        lighting: {
            sunPosition: [10, 5, 10],
            sunIntensity: 2.0,
            ambientIntensity: 0.5,
            ambientColor: 0x222244,
        },
    },

    // ===== ANIMATION SETTINGS =====
    animation: {
        // Camera orbit
        camera: {
            radius: 15,
            speed: 0.05,
            oscillationHeight: 2,
            oscillationSpeed: 0.5,
        },

        // Planet motion
        planet: {
            orbitSpeed: 0.1,        // Around center
            rotationSpeed: 0.3,     // Self-rotation
            axialTilt: 0.2,         // Angle in radians
        },

        // Galaxy rotation
        galaxy: {
            rotationSpeed: 0.05,
        },

        // Starfield rotation
        stars: {
            rotationSpeed: 0.01,
            oscillationAmount: 0.1,
        },
    },

    // ===== SCENE SETTINGS =====
    scene: {
        camera: {
            fov: 60,
            near: 0.1,
            far: 1000,
            initialPosition: [0, 3, 15],
        },
        renderer: {
            antialias: true,
            alpha: false,
        },
    },

    // ===== EXTENSION POINTS =====
    extensions: {
        // Enable these for future features
        multipleplanets: false,
        orbitControls: false,
        audioReactive: false,
        postProcessing: false,
    },
};

// Helper function to detect device capability
export function detectDeviceCapability() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) return 'low';

    // Check for mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) return 'low';

    // Check renderer
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (renderer.toLowerCase().includes('intel')) {
            return 'medium';
        }
    }

    return 'high';
}

// Export default
export default GalaxiaConfig;
