precision highp float;

uniform float u_time;
uniform vec2 u_resolution;

varying vec2 vUv;

// Noise functions for procedural generation
vec3 hash3(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    
    return mix(mix(mix(dot(hash3(i + vec3(0.0, 0.0, 0.0)), f - vec3(0.0, 0.0, 0.0)),
                       dot(hash3(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0)), u.x),
                   mix(dot(hash3(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0)),
                       dot(hash3(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0)), u.x), u.y),
               mix(mix(dot(hash3(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0)),
                       dot(hash3(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0)), u.x),
                   mix(dot(hash3(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0)),
                       dot(hash3(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0)), u.x), u.y), u.z);
}

float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 6; i++) {
        value += amplitude * noise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

// Spiral galaxy function
float spiral(vec2 uv, float arms, float twist) {
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);
    
    float spiral = sin(arms * angle + twist * radius);
    return spiral;
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;
    
    // Create rotating galaxy
    float time = u_time * 0.05;
    vec2 center = vec2(0.0);
    vec2 toCenter = uv - center;
    float dist = length(toCenter);
    
    // Rotation based on distance (like real galaxies)
    float rotation = time * 0.3 - dist * 1.5;
    mat2 rot = mat2(cos(rotation), -sin(rotation), sin(rotation), cos(rotation));
    vec2 rotatedUV = rot * toCenter;
    
    // Multi-layer spiral arms
    float arms = 4.0;
    float spiralPattern = 0.0;
    
    for (float i = 1.0; i <= 3.0; i++) {
        float twist = 2.0 * i;
        spiralPattern += spiral(rotatedUV, arms, twist) * (1.0 / i);
    }
    
    // Add noise for nebula-like clouds
    vec3 noiseCoord = vec3(rotatedUV * 2.0, time * 0.2);
    float nebulaPattern = fbm(noiseCoord);
    
    // Combine patterns with distance falloff
    float galaxyCore = exp(-dist * 2.0);
    float galaxyArms = smoothstep(0.2, 0.8, spiralPattern) * smoothstep(2.0, 0.5, dist);
    float nebula = nebulaPattern * smoothstep(1.5, 0.3, dist);
    
    // Color palette - deep space blues, purples, and cosmic pinks
    vec3 coreColor = vec3(0.9, 0.8, 1.0);  // Bright white-blue core
    vec3 armColor1 = vec3(0.4, 0.2, 0.8);  // Deep purple
    vec3 armColor2 = vec3(0.1, 0.4, 0.9);  // Cosmic blue
    vec3 nebulaColor = vec3(0.8, 0.3, 0.6); // Pink nebula
    vec3 spaceColor = vec3(0.02, 0.01, 0.05); // Deep space
    
    // Build the final color
    vec3 color = spaceColor;
    color = mix(color, armColor2, galaxyArms * 0.6);
    color = mix(color, armColor1, galaxyArms * spiralPattern * 0.4);
    color = mix(color, nebulaColor, nebula * 0.3);
    color += coreColor * galaxyCore * 1.5;
    
    // Add subtle stars scattered throughout
    float stars = smoothstep(0.998, 1.0, noise(vec3(uv * 50.0, 0.0)));
    color += stars * vec3(1.0);
    
    // Vignette effect for depth
    float vignette = smoothstep(2.5, 0.5, dist);
    color *= vignette * 0.8 + 0.2;
    
    gl_FragColor = vec4(color, 1.0);
}
