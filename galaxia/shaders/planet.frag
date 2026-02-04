precision highp float;

uniform float u_time;
uniform vec3 u_lightPosition;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

// Hash function for noise
vec3 hash3(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return fract(sin(p) * 43758.5453);
}

float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    
    vec3 a = hash3(i);
    vec3 b = hash3(i + vec3(1.0, 0.0, 0.0));
    vec3 c = hash3(i + vec3(0.0, 1.0, 0.0));
    vec3 d = hash3(i + vec3(1.0, 1.0, 0.0));
    
    return mix(mix(mix(a.x, b.x, u.x), mix(c.x, d.x, u.x), u.y),
               mix(mix(a.y, b.y, u.x), mix(c.y, d.y, u.x), u.y), u.z);
}

float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    
    for (int i = 0; i < 5; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    // Planet surface noise for terrain
    vec3 surfacePos = vPosition * 3.0;
    float terrain = fbm(surfacePos);
    
    // Create continents and oceans
    float landMask = smoothstep(0.3, 0.5, terrain);
    
    // Color palette
    vec3 oceanColor = vec3(0.1, 0.3, 0.6);  // Deep blue ocean
    vec3 landColor1 = vec3(0.2, 0.5, 0.2);  // Green vegetation
    vec3 landColor2 = vec3(0.6, 0.5, 0.3);  // Sandy/rocky
    vec3 polarColor = vec3(0.9, 0.9, 1.0);  // Ice caps
    
    // Mix land colors based on noise
    vec3 landColor = mix(landColor1, landColor2, fbm(surfacePos * 2.0));
    
    // Base color - ocean or land
    vec3 baseColor = mix(oceanColor, landColor, landMask);
    
    // Polar ice caps based on latitude
    float latitude = abs(vNormal.y);
    float iceMask = smoothstep(0.7, 0.9, latitude);
    baseColor = mix(baseColor, polarColor, iceMask);
    
    // Lighting
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(u_lightPosition - vPosition);
    
    // Diffuse lighting
    float diff = max(dot(normal, lightDir), 0.0);
    
    // Ambient lighting
    float ambient = 0.15;
    
    // Specular for ocean
    vec3 viewDir = normalize(cameraPosition - vPosition);
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    vec3 specular = (1.0 - landMask) * spec * vec3(0.5);
    
    // Rim lighting for atmosphere effect
    float rim = 1.0 - max(dot(viewDir, normal), 0.0);
    rim = pow(rim, 3.0) * 0.3;
    vec3 rimColor = vec3(0.4, 0.6, 1.0) * rim;
    
    // Combine lighting
    vec3 lighting = (ambient + diff) * baseColor + specular + rimColor;
    
    // Subsurface scattering for atmosphere
    float backLight = max(0.0, dot(-normal, lightDir));
    vec3 subsurface = backLight * baseColor * 0.3;
    
    vec3 finalColor = lighting + subsurface;
    
    gl_FragColor = vec4(finalColor, 1.0);
}
