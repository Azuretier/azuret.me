import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

const COLORS = {
  void: "#04040a",
  steel: "#c4c4c8",
  blood: "#8b1a1a",
  gold: "#c9a84c",
  paper: "#e8e0d0",
  sakura: "#e8a0b4",
};

const SECTIONS = [
  { id: "hero", kanji: "安定", romaji: "Antei", english: "Stability", body: "Like the stillness of a blade at rest — true power lies not in motion, but in the unwavering calm before it.", fairy: { color: [0.3, 0.6, 1.0], aura: 0x4488ff, sword: 0x6699cc, name: "Water Spirit" } },
  { id: "happiness", kanji: "幸福", romaji: "Kōfuku", english: "Happiness", body: "Not the fleeting spark of pleasure, but the deep ember that warms without burning. A state cultivated through discipline, not chased through desire.", fairy: { color: [1.0, 0.75, 0.2], aura: 0xffcc33, sword: 0xddaa22, name: "Sun Spirit" } },
  { id: "balance", kanji: "均衡", romaji: "Kinkō", english: "Balance", body: "The katana's edge exists between two planes — neither side dominates. Stable happiness lives in this same equilibrium: between effort and surrender, solitude and connection.", fairy: { color: [0.4, 1.0, 0.6], aura: 0x44ff88, sword: 0x44cc66, name: "Wind Spirit" } },
  { id: "forging", kanji: "鍛造", romaji: "Tanzō", english: "Forging", body: "A blade is folded a thousand times. Each fold removes impurity, adds resilience. Happiness, too, is forged through repeated tempering — shaped by what we endure and release.", fairy: { color: [1.0, 0.3, 0.15], aura: 0xff4422, sword: 0xcc3311, name: "Fire Spirit" } },
  { id: "stillness", kanji: "静寂", romaji: "Seijaku", english: "Stillness", body: "In the silence after the cut, truth is revealed. Stable happiness is not the absence of storms, but the silence you carry within them.", fairy: { color: [0.85, 0.55, 0.85], aura: 0xdd88dd, sword: 0xbb66bb, name: "Moon Spirit" } },
];

/* ═══════════════════════════════════════════════════════════════════
   SHADERS
   ═══════════════════════════════════════════════════════════════════ */

const FAIRY_AURA_VERT = `
  attribute float aSize;
  attribute float aPhase;
  attribute float aOrbit;
  attribute vec3 aBaseColor;
  uniform float uTime;
  uniform vec3 uFairyPos;
  uniform vec3 uSwordPos;
  uniform float uActive;
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    float t = uTime;
    vec3 pos = position;

    // Orbit around fairy
    float orbitAngle = t * (0.8 + aOrbit * 0.6) + aPhase * 6.28;
    float orbitR = 0.4 + aOrbit * 1.2;
    vec3 fairyOffset = vec3(
      sin(orbitAngle) * orbitR,
      cos(orbitAngle * 0.7 + aPhase) * orbitR * 0.6,
      cos(orbitAngle) * orbitR
    );

    // Gravitational pull toward sword
    vec3 toSword = uSwordPos - (uFairyPos + fairyOffset);
    float swordDist = length(toSword);
    float gravity = 1.0 / (swordDist * swordDist + 0.5) * 2.0;
    vec3 gravPull = normalize(toSword) * gravity * (1.0 - aOrbit * 0.5);

    pos = uFairyPos + fairyOffset + gravPull * 0.8;

    // Breathing
    float life = sin(t * 1.5 + aPhase * 6.28) * 0.5 + 0.5;
    vAlpha = (0.3 + life * 0.7) * (0.4 + uActive * 0.6);
    vColor = aBaseColor * (0.6 + life * 0.5);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (300.0 / -mv.z) * (0.5 + life * 0.5) * (0.6 + uActive * 0.4);
    gl_Position = projectionMatrix * mv;
  }
`;

const FAIRY_AURA_FRAG = `
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float core = exp(-d * 10.0);
    float halo = exp(-d * 3.0) * 0.4;
    float a = (core + halo) * vAlpha;
    vec3 col = vColor * (1.0 + core * 2.5);
    gl_FragColor = vec4(col, a);
  }
`;

const GRAVITY_TRAIL_VERT = `
  attribute float aSize;
  attribute float aLife;
  attribute vec3 aTrailColor;
  uniform float uTime;
  varying float vAlpha;
  varying vec3 vTColor;

  void main() {
    float t = uTime;
    vec3 pos = position;
    float life = fract(aLife + t * 0.1);
    vAlpha = (1.0 - life) * 0.7;
    vTColor = aTrailColor * (1.0 - life * 0.5);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (200.0 / -mv.z) * (1.0 - life * 0.6);
    gl_Position = projectionMatrix * mv;
  }
`;

const GRAVITY_TRAIL_FRAG = `
  varying float vAlpha;
  varying vec3 vTColor;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float soft = exp(-d * 6.0);
    gl_FragColor = vec4(vTColor * (1.0 + soft), soft * vAlpha);
  }
`;

const AMBIENT_VERT = `
  attribute float aSize;
  attribute float aPhase;
  attribute float aType;
  uniform float uTime;
  uniform float uScroll;
  varying float vAlpha;
  varying vec3 vPColor;

  void main() {
    float t = uTime;
    vec3 pos = position;
    float angle = t * 0.3 + aPhase * 6.28;
    pos.x += sin(angle) * 1.5;
    pos.z += cos(angle) * 1.5;
    pos.y += sin(t * 0.2 + aPhase * 4.0) * 1.2 + uScroll * 3.0;

    float life = sin(t * 0.25 + aPhase * 6.28) * 0.5 + 0.5;
    vAlpha = life * 0.6;

    if (aType < 0.33) vPColor = vec3(0.85, 0.7, 0.3);
    else if (aType < 0.66) vPColor = vec3(0.6, 0.1, 0.08);
    else vPColor = vec3(0.9, 0.6, 0.75);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (180.0 / -mv.z) * (0.4 + life * 0.6);
    gl_Position = projectionMatrix * mv;
  }
`;

const AMBIENT_FRAG = `
  varying float vAlpha;
  varying vec3 vPColor;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float c = exp(-d * 8.0);
    float g = exp(-d * 3.5) * 0.4;
    gl_FragColor = vec4(vPColor * (1.0 + c * 1.5), (c + g) * vAlpha);
  }
`;

/* ═══════════════════════════════════════════════════════════════════
   BUILD FUNCTIONS
   ═══════════════════════════════════════════════════════════════════ */

function buildVoxelWorld(scene) {
  const G = 36, BS = 0.9, GAP = 0.1, CELL = BS + GAP;

  const heightAt = (x, z) => {
    const px = (x - G/2) * CELL, pz = (z - G/2) * CELL;
    const d = Math.sqrt(px*px + pz*pz);
    const h = Math.sin(x*0.24)*Math.cos(z*0.2)*2.5 + Math.sin(x*0.11+z*0.09)*2.0 + Math.cos(d*0.11)*2.2 + Math.sin(x*0.5)*Math.sin(z*0.5)*0.4;
    return Math.max(1, Math.round(Math.abs(h) + 1));
  };

  let total = 0;
  const cols = [];
  for (let x = 0; x < G; x++) for (let z = 0; z < G; z++) {
    const h = heightAt(x, z);
    cols.push({ x, z, h });
    total += h;
  }

  const geo = new THREE.BoxGeometry(BS, BS, BS);
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.25, vertexColors: true });
  const mesh = new THREE.InstancedMesh(geo, mat, total);
  const colorArr = new Float32Array(total * 3);
  const pal = [0x0a0a14, 0x10101e, 0x180a0a, 0x1a1510, 0x1c1616, 0x261212, 0x261e14, 0x341616, 0x342a1c, 0x3e2216];
  const palC = pal.map(p => new THREE.Color(p));
  const topGold = new THREE.Color(0xc9a84c);
  const topBlood = new THREE.Color(0x8b1a1a);

  const dummy = new THREE.Object3D();
  const colData = [];
  let idx = 0;

  for (const col of cols) {
    const wx = (col.x - G/2) * CELL, wz = (col.z - G/2) * CELL;
    for (let y = 0; y < col.h; y++) {
      const wy = y * (BS + GAP * 0.4);
      dummy.position.set(wx, wy, wz);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(idx, dummy.matrix);

      const isTop = y === col.h - 1;
      let c;
      if (isTop) {
        c = (Math.sin(col.x * 0.5 + col.z * 0.7) > 0.2 ? topGold : topBlood).clone();
        c.multiplyScalar(0.35 + col.h * 0.07);
      } else {
        const hr = y / Math.max(col.h - 1, 1);
        c = palC[Math.min(Math.floor(hr * palC.length), palC.length - 1)].clone();
        c.r += Math.sin(col.x * 0.3 + y * 0.5) * 0.015;
      }
      colorArr[idx*3] = c.r; colorArr[idx*3+1] = c.g; colorArr[idx*3+2] = c.b;
      colData.push({ wx, wz, baseY: wy, isTop, maxH: col.h, phase: Math.random() * Math.PI * 2 });
      idx++;
    }
  }

  geo.setAttribute("color", new THREE.InstancedBufferAttribute(colorArr, 3));
  mesh.instanceMatrix.needsUpdate = true;

  const group = new THREE.Group();
  group.add(mesh);
  group.position.set(0, -8, -8);
  group.rotation.x = -0.22;
  group.rotation.y = 0.3;
  scene.add(group);

  return { group, mesh, colData };
}

function createSwordMesh(color) {
  const shape = new THREE.Shape();
  shape.moveTo(0, -2.0);
  shape.quadraticCurveTo(0.07, -1, 0.05, 0);
  shape.quadraticCurveTo(0.035, 0.9, 0.01, 1.8);
  shape.lineTo(0, 2.0);
  shape.lineTo(-0.01, 1.8);
  shape.quadraticCurveTo(-0.015, 0.9, -0.01, 0);
  shape.quadraticCurveTo(-0.003, -1, 0, -2.0);

  const mesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 0.008, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 2 }),
    new THREE.MeshPhysicalMaterial({ color, metalness: 0.96, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 3.5, emissive: color, emissiveIntensity: 0.1 })
  );

  // Tsuba
  const tsuba = new THREE.Mesh(
    new THREE.TorusGeometry(0.12, 0.025, 10, 20),
    new THREE.MeshPhysicalMaterial({ color: 0x181820, metalness: 0.9, roughness: 0.2 })
  );
  tsuba.rotation.x = Math.PI / 2;
  tsuba.position.y = -2.0;

  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.03, 0.9, 6),
    new THREE.MeshPhysicalMaterial({ color: 0x140806, roughness: 0.85 })
  );
  handle.position.y = -2.5;

  const group = new THREE.Group();
  group.add(mesh, tsuba, handle);
  return group;
}

function buildFairyAura(scene, fairyData, count) {
  const N = count;
  const pos = new Float32Array(N * 3);
  const sizes = new Float32Array(N);
  const phases = new Float32Array(N);
  const orbits = new Float32Array(N);
  const baseColors = new Float32Array(N * 3);

  for (let i = 0; i < N; i++) {
    pos[i*3] = 0; pos[i*3+1] = 0; pos[i*3+2] = 0;
    sizes[i] = Math.random() * 3.5 + 1.0;
    phases[i] = Math.random();
    orbits[i] = Math.random();
    baseColors[i*3] = fairyData.color[0];
    baseColors[i*3+1] = fairyData.color[1];
    baseColors[i*3+2] = fairyData.color[2];
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  geo.setAttribute("aOrbit", new THREE.BufferAttribute(orbits, 1));
  geo.setAttribute("aBaseColor", new THREE.BufferAttribute(baseColors, 3));

  const mat = new THREE.ShaderMaterial({
    vertexShader: FAIRY_AURA_VERT, fragmentShader: FAIRY_AURA_FRAG,
    uniforms: {
      uTime: { value: 0 },
      uFairyPos: { value: new THREE.Vector3() },
      uSwordPos: { value: new THREE.Vector3() },
      uActive: { value: 0 },
    },
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  });

  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  return { pts, mat };
}

function buildGravityTrails(scene, fairyData) {
  const N = 200;
  const pos = new Float32Array(N * 3);
  const sizes = new Float32Array(N);
  const lives = new Float32Array(N);
  const trailColors = new Float32Array(N * 3);

  for (let i = 0; i < N; i++) {
    pos[i*3] = 0; pos[i*3+1] = 0; pos[i*3+2] = 0;
    sizes[i] = Math.random() * 2.0 + 0.5;
    lives[i] = Math.random();
    trailColors[i*3] = fairyData.color[0] * 0.7;
    trailColors[i*3+1] = fairyData.color[1] * 0.7;
    trailColors[i*3+2] = fairyData.color[2] * 0.7;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute("aLife", new THREE.BufferAttribute(lives, 1));
  geo.setAttribute("aTrailColor", new THREE.BufferAttribute(trailColors, 3));

  const mat = new THREE.ShaderMaterial({
    vertexShader: GRAVITY_TRAIL_VERT, fragmentShader: GRAVITY_TRAIL_FRAG,
    uniforms: { uTime: { value: 0 } },
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  });

  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  return { pts, mat, geo };
}

function buildFairyCoreLight(scene, auraColor) {
  // Fairy body: glowing sphere
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
  );

  // Inner glow sphere
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 16, 16),
    new THREE.MeshBasicMaterial({ color: auraColor, transparent: true, opacity: 0.15, side: THREE.BackSide })
  );

  // Outer glow
  const outerGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 16, 16),
    new THREE.MeshBasicMaterial({ color: auraColor, transparent: true, opacity: 0.06, side: THREE.BackSide })
  );

  // Point light
  const light = new THREE.PointLight(auraColor, 2.0, 12);

  const group = new THREE.Group();
  group.add(core, glow, outerGlow, light);
  scene.add(group);
  return { group, core, glow, outerGlow, light };
}

function buildAmbientParticles(scene) {
  const N = 800;
  const pos = new Float32Array(N * 3);
  const sizes = new Float32Array(N);
  const phases = new Float32Array(N);
  const types = new Float32Array(N);

  for (let i = 0; i < N; i++) {
    pos[i*3] = (Math.random()-0.5)*50;
    pos[i*3+1] = Math.random()*18 - 5;
    pos[i*3+2] = (Math.random()-0.5)*50;
    sizes[i] = Math.random()*2 + 0.3;
    phases[i] = Math.random();
    types[i] = Math.random();
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  geo.setAttribute("aType", new THREE.BufferAttribute(types, 1));

  const mat = new THREE.ShaderMaterial({
    vertexShader: AMBIENT_VERT, fragmentShader: AMBIENT_FRAG,
    uniforms: { uTime: { value: 0 }, uScroll: { value: 0 } },
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  });

  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  return { pts, mat };
}

function buildEmbers(scene) {
  const N = 300;
  const pos = new Float32Array(N * 3);
  const seeds = [];
  for (let i = 0; i < N; i++) {
    pos[i*3] = (Math.random()-0.5)*40;
    pos[i*3+1] = Math.random()*22 - 8;
    pos[i*3+2] = (Math.random()-0.5)*30;
    seeds.push(Math.random()*100);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xff5522, size: 0.035, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  return { pts, geo, seeds };
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN CANVAS
   ═══════════════════════════════════════════════════════════════════ */

function MainCanvas({ scrollProgress, activeSection }) {
  const canvasRef = useRef(null);
  const scrollRef = useRef(0);
  const activeRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => { scrollRef.current = scrollProgress; }, [scrollProgress]);
  useEffect(() => { activeRef.current = activeSection; }, [activeSection]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04040a, 0.016);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 10, 26);

    // Lighting
    scene.add(new THREE.AmbientLight(0x10101a, 0.5));
    const sun = new THREE.DirectionalLight(0xffeedd, 0.5);
    sun.position.set(8, 15, 10);
    scene.add(sun);

    // Env map
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envS = new THREE.Scene();
    envS.background = new THREE.Color(0x060610);
    envS.add(new THREE.DirectionalLight(0xffffff, 1.5).translateX(1).translateY(1).translateZ(1));
    envS.add(new THREE.DirectionalLight(0x8b1a1a, 1).translateX(-1).translateZ(-1));
    envS.add(new THREE.DirectionalLight(0xc9a84c, 0.6).translateY(-1).translateZ(1));
    scene.environment = pmrem.fromScene(envS).texture;

    // Build voxel world
    const voxels = buildVoxelWorld(scene);

    // ── 5 Fairy-Sword systems ──
    const fairySystems = [];
    const fairyCircleRadius = 7;

    SECTIONS.forEach((sec, i) => {
      const angle = (i / SECTIONS.length) * Math.PI * 2 - Math.PI / 2;
      const cx = Math.cos(angle) * fairyCircleRadius;
      const cz = Math.sin(angle) * fairyCircleRadius;
      const cy = 2;

      // Sword
      const sword = createSwordMesh(sec.fairy.sword);
      sword.position.set(cx, cy, cz);
      scene.add(sword);

      // Fairy core
      const fairyCore = buildFairyCoreLight(scene, sec.fairy.aura);
      fairyCore.group.position.set(cx + 1, cy + 1, cz);

      // Aura particles
      const aura = buildFairyAura(scene, sec.fairy, 120);

      // Gravity trails
      const trails = buildGravityTrails(scene, sec.fairy);

      fairySystems.push({
        sword, fairyCore, aura, trails,
        cx, cy, cz, angle,
        fairyColor: sec.fairy.color,
        auraColor: sec.fairy.aura,
        smoothActive: 0,
      });
    });

    // Ambient particles + embers
    const ambient = buildAmbientParticles(scene);
    const embers = buildEmbers(scene);

    // Events
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);
    const onMouse = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouse);

    // ── ANIMATION ──
    let time = 0, frame;
    const tmpM = new THREE.Matrix4();
    const tmpP = new THREE.Vector3();
    const tmpQ = new THREE.Quaternion();
    const tmpS = new THREE.Vector3();

    const animate = () => {
      frame = requestAnimationFrame(animate);
      time += 0.004;
      const sp = scrollRef.current;
      const ai = activeRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const t = time * 10;

      // ── Voxel animation ──
      for (let i = 0; i < voxels.colData.length; i++) {
        const d = voxels.colData[i];
        const wave = Math.sin(d.wx*0.2 + t*0.05 + d.phase) * Math.cos(d.wz*0.18 + t*0.035) * 0.4;
        const scrollP = Math.sin(d.wx*0.1 + sp*4 + d.phase) * 0.25;
        const yOff = (wave + scrollP) * (d.isTop ? 1.0 : 0.2);

        voxels.mesh.getMatrixAt(i, tmpM);
        tmpM.decompose(tmpP, tmpQ, tmpS);
        tmpP.y = d.baseY + yOff;
        if (d.isTop) {
          const p = 1.0 + Math.sin(t*0.12 + d.phase)*0.03;
          tmpS.set(p, p, p);
        }
        tmpM.compose(tmpP, tmpQ, tmpS);
        voxels.mesh.setMatrixAt(i, tmpM);
      }
      voxels.mesh.instanceMatrix.needsUpdate = true;
      voxels.group.rotation.y = 0.3 + t*0.0015 + sp*0.4;
      voxels.group.position.y = -8 - sp*1.5;

      // ── Fairy-Sword Systems ──
      for (let i = 0; i < fairySystems.length; i++) {
        const fs = fairySystems[i];
        const isActive = ai === i;

        // Smooth transition
        const targetActive = isActive ? 1.0 : 0.15;
        fs.smoothActive += (targetActive - fs.smoothActive) * 0.03;

        // Sword: float + slow spin, active sword glows brighter
        const swordY = fs.cy + Math.sin(t * 0.15 + i * 1.2) * 0.4;
        const swordSpin = t * (isActive ? 0.04 : 0.015) + i * 1.25;
        fs.sword.position.y = swordY;
        fs.sword.rotation.z = Math.PI / 6 + Math.sin(swordSpin) * 0.15;
        fs.sword.rotation.y = swordSpin;
        const sScale = 0.7 + fs.smoothActive * 0.5;
        fs.sword.scale.set(sScale, sScale, sScale);

        // Sword emissive pulse
        if (fs.sword.children[0] && fs.sword.children[0].material) {
          fs.sword.children[0].material.emissiveIntensity = 0.05 + fs.smoothActive * 0.25;
        }

        // Fairy dance: orbit around sword
        const fairyOrbitR = 1.8 + Math.sin(t * 0.1 + i) * 0.5;
        const fairyOrbitSpeed = isActive ? 0.08 : 0.03;
        const fairyAngle = t * fairyOrbitSpeed + i * 1.25;
        const fairyX = fs.cx + Math.cos(fairyAngle) * fairyOrbitR;
        const fairyZ = fs.cz + Math.sin(fairyAngle) * fairyOrbitR;
        const fairyY = swordY + 0.8 + Math.sin(t * 0.2 + i * 2) * 0.6;

        fs.fairyCore.group.position.set(fairyX, fairyY, fairyZ);

        // Fairy glow intensity
        const fairyBright = 0.3 + fs.smoothActive * 0.7;
        fs.fairyCore.core.material.opacity = 0.5 + fs.smoothActive * 0.5;
        fs.fairyCore.glow.material.opacity = 0.08 + fs.smoothActive * 0.15;
        fs.fairyCore.outerGlow.material.opacity = 0.03 + fs.smoothActive * 0.08;
        fs.fairyCore.light.intensity = 0.5 + fs.smoothActive * 3.0;

        // Fairy scale pulse
        const coreScale = 0.8 + fs.smoothActive * 0.4 + Math.sin(t * 0.3) * 0.1;
        fs.fairyCore.group.scale.set(coreScale, coreScale, coreScale);

        // Aura particles — follow fairy, attract to sword
        fs.aura.mat.uniforms.uTime.value = t;
        fs.aura.mat.uniforms.uFairyPos.value.set(fairyX, fairyY, fairyZ);
        fs.aura.mat.uniforms.uSwordPos.value.set(fs.sword.position.x, fs.sword.position.y, fs.sword.position.z);
        fs.aura.mat.uniforms.uActive.value = fs.smoothActive;

        // Gravity trail — update positions between fairy and sword
        fs.trails.mat.uniforms.uTime.value = t;
        const tp = fs.trails.geo.attributes.position.array;
        const trailN = tp.length / 3;
        for (let j = 0; j < trailN; j++) {
          const frac = j / trailN;
          const life = fract(frac + t * 0.08);

          // Lerp from fairy to sword
          const lx = fairyX + (fs.sword.position.x - fairyX) * life;
          const ly = fairyY + (fs.sword.position.y - fairyY) * life;
          const lz = fairyZ + (fs.sword.position.z - fairyZ) * life;

          // Add spiral
          const spiralA = life * Math.PI * 4 + t * 0.3 + j * 0.1;
          const spiralR = (1.0 - life) * 0.5 * fs.smoothActive;
          tp[j*3] = lx + Math.cos(spiralA) * spiralR;
          tp[j*3+1] = ly + Math.sin(spiralA * 0.7) * spiralR * 0.6;
          tp[j*3+2] = lz + Math.sin(spiralA) * spiralR;
        }
        fs.trails.geo.attributes.position.needsUpdate = true;
      }

      // ── Ambient ──
      ambient.mat.uniforms.uTime.value = t;
      ambient.mat.uniforms.uScroll.value = sp;

      // Embers
      const ep = embers.geo.attributes.position.array;
      for (let i = 0; i < ep.length / 3; i++) {
        ep[i*3+1] += 0.016 + embers.seeds[i % embers.seeds.length]*0.0007;
        ep[i*3] += Math.sin(t*0.35 + embers.seeds[i % embers.seeds.length])*0.004;
        if (ep[i*3+1] > 16) { ep[i*3+1] = -8; ep[i*3] = (Math.random()-0.5)*40; ep[i*3+2] = (Math.random()-0.5)*30; }
      }
      embers.geo.attributes.position.needsUpdate = true;

      // ── Camera ──
      camera.position.x = mx * 2.5;
      camera.position.y = 10 + my * 0.6 - sp * 3;
      camera.position.z = 26 - sp * 5;
      camera.lookAt(mx * 0.8, -1 + sp * 2, -sp * 2);

      renderer.render(scene, camera);
    };

    function fract(x) { return x - Math.floor(x); }

    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
      renderer.dispose();
      pmrem.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} style={{
    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 0,
  }} />;
}

/* ═══════════════════════════════════════════════════════════════════
   UI COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

function BladeRule({ width = "80px", color = COLORS.blood, style = {} }) {
  return <div style={{ width, height: "1px", background: `linear-gradient(90deg, transparent, ${color}, transparent)`, margin: "1.5rem 0", ...style }} />;
}

function KanjiStrip() {
  return <div style={{ position: "fixed", right: "2.5vw", top: "50%", transform: "translateY(-50%)", zIndex: 10, writingMode: "vertical-rl", fontFamily: "'Noto Serif JP', serif", fontSize: "clamp(12px, 1.2vw, 16px)", color: COLORS.gold, opacity: 0.18, letterSpacing: "0.5em", userSelect: "none", textShadow: "0 0 30px rgba(201,168,76,0.3)" }}>安定した幸福の道</div>;
}

function Seal() {
  return <div style={{ position: "fixed", bottom: "3vh", right: "3vw", zIndex: 10, width: "52px", height: "52px", border: `1.5px solid ${COLORS.blood}`, borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Serif JP', serif", fontSize: "20px", color: COLORS.blood, opacity: 0.4, transform: "rotate(-5deg)", userSelect: "none", boxShadow: "0 0 25px rgba(139,26,26,0.15)" }}>幸</div>;
}

function TopBar() {
  return <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 20, padding: "1.8rem 3vw", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(to bottom, rgba(4,4,10,0.94), transparent)", pointerEvents: "none" }}>
    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(11px, 1vw, 13px)", letterSpacing: "0.35em", textTransform: "uppercase", color: COLORS.steel, opacity: 0.5 }}>安定した幸福</div>
    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(10px, 0.9vw, 12px)", letterSpacing: "0.3em", textTransform: "uppercase", color: COLORS.gold, opacity: 0.3 }}>Stable Happiness</div>
  </header>;
}

function NavDots({ activeSection }) {
  const spiritNames = ["水 Water", "陽 Sun", "風 Wind", "火 Fire", "月 Moon"];
  return <nav style={{ position: "fixed", left: "2vw", top: "50%", transform: "translateY(-50%)", zIndex: 20, display: "flex", flexDirection: "column", gap: "14px" }}>
    {SECTIONS.map((s, i) => {
      const active = activeSection === i;
      const auraHex = s.fairy.aura;
      const r = (auraHex >> 16) & 0xFF;
      const g = (auraHex >> 8) & 0xFF;
      const b = auraHex & 0xFF;
      return <a key={s.id} href={`#${s.id}`}
        onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" }); }}
        style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", textDecoration: "none" }}>
        <div style={{
          width: active ? "28px" : "8px", height: "8px", borderRadius: "4px",
          background: active ? `rgb(${r},${g},${b})` : "rgba(200,196,186,0.12)",
          transition: "all 0.6s cubic-bezier(0.25,0.46,0.45,0.94)",
          boxShadow: active ? `0 0 16px rgba(${r},${g},${b},0.6)` : "none",
        }} />
        {active && <span style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: "10px",
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: `rgba(${r},${g},${b},0.7)`, whiteSpace: "nowrap",
          animation: "fadeIn 0.5s ease",
        }}>{spiritNames[i]}</span>}
      </a>;
    })}
  </nav>;
}

function Section({ data, index, activeSection }) {
  const isActive = activeSection === index;
  const isHero = index === 0;
  const fc = data.fairy.color;
  const auraRGB = `${Math.round(fc[0]*255)},${Math.round(fc[1]*255)},${Math.round(fc[2]*255)}`;

  return <section id={data.id} style={{
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "flex-start",
    padding: "0 8vw", position: "relative", zIndex: 4,
  }}>
    <div style={{
      maxWidth: isHero ? "700px" : "520px",
      marginLeft: isHero ? "auto" : index % 2 === 0 ? "0" : "auto",
      marginRight: isHero ? "auto" : index % 2 !== 0 ? "0" : "auto",
      textAlign: isHero ? "center" : "left",
      opacity: isActive ? 1 : 0.04,
      transform: isActive ? "translateY(0) scale(1)" : "translateY(50px) scale(0.97)",
      transition: "opacity 1.2s cubic-bezier(0.25,0.46,0.45,0.94), transform 1.2s cubic-bezier(0.25,0.46,0.45,0.94)",
    }}>
      {/* Spirit indicator */}
      {!isHero && <div style={{
        display: "inline-block", padding: "4px 14px", marginBottom: "1rem",
        border: `1px solid rgba(${auraRGB},0.25)`, borderRadius: "20px",
        fontFamily: "'Cormorant Garamond', serif", fontSize: "10px",
        letterSpacing: "0.3em", textTransform: "uppercase",
        color: `rgba(${auraRGB},0.6)`,
        boxShadow: `0 0 20px rgba(${auraRGB},0.08)`,
      }}>{data.fairy.name}</div>}

      {/* Kanji */}
      <div style={{
        fontFamily: "'Noto Serif JP', serif",
        fontSize: isHero ? "clamp(90px, 16vw, 220px)" : "clamp(60px, 11vw, 150px)",
        fontWeight: 900, color: "transparent",
        WebkitTextStroke: isHero ? `1.5px ${COLORS.steel}` : `1px rgba(${auraRGB},0.5)`,
        lineHeight: 1, letterSpacing: "0.05em", marginBottom: "0.15em",
        textShadow: `0 0 80px rgba(${auraRGB},${isHero ? 0.3 : 0.15})`,
        position: "relative",
      }}>
        {data.kanji}
        {isHero && <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)", width: "120%", height: "2px",
          background: `linear-gradient(90deg, transparent, ${COLORS.blood}, transparent)`,
          opacity: 0.45, animation: "slashReveal 2.5s ease-out forwards",
        }} />}
      </div>

      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: isHero ? "clamp(11px, 1.4vw, 15px)" : "clamp(10px, 1.2vw, 13px)",
        textTransform: "uppercase", letterSpacing: "0.45em",
        color: `rgba(${auraRGB},0.65)`, marginBottom: "0.5rem",
      }}>{data.romaji}</div>

      <h2 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: isHero ? "clamp(24px, 3.5vw, 48px)" : "clamp(18px, 2.5vw, 34px)",
        fontWeight: 300, color: COLORS.paper, letterSpacing: "0.15em", marginBottom: "1rem",
      }}>{data.english}</h2>

      <BladeRule width={isHero ? "120px" : "80px"}
        color={isHero ? COLORS.blood : `rgba(${auraRGB},0.5)`}
        style={isHero ? { margin: "1.5rem auto" } : {}} />

      <p style={{
        fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(15px, 1.6vw, 19px)",
        lineHeight: 1.95, color: COLORS.steel, opacity: 0.65, fontWeight: 300, maxWidth: "480px",
      }}>{data.body}</p>

      {isHero && <div style={{
        marginTop: "3rem", display: "flex", flexDirection: "column",
        alignItems: "center", gap: "0.4rem", opacity: 0.3,
      }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: COLORS.steel }}>Scroll</span>
        <div style={{ width: "1px", height: "40px", background: `linear-gradient(to bottom, ${COLORS.steel}, transparent)`, animation: "scrollDown 2.5s ease-in-out infinite" }} />
      </div>}
    </div>
  </section>;
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════════ */

export default function KatanaFairySpiritWorld() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Noto+Serif+JP:wght@400;700;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    setTimeout(() => setLoaded(true), 500);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const st = window.scrollY;
      const dh = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(dh > 0 ? st / dh : 0);
      setActiveSection(Math.min(SECTIONS.length - 1, Math.max(0, Math.round(st / window.innerHeight))));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <div style={{
    background: COLORS.void, color: COLORS.paper, minHeight: "100vh",
    overflowX: "hidden", cursor: "crosshair",
    opacity: loaded ? 1 : 0, transition: "opacity 1.8s ease",
  }}>
    <style>{`
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body { background: ${COLORS.void}; overflow-x: hidden; }
      ::selection { background: ${COLORS.blood}; color: ${COLORS.paper}; }
      a { text-decoration: none; }
      @keyframes slashReveal {
        0% { width: 0%; opacity: 0; }
        50% { width: 120%; opacity: 0.6; }
        100% { width: 120%; opacity: 0.3; }
      }
      @keyframes scrollDown {
        0%, 100% { transform: translateY(0); opacity: 0.2; }
        50% { transform: translateY(16px); opacity: 0.65; }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateX(-5px); }
        to { opacity: 1; transform: translateX(0); }
      }
      .scroll-blade {
        position: fixed; top: 0; left: 0; height: 2px; z-index: 30;
        background: linear-gradient(90deg, ${COLORS.blood}, ${COLORS.gold}, ${COLORS.blood});
        transition: width 0.1s ease-out;
        box-shadow: 0 0 14px rgba(139,26,26,0.5), 0 0 50px rgba(201,168,76,0.2);
      }
      .noise-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 3;
        pointer-events: none; opacity: 0.025;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        background-size: 256px 256px;
      }
      .vignette {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 3;
        pointer-events: none;
        background: radial-gradient(ellipse at center, transparent 30%, rgba(4,4,10,0.88) 100%);
      }
    `}</style>

    <MainCanvas scrollProgress={scrollProgress} activeSection={activeSection} />
    <div className="noise-overlay" />
    <div className="vignette" />
    <div className="scroll-blade" style={{ width: `${scrollProgress * 100}%` }} />

    <TopBar />
    <NavDots activeSection={activeSection} />
    <KanjiStrip />
    <Seal />

    {SECTIONS.map((s, i) => (
      <Section key={s.id} data={s} index={i} activeSection={activeSection} />
    ))}

    <footer style={{ padding: "4rem 8vw", textAlign: "center", position: "relative", zIndex: 4 }}>
      <BladeRule width="60px" color={COLORS.gold} style={{ margin: "0 auto 1.5rem" }} />
      <p style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "14px", color: COLORS.steel, opacity: 0.2, letterSpacing: "0.2em" }}>一期一会 — One moment, one meeting</p>
    </footer>
  </div>;
}
