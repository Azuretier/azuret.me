precision highp float;

uniform vec3 u_lightPosition;
uniform vec3 u_planetPosition;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vPosition);
    
    // Fresnel effect - stronger glow at edges
    float fresnel = 1.0 - max(dot(viewDir, normal), 0.0);
    fresnel = pow(fresnel, 3.0);
    
    // Light direction for day/night side
    vec3 lightDir = normalize(u_lightPosition - u_planetPosition);
    float lightInfluence = max(dot(normal, lightDir), 0.0);
    
    // Atmosphere colors
    vec3 atmosphereColor = vec3(0.4, 0.6, 1.0);  // Blue atmosphere
    vec3 sunsetColor = vec3(1.0, 0.5, 0.3);      // Orange/red sunset
    
    // Mix colors based on light angle
    vec3 color = mix(atmosphereColor, sunsetColor, pow(lightInfluence, 2.0));
    
    // Intensity based on fresnel and light
    float intensity = fresnel * (0.5 + lightInfluence * 0.5);
    
    // Add subtle pulsing
    intensity *= 1.0 + sin(vPosition.x * 10.0 + vPosition.y * 10.0) * 0.05;
    
    gl_FragColor = vec4(color, intensity * 0.6);
}
