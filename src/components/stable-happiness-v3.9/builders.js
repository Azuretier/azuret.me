/* ═══════════════════════════════════════════════════════════════════
   BUILDERS - Three.js Scene Construction Functions
   ═══════════════════════════════════════════════════════════════════ */

import * as THREE from "three";
import {
    TEXT_VERT, TEXT_FRAG, KANJI_VERT, KANJI_FRAG,
    FAIRY_VERT, FAIRY_FRAG, FLOURISH_VERT, FLOURISH_FRAG,
    SPARK_VERT, SPARK_FRAG, AMB_VERT, AMB_FRAG,
} from "./shaders";
import { renderTextToCanvas, renderKanjiCanvas } from "./utils";

export function buildVoxelWorld(scene) {
    const G = 32, BS = 0.85, GAP = 0.12, CELL = BS + GAP;
    const heightAt = (x, z) => {
        const px = (x - G / 2) * CELL, pz = (z - G / 2) * CELL, d = Math.sqrt(px * px + pz * pz);
        return Math.max(1, Math.round(Math.abs(Math.sin(x * 0.24) * Math.cos(z * 0.2) * 2.2 + Math.sin(x * 0.12 + z * 0.09) * 1.8 + Math.cos(d * 0.11) * 2.0) + 1));
    };
    let total = 0; const cols = [];
    for (let x = 0; x < G; x++) for (let z = 0; z < G; z++) { const h = heightAt(x, z); cols.push({ x, z, h }); total += h; }
    const geo = new THREE.BoxGeometry(BS, BS, BS);
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.25, vertexColors: true });
    const mesh = new THREE.InstancedMesh(geo, mat, total);
    const ca = new Float32Array(total * 3);
    const pal = [0x0a0a14, 0x10101e, 0x180a0a, 0x1a1510, 0x1c1616, 0x261212, 0x261e14, 0x341616, 0x342a1c].map(p => new THREE.Color(p));
    const topG = new THREE.Color(0xc9a84c), topB = new THREE.Color(0x8b1a1a);
    const dummy = new THREE.Object3D(); const colData = []; let idx = 0;
    for (const col of cols) {
        const wx = (col.x - G / 2) * CELL, wz = (col.z - G / 2) * CELL;
        for (let y = 0; y < col.h; y++) {
            const wy = y * (BS + GAP * 0.4);
            dummy.position.set(wx, wy, wz); dummy.scale.set(1, 1, 1); dummy.updateMatrix();
            mesh.setMatrixAt(idx, dummy.matrix);
            const isTop = y === col.h - 1; let c;
            if (isTop) { c = (Math.sin(col.x * 0.5 + col.z * 0.7) > 0.2 ? topG : topB).clone(); c.multiplyScalar(0.3 + col.h * 0.06); }
            else { const hr = y / Math.max(col.h - 1, 1); c = pal[Math.min(Math.floor(hr * pal.length), pal.length - 1)].clone(); }
            ca[idx * 3] = c.r; ca[idx * 3 + 1] = c.g; ca[idx * 3 + 2] = c.b;
            colData.push({ wx, wz, baseY: wy, isTop, phase: Math.random() * Math.PI * 2 });
            idx++;
        }
    }
    geo.setAttribute("color", new THREE.InstancedBufferAttribute(ca, 3));
    mesh.instanceMatrix.needsUpdate = true;
    const group = new THREE.Group(); group.add(mesh);
    group.position.set(0, -9, -10); group.rotation.x = -0.2; group.rotation.y = 0.3;
    scene.add(group);
    return { group, mesh, colData };
}

export function createSword(color) {
    const s = new THREE.Shape();
    s.moveTo(0, -1.8); s.quadraticCurveTo(0.06, -0.8, 0.04, 0); s.quadraticCurveTo(0.03, 0.8, 0.01, 1.6);
    s.lineTo(0, 1.8); s.lineTo(-0.01, 1.6); s.quadraticCurveTo(-0.012, 0.8, -0.008, 0); s.quadraticCurveTo(-0.003, -0.8, 0, -1.8);
    const blade = new THREE.Mesh(
        new THREE.ExtrudeGeometry(s, { depth: 0.007, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 2 }),
        new THREE.MeshPhysicalMaterial({ color, metalness: 0.96, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 3, emissive: color, emissiveIntensity: 0.08 })
    );
    const tsuba = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 8, 16), new THREE.MeshPhysicalMaterial({ color: 0x16161c, metalness: 0.9, roughness: 0.2 }));
    tsuba.rotation.x = Math.PI / 2; tsuba.position.y = -1.8;
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.026, 0.8, 6), new THREE.MeshPhysicalMaterial({ color: 0x120604, roughness: 0.85 }));
    handle.position.y = -2.25;
    const g = new THREE.Group(); g.add(blade, tsuba, handle); return g;
}

export function buildFairyAura(scene, fData) {
    const N = 100, pos = new Float32Array(N * 3), sizes = new Float32Array(N), phases = new Float32Array(N),
        orbits = new Float32Array(N), colors = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
        sizes[i] = Math.random() * 3 + 0.8; phases[i] = Math.random(); orbits[i] = Math.random();
        colors[i * 3] = fData.color[0]; colors[i * 3 + 1] = fData.color[1]; colors[i * 3 + 2] = fData.color[2];
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geo.setAttribute("aOrbit", new THREE.BufferAttribute(orbits, 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.ShaderMaterial({
        vertexShader: FAIRY_VERT, fragmentShader: FAIRY_FRAG,
        uniforms: { uTime: { value: 0 }, uFairyPos: { value: new THREE.Vector3() }, uSwordPos: { value: new THREE.Vector3() }, uActive: { value: 0 } },
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const pts = new THREE.Points(geo, mat); scene.add(pts);
    return { pts, mat };
}

export function buildFairyCore(scene, auraColor) {
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }));
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), new THREE.MeshBasicMaterial({ color: auraColor, transparent: true, opacity: 0.12, side: THREE.BackSide }));
    const outer = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 12), new THREE.MeshBasicMaterial({ color: auraColor, transparent: true, opacity: 0.05, side: THREE.BackSide }));
    const light = new THREE.PointLight(auraColor, 1.5, 10);
    const g = new THREE.Group(); g.add(core, glow, outer, light); scene.add(g);
    return { group: g, core, glow, outer, light };
}

export function buildFlourish(scene, fData) {
    const N = 150, pos = new Float32Array(N * 3), sizes = new Float32Array(N), phases = new Float32Array(N),
        births = new Float32Array(N), vels = new Float32Array(N * 3), fcolors = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
        sizes[i] = Math.random() * 2.5 + 0.5; phases[i] = Math.random(); births[i] = Math.random() * 4;
        const a = Math.random() * Math.PI * 2, e = Math.random() * Math.PI - Math.PI / 2;
        const sp = Math.random() * 0.8 + 0.2;
        vels[i * 3] = Math.cos(a) * Math.cos(e) * sp; vels[i * 3 + 1] = Math.sin(e) * sp * 0.6 + 0.3; vels[i * 3 + 2] = Math.sin(a) * Math.cos(e) * sp;
        fcolors[i * 3] = fData.color[0] * 0.8 + 0.2; fcolors[i * 3 + 1] = fData.color[1] * 0.8 + 0.2; fcolors[i * 3 + 2] = fData.color[2] * 0.8 + 0.2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geo.setAttribute("aBirth", new THREE.BufferAttribute(births, 1));
    geo.setAttribute("aVel", new THREE.BufferAttribute(vels, 3));
    geo.setAttribute("aFColor", new THREE.BufferAttribute(fcolors, 3));
    const mat = new THREE.ShaderMaterial({
        vertexShader: FLOURISH_VERT, fragmentShader: FLOURISH_FRAG,
        uniforms: { uTime: { value: 0 }, uCursorX: { value: 0 }, uCursorY: { value: 0 }, uCursorZ: { value: 0 }, uActive: { value: 0 } },
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const pts = new THREE.Points(geo, mat); scene.add(pts);
    return { pts, mat };
}

export function buildSparkExplosion(scene, fData) {
    const N = 250, pos = new Float32Array(N * 3), sizes = new Float32Array(N), dirs = new Float32Array(N * 3),
        speeds = new Float32Array(N), scolors = new Float32Array(N * 3), delays = new Float32Array(N);
    for (let i = 0; i < N; i++) {
        sizes[i] = Math.random() * 3 + 1; delays[i] = Math.random() * 0.3;
        const a = Math.random() * Math.PI * 2, e = (Math.random() - 0.5) * Math.PI;
        dirs[i * 3] = Math.cos(a) * Math.cos(e); dirs[i * 3 + 1] = Math.sin(e); dirs[i * 3 + 2] = Math.sin(a) * Math.cos(e);
        speeds[i] = Math.random() * 1.5 + 0.5;
        const bright = 0.5 + Math.random() * 0.5;
        scolors[i * 3] = fData.color[0] * bright + 0.3; scolors[i * 3 + 1] = fData.color[1] * bright + 0.3; scolors[i * 3 + 2] = fData.color[2] * bright + 0.3;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aDir", new THREE.BufferAttribute(dirs, 3));
    geo.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute("aSColor", new THREE.BufferAttribute(scolors, 3));
    geo.setAttribute("aDelay", new THREE.BufferAttribute(delays, 1));
    const mat = new THREE.ShaderMaterial({
        vertexShader: SPARK_VERT, fragmentShader: SPARK_FRAG,
        uniforms: { uTime: { value: 0 }, uTrigger: { value: -100 }, uOrigin: { value: new THREE.Vector3() } },
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const pts = new THREE.Points(geo, mat); scene.add(pts);
    return { pts, mat };
}

export function buildAmbient(scene) {
    const N = 600, pos = new Float32Array(N * 3), sizes = new Float32Array(N), phases = new Float32Array(N), types = new Float32Array(N);
    for (let i = 0; i < N; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 45; pos[i * 3 + 1] = Math.random() * 16 - 4; pos[i * 3 + 2] = (Math.random() - 0.5) * 45;
        sizes[i] = Math.random() * 1.8 + 0.3; phases[i] = Math.random(); types[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geo.setAttribute("aType", new THREE.BufferAttribute(types, 1));
    const mat = new THREE.ShaderMaterial({
        vertexShader: AMB_VERT, fragmentShader: AMB_FRAG,
        uniforms: { uTime: { value: 0 }, uScroll: { value: 0 } },
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const pts = new THREE.Points(geo, mat); scene.add(pts);
    return { pts, mat };
}

export function buildTextSystem(scene, sectionData, index, sectionsLength) {
    const fc = sectionData.fairy.color;
    const bodyCanvas = renderTextToCanvas(sectionData.body, {
        fontSize: 28, fontFamily: '"Cormorant Garamond", Georgia, serif',
        color: "#ffffff", width: 1024, height: 80, align: "left",
    });
    const bodyTex = new THREE.CanvasTexture(bodyCanvas);
    bodyTex.minFilter = THREE.LinearFilter; bodyTex.magFilter = THREE.LinearFilter;

    const bodyMat = new THREE.ShaderMaterial({
        vertexShader: TEXT_VERT, fragmentShader: TEXT_FRAG,
        uniforms: {
            uTexture: { value: bodyTex }, uTime: { value: 0 },
            uProgress: { value: 0 }, uSpark: { value: 0 },
            uColor: { value: new THREE.Vector3(fc[0] * 0.6 + 0.4, fc[1] * 0.6 + 0.4, fc[2] * 0.6 + 0.4) },
        },
        transparent: true, side: THREE.DoubleSide, depthWrite: false,
    });
    const bodyPlane = new THREE.Mesh(new THREE.PlaneGeometry(6, 0.5), bodyMat);

    const kanjiCanvas = renderKanjiCanvas(sectionData.kanji, { fontSize: 160, color: "#ffffff", width: 512, height: 256 });
    const kanjiTex = new THREE.CanvasTexture(kanjiCanvas);
    kanjiTex.minFilter = THREE.LinearFilter;

    const kanjiMat = new THREE.ShaderMaterial({
        vertexShader: KANJI_VERT, fragmentShader: KANJI_FRAG,
        uniforms: {
            uTexture: { value: kanjiTex }, uTime: { value: 0 }, uActive: { value: 0 },
            uColor: { value: new THREE.Vector3(fc[0], fc[1], fc[2]) },
        },
        transparent: true, side: THREE.DoubleSide, depthWrite: false,
    });
    const kanjiPlane = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.5), kanjiMat);

    const angle = (index / sectionsLength) * Math.PI * 2 - Math.PI / 2;
    const radius = 6;
    const cx = Math.cos(angle) * radius, cz = Math.sin(angle) * radius;
    kanjiPlane.position.set(cx, 3.5, cz); kanjiPlane.lookAt(0, 3.5, 0);
    bodyPlane.position.set(cx, 1.8, cz); bodyPlane.lookAt(0, 1.8, 0);
    scene.add(kanjiPlane); scene.add(bodyPlane);
    return { bodyPlane, bodyMat, kanjiPlane, kanjiMat, cx, cz };
}
