/* ═══════════════════════════════════════════════════════════════════
   SHADERS - GLSL Shader Code
   ═══════════════════════════════════════════════════════════════════ */

// Typewriter text plane shader — glow + scan line
export const TEXT_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const TEXT_FRAG = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uProgress;
  uniform float uSpark;
  uniform vec3 uColor;

  varying vec2 vUv;

  void main() {
    vec4 tex = texture2D(uTexture, vUv);
    if (tex.a < 0.05) discard;

    // Scan line reveal from left
    float reveal = smoothstep(uProgress - 0.04, uProgress, vUv.x);
    float scanGlow = exp(-pow((vUv.x - uProgress) * 30.0, 2.0)) * 1.5;

    // Base text color
    vec3 col = uColor * tex.rgb;

    // Glow pulse on recent characters
    float charGlow = scanGlow * (0.5 + sin(uTime * 8.0) * 0.5);
    col += uColor * charGlow * 2.0;

    // Spark explosion glow when complete
    float sparkWave = uSpark * exp(-pow(length(vUv - vec2(1.0, 0.5)) * 3.0 - uSpark * 4.0, 2.0) * 2.0);
    col += uColor * sparkWave * 3.0;

    // Holographic shimmer
    float shimmer = sin(vUv.x * 40.0 + uTime * 5.0) * 0.03;
    col += shimmer;

    float alpha = tex.a * reveal * (0.85 + charGlow * 0.15);
    gl_FragColor = vec4(col, alpha);
  }
`;

// Kanji title shader — outline glow
export const KANJI_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const KANJI_FRAG = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uActive;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    vec4 tex = texture2D(uTexture, vUv);
    if (tex.a < 0.02) discard;

    vec3 col = uColor * tex.rgb;
    float pulse = sin(uTime * 2.0) * 0.15 + 0.85;
    col *= pulse * (0.3 + uActive * 0.7);

    // Edge glow
    float edge = smoothstep(0.3, 0.05, tex.a) * uActive;
    col += uColor * edge * 0.8;

    gl_FragColor = vec4(col, tex.a * (0.2 + uActive * 0.8));
  }
`;

// Fairy aura particles
export const FAIRY_VERT = `
  attribute float aSize;
  attribute float aPhase;
  attribute float aOrbit;
  attribute vec3 aColor;
  uniform float uTime;
  uniform vec3 uFairyPos;
  uniform vec3 uSwordPos;
  uniform float uActive;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    float t = uTime;
    float angle = t * (0.6 + aOrbit * 0.5) + aPhase * 6.28;
    float r = 0.3 + aOrbit * 1.4;
    vec3 offset = vec3(sin(angle)*r, cos(angle*0.7+aPhase)*r*0.5, cos(angle)*r);
    vec3 toSword = uSwordPos - (uFairyPos + offset);
    float grav = 1.0 / (dot(toSword,toSword) + 0.5) * 1.5;
    vec3 pos = uFairyPos + offset + normalize(toSword) * grav * 0.6;
    float life = sin(t*1.2 + aPhase*6.28)*0.5+0.5;
    vAlpha = (0.2+life*0.8) * (0.3+uActive*0.7);
    vColor = aColor * (0.5+life*0.5);
    vec4 mv = modelViewMatrix * vec4(pos,1.0);
    gl_PointSize = aSize * (250.0/-mv.z) * (0.4+life*0.6) * (0.5+uActive*0.5);
    gl_Position = projectionMatrix * mv;
  }
`;

export const FAIRY_FRAG = `
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d>0.5) discard;
    float c = exp(-d*10.0);
    float g = exp(-d*3.5)*0.4;
    gl_FragColor = vec4(vColor*(1.0+c*2.5), (c+g)*vAlpha);
  }
`;

// Typewriter flourish particles
export const FLOURISH_VERT = `
  attribute float aSize;
  attribute float aPhase;
  attribute float aBirth;
  attribute vec3 aVel;
  attribute vec3 aFColor;
  uniform float uTime;
  uniform float uCursorX;
  uniform float uCursorY;
  uniform float uCursorZ;
  uniform float uActive;
  varying float vAlpha;
  varying vec3 vFC;
  void main() {
    float t = uTime;
    float age = mod(t - aBirth, 4.0);
    float life = 1.0 - age * 0.25;
    if (life < 0.0) life = 0.0;

    vec3 origin = vec3(uCursorX, uCursorY, uCursorZ);
    vec3 pos = origin + aVel * age * 1.5;
    pos += vec3(sin(t*3.0+aPhase*6.0), cos(t*2.5+aPhase*4.0), sin(t*2.0+aPhase*5.0)) * 0.15 * life;
    // Gravity
    pos.y -= age * age * 0.15;

    vAlpha = life * life * uActive * 0.9;
    vFC = aFColor * (0.5 + life * 1.0);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (200.0 / -mv.z) * life * uActive;
    gl_Position = projectionMatrix * mv;
  }
`;

export const FLOURISH_FRAG = `
  varying float vAlpha;
  varying vec3 vFC;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d>0.5) discard;
    float c = exp(-d*8.0);
    float g = exp(-d*3.0)*0.35;
    gl_FragColor = vec4(vFC*(1.0+c*2.0), (c+g)*vAlpha);
  }
`;

// Spark explosion particles
export const SPARK_VERT = `
  attribute float aSize;
  attribute vec3 aDir;
  attribute float aSpeed;
  attribute vec3 aSColor;
  attribute float aDelay;
  uniform float uTime;
  uniform float uTrigger;
  uniform vec3 uOrigin;
  varying float vAlpha;
  varying vec3 vSC;
  void main() {
    float elapsed = uTime - uTrigger;
    float age = max(0.0, elapsed - aDelay);
    float life = 1.0 - age * 0.4;
    if (life < 0.0 || elapsed < 0.0) {
      gl_PointSize = 0.0;
      gl_Position = vec4(0.0);
      vAlpha = 0.0;
      vSC = vec3(0.0);
      return;
    }
    vec3 pos = uOrigin + aDir * aSpeed * age * 3.0;
    pos.y -= age * age * 0.4;
    pos += vec3(sin(age*8.0+aDelay*5.0), cos(age*6.0+aDelay*3.0), sin(age*7.0))*0.1*life;

    vAlpha = life * life * 0.95;
    float flash = exp(-age * 3.0);
    vSC = aSColor * (0.6 + flash * 2.0);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (300.0/-mv.z) * (0.3 + life * 0.7 + flash * 0.5);
    gl_Position = projectionMatrix * mv;
  }
`;

export const SPARK_FRAG = `
  varying float vAlpha;
  varying vec3 vSC;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d>0.5) discard;
    float core = exp(-d*12.0);
    float halo = exp(-d*3.0)*0.5;
    gl_FragColor = vec4(vSC*(1.0+core*3.0), (core+halo)*vAlpha);
  }
`;

// Ambient background particles
export const AMB_VERT = `
  attribute float aSize; attribute float aPhase; attribute float aType;
  uniform float uTime; uniform float uScroll;
  varying float vA; varying vec3 vC;
  void main() {
    float t = uTime; vec3 pos = position;
    pos.x += sin(t*0.25+aPhase*6.28)*1.2;
    pos.z += cos(t*0.2+aPhase*4.0)*1.2;
    pos.y += sin(t*0.15+aPhase*3.0)*0.8 + uScroll*2.5;
    float l = sin(t*0.2+aPhase*6.28)*0.5+0.5;
    vA = l*0.5;
    if(aType<0.33) vC=vec3(0.8,0.65,0.25); else if(aType<0.66) vC=vec3(0.55,0.08,0.06); else vC=vec3(0.85,0.55,0.7);
    vec4 mv=modelViewMatrix*vec4(pos,1.0);
    gl_PointSize=aSize*(140.0/-mv.z)*(0.3+l*0.7);
    gl_Position=projectionMatrix*mv;
  }
`;

export const AMB_FRAG = `
  varying float vA; varying vec3 vC;
  void main() {
    float d=length(gl_PointCoord-vec2(0.5)); if(d>0.5) discard;
    float c=exp(-d*7.0); float g=exp(-d*3.0)*0.3;
    gl_FragColor=vec4(vC*(1.0+c*1.2),(c+g)*vA);
  }
`;
