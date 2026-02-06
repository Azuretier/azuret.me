import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

const COLORS = {
  void: "#05050a",
  steel: "#c4c4c8",
  blood: "#8b1a1a",
  gold: "#c9a84c",
  paper: "#e8e0d0",
  sakura: "#e8a0b4",
};

const SECTIONS = [
  { id: "hero", kanji: "安定", romaji: "Antei", english: "Stability", body: "Like the stillness of a blade at rest — true power lies not in motion, but in the unwavering calm before it." },
  { id: "happiness", kanji: "幸福", romaji: "Kōfuku", english: "Happiness", body: "Not the fleeting spark of pleasure, but the deep ember that warms without burning. A state cultivated through discipline, not chased through desire." },
  { id: "balance", kanji: "均衡", romaji: "Kinkō", english: "Balance", body: "The katana's edge exists between two planes — neither side dominates. Stable happiness lives in this same equilibrium: between effort and surrender, solitude and connection." },
  { id: "forging", kanji: "鍛造", romaji: "Tanzō", english: "Forging", body: "A blade is folded a thousand times. Each fold removes impurity, adds resilience. Happiness, too, is forged through repeated tempering — shaped by what we endure and release." },
  { id: "stillness", kanji: "静寂", romaji: "Seijaku", english: "Stillness", body: "In the silence after the cut, truth is revealed. Stable happiness is not the absence of storms, but the silence you carry within them." },
];

/* ═══════════════════════════════════════════════════════════════════
   VOXEL WORLD — INSTANCED BOX BLOCKS
   ═══════════════════════════════════════════════════════════════════ */

function buildVoxelBlocks(scene) {
  const GRID = 40;
  const BLOCK_SIZE = 1.0;
  const GAP = 0.12;
  const CELL = BLOCK_SIZE + GAP;

  // Height map function — creates interesting terrain
  function terrainHeight(gx, gz) {
    const wx = (gx - GRID / 2) * CELL;
    const wz = (gz - GRID / 2) * CELL;
    const d = Math.sqrt(wx * wx + wz * wz);

    // Layered terrain
    const mountains = Math.sin(gx * 0.22) * Math.cos(gz * 0.18) * 3.0;
    const hills = Math.sin(gx * 0.12 + gz * 0.08) * 2.0;
    const radial = Math.cos(d * 0.1) * 2.5;
    const detail = Math.sin(gx * 0.45) * Math.sin(gz * 0.5) * 0.6;
    const raw = mountains + hills + radial + detail;

    // Quantize to integer block heights for true voxel look
    return Math.max(1, Math.round(Math.abs(raw) + 1));
  }

  // Count total blocks (stacked columns)
  let totalBlocks = 0;
  const columns = [];
  for (let gx = 0; gx < GRID; gx++) {
    for (let gz = 0; gz < GRID; gz++) {
      const h = terrainHeight(gx, gz);
      columns.push({ gx, gz, h });
      totalBlocks += h; // stack h blocks per column
    }
  }

  // Single box geometry for all instances
  const boxGeo = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  const instanceCount = totalBlocks;

  // Instanced mesh with a MeshStandardMaterial for proper block lighting
  const mat = new THREE.MeshStandardMaterial({
    roughness: 0.55,
    metalness: 0.3,
    vertexColors: true,
  });

  const mesh = new THREE.InstancedMesh(boxGeo, mat, instanceCount);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  // Per-instance color
  const colorAttr = new Float32Array(instanceCount * 3);

  // Color palette for different heights
  const blockPalette = [
    new THREE.Color(0x0c0c14),  // deep void — ground level
    new THREE.Color(0x141020),  // dark indigo
    new THREE.Color(0x1a0a0a),  // dark blood
    new THREE.Color(0x1c1510),  // dark amber
    new THREE.Color(0x201818),  // warm dark
    new THREE.Color(0x2a1515),  // blood mid
    new THREE.Color(0x2a2218),  // gold dark
    new THREE.Color(0x3a1a1a),  // blood bright
    new THREE.Color(0x3a3020),  // gold mid
    new THREE.Color(0x4a2a1a),  // ember
  ];

  const topColor = new THREE.Color(0xc9a84c);    // gold top
  const bloodTop = new THREE.Color(0x8b1a1a);     // blood accent

  const dummy = new THREE.Object3D();
  let idx = 0;

  // Store column data for animation
  const columnData = [];

  for (const col of columns) {
    const wx = (col.gx - GRID / 2) * CELL;
    const wz = (col.gz - GRID / 2) * CELL;

    for (let y = 0; y < col.h; y++) {
      const wy = y * (BLOCK_SIZE + GAP * 0.5);

      dummy.position.set(wx, wy, wz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(idx, dummy.matrix);

      // Color: top blocks are bright, lower blocks are dark
      const isTop = y === col.h - 1;
      const heightRatio = y / Math.max(col.h - 1, 1);

      let c;
      if (isTop) {
        // Top blocks: alternate gold and blood accents
        const accent = Math.sin(col.gx * 0.5 + col.gz * 0.7) > 0.3;
        c = accent ? topColor.clone() : bloodTop.clone();
        // Brighten based on absolute height
        c.multiplyScalar(0.4 + col.h * 0.08);
      } else {
        // Body blocks: dark, getting slightly lighter up
        const palIdx = Math.min(Math.floor(heightRatio * blockPalette.length), blockPalette.length - 1);
        c = blockPalette[palIdx].clone();
        // Add subtle variation
        c.r += Math.sin(col.gx * 0.3 + y * 0.5) * 0.02;
        c.g += Math.cos(col.gz * 0.4 + y * 0.3) * 0.01;
      }

      colorAttr[idx * 3] = c.r;
      colorAttr[idx * 3 + 1] = c.g;
      colorAttr[idx * 3 + 2] = c.b;

      columnData.push({
        colGx: col.gx, colGz: col.gz,
        wx, wz, baseY: wy, stackY: y,
        maxH: col.h, isTop,
        phase: Math.random() * Math.PI * 2,
      });

      idx++;
    }
  }

  // Apply instance colors
  const instanceColorAttr = new THREE.InstancedBufferAttribute(colorAttr, 3);
  boxGeo.setAttribute("color", instanceColorAttr);

  mesh.instanceMatrix.needsUpdate = true;
  mesh.count = instanceCount;

  // Position the whole grid
  const group = new THREE.Group();
  group.add(mesh);
  group.position.set(0, -7, -5);
  group.rotation.x = -0.25;
  group.rotation.y = 0.3;
  scene.add(group);

  return { group, mesh, columnData, dummy, CELL };
}

/* ═══════════════════════════════════════════════════════════════════
   PARTICLE EFFECTS
   ═══════════════════════════════════════════════════════════════════ */

const SPARK_VERT = `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aVel;
  attribute float aType;
  uniform float uTime;
  uniform float uScroll;
  varying float vAlpha;
  varying vec3 vPColor;

  void main() {
    float t = uTime;
    vec3 pos = position;
    float angle = t * aVel.x * 0.5 + aPhase * 6.28;
    pos.x += sin(angle) * aVel.y * 2.5;
    pos.z += cos(angle) * aVel.y * 2.5;
    pos.y += sin(t * aVel.z * 0.3 + aPhase * 5.0) * 1.8;
    pos.y += uScroll * 5.0;
    float life = sin(t * 0.25 + aPhase * 6.28) * 0.5 + 0.5;
    vAlpha = life * 0.9;
    float cp = fract(aPhase + t * 0.06);
    if (aType < 0.33) {
      vPColor = mix(vec3(0.85, 0.7, 0.3), vec3(1.0, 0.9, 0.5), cp);
    } else if (aType < 0.66) {
      vPColor = mix(vec3(0.65, 0.1, 0.05), vec3(1.0, 0.35, 0.1), cp);
    } else {
      vPColor = mix(vec3(0.9, 0.6, 0.7), vec3(1.0, 0.82, 0.92), cp);
    }
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (280.0 / -mv.z) * (0.35 + life * 0.65);
    gl_Position = projectionMatrix * mv;
  }
`;

const SPARK_FRAG = `
  varying float vAlpha;
  varying vec3 vPColor;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float core = exp(-d * 12.0);
    float glow = exp(-d * 4.0) * 0.5;
    float a = (core + glow) * vAlpha;
    gl_FragColor = vec4(vPColor * (1.0 + core * 2.0), a);
  }
`;

const ORB_VERT = `
  attribute float aOSize;
  attribute float aOPhase;
  attribute vec3 aOColor;
  uniform float uTime;
  varying float vOA;
  varying vec3 vOC;
  void main() {
    vec3 pos = position;
    float t = uTime;
    pos.y += sin(t * 0.4 + aOPhase * 14.0) * 1.5;
    pos.x += cos(t * 0.3 + aOPhase * 9.0) * 1.0;
    pos.z += sin(t * 0.2 + aOPhase * 7.0) * 1.1;
    float flicker = sin(t * 2.5 + aOPhase * 30.0) * 0.3 + 0.7;
    vOA = flicker;
    vOC = aOColor;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aOSize * (400.0 / -mv.z) * flicker;
    gl_Position = projectionMatrix * mv;
  }
`;

const ORB_FRAG = `
  varying float vOA;
  varying vec3 vOC;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float core = exp(-d * 14.0);
    float halo = exp(-d * 3.0) * 0.35;
    float a = (core + halo) * vOA;
    gl_FragColor = vec4(vOC * (1.0 + core * 3.5), a);
  }
`;

function buildSparkParticles(scene) {
  const N = 1400;
  const pos = new Float32Array(N * 3);
  const sizes = new Float32Array(N);
  const phases = new Float32Array(N);
  const vels = new Float32Array(N * 3);
  const types = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i*3] = (Math.random()-0.5)*50;
    pos[i*3+1] = Math.random()*20 - 5;
    pos[i*3+2] = (Math.random()-0.5)*50;
    sizes[i] = Math.random()*2.8 + 0.4;
    phases[i] = Math.random();
    vels[i*3] = (Math.random()-0.5)*2 + 0.3;
    vels[i*3+1] = Math.random()*0.7 + 0.1;
    vels[i*3+2] = (Math.random()-0.5) + 0.25;
    types[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  geo.setAttribute("aVel", new THREE.BufferAttribute(vels, 3));
  geo.setAttribute("aType", new THREE.BufferAttribute(types, 1));
  const mat = new THREE.ShaderMaterial({
    vertexShader: SPARK_VERT, fragmentShader: SPARK_FRAG,
    uniforms: { uTime: { value: 0 }, uScroll: { value: 0 } },
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  return { pts, mat };
}

function buildOrbs(scene) {
  const N = 100;
  const pos = new Float32Array(N*3);
  const oSizes = new Float32Array(N);
  const oPhases = new Float32Array(N);
  const oColors = new Float32Array(N*3);
  const pal = [[0.85,0.7,0.3],[0.7,0.12,0.06],[0.92,0.65,0.73],[0.22,0.6,0.55],[1,0.5,0.15]];
  for (let i = 0; i < N; i++) {
    pos[i*3] = (Math.random()-0.5)*40;
    pos[i*3+1] = Math.random()*14 - 3;
    pos[i*3+2] = (Math.random()-0.5)*40;
    oSizes[i] = Math.random()*4 + 1.5;
    oPhases[i] = Math.random();
    const c = pal[Math.floor(Math.random()*pal.length)];
    oColors[i*3]=c[0]; oColors[i*3+1]=c[1]; oColors[i*3+2]=c[2];
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aOSize", new THREE.BufferAttribute(oSizes, 1));
  geo.setAttribute("aOPhase", new THREE.BufferAttribute(oPhases, 1));
  geo.setAttribute("aOColor", new THREE.BufferAttribute(oColors, 3));
  const mat = new THREE.ShaderMaterial({
    vertexShader: ORB_VERT, fragmentShader: ORB_FRAG,
    uniforms: { uTime: { value: 0 } },
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  return { pts, mat };
}

function buildEmbers(scene) {
  const N = 400;
  const pos = new Float32Array(N*3);
  const seeds = [];
  for (let i = 0; i < N; i++) {
    pos[i*3] = (Math.random()-0.5)*40;
    pos[i*3+1] = Math.random()*25 - 8;
    pos[i*3+2] = (Math.random()-0.5)*30;
    seeds.push(Math.random()*100);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xff5522, size: 0.04, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  return { pts, geo, seeds };
}

/* ═══════════════════════════════════════════════════════════════════
   WEBGL CANVAS
   ═══════════════════════════════════════════════════════════════════ */

function VoxelCanvas({ scrollProgress }) {
  const canvasRef = useRef(null);
  const scrollRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => { scrollRef.current = scrollProgress; }, [scrollProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: true, powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05050a, 0.018);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 12, 28);
    camera.lookAt(0, -3, 0);

    // ── Lighting ──
    scene.add(new THREE.AmbientLight(0x12121e, 0.6));

    const sunLight = new THREE.DirectionalLight(0xffeedd, 0.8);
    sunLight.position.set(10, 20, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(1024, 1024);
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 60;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    scene.add(sunLight);

    const bloodLight = new THREE.PointLight(0x8b1a1a, 2.5, 35);
    bloodLight.position.set(-8, 6, -5);
    scene.add(bloodLight);

    const goldLight = new THREE.PointLight(0xc9a84c, 2.0, 30);
    goldLight.position.set(8, 5, 8);
    scene.add(goldLight);

    const fillLight = new THREE.PointLight(0x334466, 0.8, 40);
    fillLight.position.set(0, 10, -15);
    scene.add(fillLight);

    const emberLight = new THREE.PointLight(0xff4411, 1.0, 20);
    emberLight.position.set(0, 3, 0);
    scene.add(emberLight);

    // ── Env map ──
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envS = new THREE.Scene();
    envS.background = new THREE.Color(0x060610);
    const el1 = new THREE.DirectionalLight(0xffffff, 1.5); el1.position.set(1,1,1); envS.add(el1);
    const el2 = new THREE.DirectionalLight(0x8b1a1a, 1); el2.position.set(-1,0,-1); envS.add(el2);
    const el3 = new THREE.DirectionalLight(0xc9a84c, 0.6); el3.position.set(0,-1,1); envS.add(el3);
    scene.environment = pmrem.fromScene(envS).texture;

    // ── Build everything ──
    const voxels = buildVoxelBlocks(scene);
    const sparks = buildSparkParticles(scene);
    const orbs = buildOrbs(scene);
    const embers = buildEmbers(scene);

    // ── Katana blade ──
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(0, -3.2);
    bladeShape.quadraticCurveTo(0.1, -1.5, 0.07, 0);
    bladeShape.quadraticCurveTo(0.05, 1.5, 0.015, 3.0);
    bladeShape.lineTo(0, 3.2);
    bladeShape.lineTo(-0.015, 3.0);
    bladeShape.quadraticCurveTo(-0.02, 1.5, -0.015, 0);
    bladeShape.quadraticCurveTo(-0.005, -1.5, 0, -3.2);

    const blade = new THREE.Mesh(
      new THREE.ExtrudeGeometry(bladeShape, {
        depth: 0.012, bevelEnabled: true, bevelThickness: 0.004,
        bevelSize: 0.004, bevelSegments: 2,
      }),
      new THREE.MeshPhysicalMaterial({
        color: 0xdee0ea, metalness: 0.97, roughness: 0.05,
        clearcoat: 1.0, clearcoatRoughness: 0.02, reflectivity: 1, envMapIntensity: 3.5,
      })
    );
    blade.position.set(4, 3, 4);
    blade.rotation.z = Math.PI / 5;
    scene.add(blade);

    const tsuba = new THREE.Mesh(
      new THREE.TorusGeometry(0.2, 0.035, 12, 24),
      new THREE.MeshPhysicalMaterial({ color: 0x18181e, metalness: 0.9, roughness: 0.2 })
    );
    scene.add(tsuba);

    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.046, 1.5, 8),
      new THREE.MeshPhysicalMaterial({ color: 0x180806, roughness: 0.85, metalness: 0.1 })
    );
    scene.add(handle);

    // ── Events ──
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

    // ── Animation ──
    let time = 0, frame;
    const tmpMatrix = new THREE.Matrix4();
    const tmpPos = new THREE.Vector3();
    const tmpQuat = new THREE.Quaternion();
    const tmpScale = new THREE.Vector3();

    const animate = () => {
      frame = requestAnimationFrame(animate);
      time += 0.004;
      const sp = scrollRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const t = time * 10;

      // ── Animate voxel blocks ──
      const { mesh, columnData, dummy } = voxels;
      for (let i = 0; i < columnData.length; i++) {
        const d = columnData[i];

        // Wave animation on Y position
        const wave = Math.sin(d.wx * 0.2 + t * 0.06 + d.phase) *
                     Math.cos(d.wz * 0.18 + t * 0.04) * 0.5;
        const scrollPulse = Math.sin(d.wx * 0.1 + sp * 4.0 + d.phase) * 0.3;

        const yOffset = (wave + scrollPulse) * (d.isTop ? 1.0 : 0.3);

        mesh.getMatrixAt(i, tmpMatrix);
        tmpMatrix.decompose(tmpPos, tmpQuat, tmpScale);
        tmpPos.y = d.baseY + yOffset;

        // Subtle scale pulse on top blocks
        if (d.isTop) {
          const pulse = 1.0 + Math.sin(t * 0.15 + d.phase) * 0.04;
          tmpScale.set(pulse, pulse, pulse);
        }

        tmpMatrix.compose(tmpPos, tmpQuat, tmpScale);
        mesh.setMatrixAt(i, tmpMatrix);
      }
      mesh.instanceMatrix.needsUpdate = true;

      // Rotate world slowly
      voxels.group.rotation.y = 0.3 + t * 0.002 + sp * 0.5;
      voxels.group.position.y = -7 - sp * 2;

      // ── Particles ──
      sparks.mat.uniforms.uTime.value = t;
      sparks.mat.uniforms.uScroll.value = sp;
      sparks.pts.rotation.y = t * 0.0015;

      orbs.mat.uniforms.uTime.value = t;

      // Embers rise
      const ep = embers.geo.attributes.position.array;
      for (let i = 0; i < ep.length / 3; i++) {
        ep[i*3+1] += 0.02 + embers.seeds[i % embers.seeds.length] * 0.0008;
        ep[i*3] += Math.sin(t * 0.4 + embers.seeds[i % embers.seeds.length]) * 0.005;
        if (ep[i*3+1] > 18) {
          ep[i*3+1] = -8;
          ep[i*3] = (Math.random()-0.5)*40;
          ep[i*3+2] = (Math.random()-0.5)*30;
        }
      }
      embers.geo.attributes.position.needsUpdate = true;
      embers.pts.material.opacity = 0.4 + Math.sin(t * 0.25) * 0.15;

      // ── Blade ──
      blade.position.set(4 - sp*6, 3 + sp*3 + Math.sin(t*0.25)*0.12, 4 - sp*2);
      blade.rotation.z = Math.PI/5 + sp * Math.PI * 0.35;
      blade.rotation.y = Math.sin(t*0.35)*0.03 + mx*0.06;
      blade.rotation.x = my*0.04;

      tsuba.position.copy(blade.position);
      tsuba.position.x -= Math.cos(blade.rotation.z)*0.4;
      tsuba.position.y -= Math.sin(blade.rotation.z)*0.4;
      tsuba.rotation.set(Math.PI/2, 0, blade.rotation.z);

      handle.position.copy(tsuba.position);
      handle.position.x -= Math.cos(blade.rotation.z)*0.8;
      handle.position.y -= Math.sin(blade.rotation.z)*0.8;
      handle.rotation.z = blade.rotation.z - Math.PI/2;

      // ── Lights pulse ──
      bloodLight.intensity = 2.0 + Math.sin(t*0.5)*0.8;
      bloodLight.position.x = Math.sin(t*0.15)*10;
      goldLight.intensity = 1.5 + Math.sin(t*0.35+1)*0.5;
      goldLight.position.z = Math.cos(t*0.12)*10;
      emberLight.intensity = 0.8 + Math.sin(t*0.6)*0.4;
      emberLight.position.y = 3 + Math.sin(t*0.2)*2;

      // ── Camera ──
      camera.position.x = mx * 2.0;
      camera.position.y = 12 + my * 0.8 - sp * 4;
      camera.position.z = 28 - sp * 6;
      camera.lookAt(mx * 0.5, -3 + sp * 3, -sp * 3);

      renderer.render(scene, camera);
    };
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
  return <div style={{
    width, height: "1px",
    background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
    margin: "1.5rem 0", ...style,
  }} />;
}

function KanjiStrip() {
  return <div style={{
    position: "fixed", right: "2.5vw", top: "50%", transform: "translateY(-50%)",
    zIndex: 10, writingMode: "vertical-rl",
    fontFamily: "'Noto Serif JP', serif", fontSize: "clamp(12px, 1.2vw, 16px)",
    color: COLORS.gold, opacity: 0.18, letterSpacing: "0.5em", userSelect: "none",
    textShadow: "0 0 30px rgba(201,168,76,0.3)",
  }}>安定した幸福の道</div>;
}

function Seal() {
  return <div style={{
    position: "fixed", bottom: "3vh", right: "3vw", zIndex: 10,
    width: "52px", height: "52px", border: `1.5px solid ${COLORS.blood}`,
    borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Noto Serif JP', serif", fontSize: "20px",
    color: COLORS.blood, opacity: 0.4, transform: "rotate(-5deg)", userSelect: "none",
    boxShadow: "0 0 25px rgba(139,26,26,0.15)",
  }}>幸</div>;
}

function TopBar() {
  return <header style={{
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 20,
    padding: "1.8rem 3vw", display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "linear-gradient(to bottom, rgba(5,5,10,0.94), transparent)",
    pointerEvents: "none",
  }}>
    <div style={{
      fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(11px, 1vw, 13px)",
      letterSpacing: "0.35em", textTransform: "uppercase", color: COLORS.steel, opacity: 0.5,
    }}>安定した幸福</div>
    <div style={{
      fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(10px, 0.9vw, 12px)",
      letterSpacing: "0.3em", textTransform: "uppercase", color: COLORS.gold, opacity: 0.3,
    }}>Stable Happiness</div>
  </header>;
}

function NavDots({ activeSection }) {
  return <nav style={{
    position: "fixed", left: "2.5vw", top: "50%", transform: "translateY(-50%)",
    zIndex: 20, display: "flex", flexDirection: "column", gap: "18px",
  }}>
    {SECTIONS.map((s, i) => (
      <a key={s.id} href={`#${s.id}`}
        onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" }); }}
        style={{
          width: activeSection === i ? "30px" : "6px", height: "6px", borderRadius: "3px",
          background: activeSection === i ? COLORS.blood : "rgba(200,196,186,0.12)",
          transition: "all 0.6s cubic-bezier(0.25,0.46,0.45,0.94)", cursor: "pointer",
          border: "none", display: "block",
          boxShadow: activeSection === i ? "0 0 18px rgba(139,26,26,0.6)" : "none",
        }}
        title={s.english}
      />
    ))}
  </nav>;
}

function Section({ data, index, activeSection }) {
  const isActive = activeSection === index;
  const isHero = index === 0;

  return <section id={data.id} style={{
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "flex-start",
    padding: "0 8vw", position: "relative", zIndex: 4,
  }}>
    <div style={{
      maxWidth: isHero ? "700px" : "520px",
      marginLeft: isHero ? "auto" : index % 2 === 0 ? "0" : "auto",
      marginRight: isHero ? "auto" : index % 2 !== 0 ? "0" : "auto",
      textAlign: isHero ? "center" : "left",
      opacity: isActive ? 1 : 0.05,
      transform: isActive ? "translateY(0) scale(1)" : "translateY(50px) scale(0.97)",
      transition: "opacity 1.1s cubic-bezier(0.25,0.46,0.45,0.94), transform 1.1s cubic-bezier(0.25,0.46,0.45,0.94)",
    }}>
      {/* Kanji */}
      <div style={{
        fontFamily: "'Noto Serif JP', serif",
        fontSize: isHero ? "clamp(90px, 16vw, 220px)" : "clamp(60px, 11vw, 150px)",
        fontWeight: 900, color: "transparent",
        WebkitTextStroke: isHero ? `1.5px ${COLORS.steel}` : `1px rgba(201,168,76,0.6)`,
        lineHeight: 1, letterSpacing: "0.05em", marginBottom: "0.15em",
        textShadow: isHero ? "0 0 100px rgba(139,26,26,0.4)" : "0 0 60px rgba(201,168,76,0.1)",
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

      {/* Romaji */}
      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: isHero ? "clamp(11px, 1.4vw, 15px)" : "clamp(10px, 1.2vw, 13px)",
        textTransform: "uppercase", letterSpacing: "0.45em",
        color: COLORS.gold, opacity: 0.55, marginBottom: "0.5rem",
      }}>{data.romaji}</div>

      {/* English */}
      <h2 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: isHero ? "clamp(24px, 3.5vw, 48px)" : "clamp(18px, 2.5vw, 34px)",
        fontWeight: 300, color: COLORS.paper, letterSpacing: "0.15em", marginBottom: "1rem",
      }}>{data.english}</h2>

      <BladeRule width={isHero ? "120px" : "80px"} color={isHero ? COLORS.blood : COLORS.gold}
        style={isHero ? { margin: "1.5rem auto" } : {}} />

      {/* Body */}
      <p style={{
        fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(15px, 1.6vw, 19px)",
        lineHeight: 1.95, color: COLORS.steel, opacity: 0.65, fontWeight: 300, maxWidth: "480px",
      }}>{data.body}</p>

      {isHero && <div style={{
        marginTop: "3rem", display: "flex", flexDirection: "column",
        alignItems: "center", gap: "0.4rem", opacity: 0.3,
      }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: "10px",
          letterSpacing: "0.3em", textTransform: "uppercase", color: COLORS.steel,
        }}>Scroll</span>
        <div style={{
          width: "1px", height: "40px",
          background: `linear-gradient(to bottom, ${COLORS.steel}, transparent)`,
          animation: "scrollDown 2.5s ease-in-out infinite",
        }} />
      </div>}
    </div>
  </section>;
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════════ */

export default function KatanaVoxelWorld() {
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
        background: radial-gradient(ellipse at center, transparent 30%, rgba(5,5,10,0.88) 100%);
      }
    `}</style>

    <VoxelCanvas scrollProgress={scrollProgress} />
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
      <p style={{
        fontFamily: "'Noto Serif JP', serif", fontSize: "14px",
        color: COLORS.steel, opacity: 0.2, letterSpacing: "0.2em",
      }}>一期一会 — One moment, one meeting</p>
    </footer>
  </div>;
}
