"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const COLORS = {
    void: "#04040a",
    gold: "#c9a84c",
    blood: "#8b1a1a",
};

function buildVoxelWorld(scene: THREE.Scene) {
    const G = 36, BS = 0.9, GAP = 0.1, CELL = BS + GAP;

    const heightAt = (x: number, z: number) => {
        const px = (x - G / 2) * CELL, pz = (z - G / 2) * CELL;
        const d = Math.sqrt(px * px + pz * pz);
        const h = Math.sin(x * 0.24) * Math.cos(z * 0.2) * 2.5 + Math.sin(x * 0.11 + z * 0.09) * 2.0 + Math.cos(d * 0.11) * 2.2 + Math.sin(x * 0.5) * Math.sin(z * 0.5) * 0.4;
        return Math.max(1, Math.round(Math.abs(h) + 1));
    };

    let total = 0;
    const cols: { x: number; z: number; h: number }[] = [];
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
    const colData: { wx: number; wz: number; baseY: number; isTop: boolean; maxH: number; phase: number }[] = [];
    let idx = 0;

    for (const col of cols) {
        const wx = (col.x - G / 2) * CELL, wz = (col.z - G / 2) * CELL;
        for (let y = 0; y < col.h; y++) {
            const wy = y * (BS + GAP * 0.4);
            dummy.position.set(wx, wy, wz);
            dummy.scale.set(1, 1, 1);
            dummy.updateMatrix();
            mesh.setMatrixAt(idx, dummy.matrix);

            const isTop = y === col.h - 1;
            let c: THREE.Color;
            if (isTop) {
                c = (Math.sin(col.x * 0.5 + col.z * 0.7) > 0.2 ? topGold : topBlood).clone();
                c.multiplyScalar(0.35 + col.h * 0.07);
            } else {
                const hr = y / Math.max(col.h - 1, 1);
                c = palC[Math.min(Math.floor(hr * palC.length), palC.length - 1)].clone();
                c.r += Math.sin(col.x * 0.3 + y * 0.5) * 0.015;
            }
            colorArr[idx * 3] = c.r; colorArr[idx * 3 + 1] = c.g; colorArr[idx * 3 + 2] = c.b;
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

// Ambient particle shaders
const AMBIENT_VERT = `
  attribute float aSize;
  attribute float aPhase;
  attribute float aType;
  uniform float uTime;
  varying float vAlpha;
  varying vec3 vPColor;

  void main() {
    float t = uTime;
    vec3 pos = position;
    float angle = t * 0.3 + aPhase * 6.28;
    pos.x += sin(angle) * 1.5;
    pos.z += cos(angle) * 1.5;
    pos.y += sin(t * 0.2 + aPhase * 4.0) * 1.2;

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

function buildAmbientParticles(scene: THREE.Scene) {
    const N = 600;
    const pos = new Float32Array(N * 3);
    const sizes = new Float32Array(N);
    const phases = new Float32Array(N);
    const types = new Float32Array(N);

    for (let i = 0; i < N; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 50;
        pos[i * 3 + 1] = Math.random() * 18 - 5;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
        sizes[i] = Math.random() * 2 + 0.3;
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
        uniforms: { uTime: { value: 0 } },
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });

    const pts = new THREE.Points(geo, mat);
    scene.add(pts);
    return { pts, mat };
}

function buildEmbers(scene: THREE.Scene) {
    const N = 200;
    const pos = new Float32Array(N * 3);
    const seeds: number[] = [];
    for (let i = 0; i < N; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 40;
        pos[i * 3 + 1] = Math.random() * 22 - 8;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
        seeds.push(Math.random() * 100);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
        color: 0xff5522, size: 0.035, transparent: true, opacity: 0.5,
        blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
    });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);
    return { pts, geo, seeds };
}

export default function VoxelTerrainCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x04040a, 0.018);

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
        const light1 = new THREE.DirectionalLight(0xffffff, 1.5);
        light1.position.set(1, 1, 1);
        envS.add(light1);
        const light2 = new THREE.DirectionalLight(0x8b1a1a, 1);
        light2.position.set(-1, 0, -1);
        envS.add(light2);
        const light3 = new THREE.DirectionalLight(0xc9a84c, 0.6);
        light3.position.set(0, -1, 1);
        envS.add(light3);
        scene.environment = pmrem.fromScene(envS).texture;

        // Build voxel world
        const voxels = buildVoxelWorld(scene);

        // Build ambient particles and embers
        const ambient = buildAmbientParticles(scene);
        const embers = buildEmbers(scene);

        // Events
        const onResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", onResize);

        const onMouse = (e: MouseEvent) => {
            mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener("mousemove", onMouse);

        // Animation
        let time = 0;
        let frame: number;
        const tmpM = new THREE.Matrix4();
        const tmpP = new THREE.Vector3();
        const tmpQ = new THREE.Quaternion();
        const tmpS = new THREE.Vector3();

        const animate = () => {
            frame = requestAnimationFrame(animate);
            time += 0.004;
            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;
            const t = time * 10;

            // Voxel animation
            for (let i = 0; i < voxels.colData.length; i++) {
                const d = voxels.colData[i];
                const wave = Math.sin(d.wx * 0.2 + t * 0.05 + d.phase) * Math.cos(d.wz * 0.18 + t * 0.035) * 0.4;
                const yOff = wave * (d.isTop ? 1.0 : 0.2);

                voxels.mesh.getMatrixAt(i, tmpM);
                tmpM.decompose(tmpP, tmpQ, tmpS);
                tmpP.y = d.baseY + yOff;
                if (d.isTop) {
                    const p = 1.0 + Math.sin(t * 0.12 + d.phase) * 0.03;
                    tmpS.set(p, p, p);
                }
                tmpM.compose(tmpP, tmpQ, tmpS);
                voxels.mesh.setMatrixAt(i, tmpM);
            }
            voxels.mesh.instanceMatrix.needsUpdate = true;
            voxels.group.rotation.y = 0.3 + t * 0.0015;

            // Ambient particles
            ambient.mat.uniforms.uTime.value = t;

            // Embers
            const ep = embers.geo.attributes.position.array as Float32Array;
            for (let i = 0; i < ep.length / 3; i++) {
                ep[i * 3 + 1] += 0.016 + embers.seeds[i % embers.seeds.length] * 0.0007;
                ep[i * 3] += Math.sin(t * 0.35 + embers.seeds[i % embers.seeds.length]) * 0.004;
                if (ep[i * 3 + 1] > 16) {
                    ep[i * 3 + 1] = -8;
                    ep[i * 3] = (Math.random() - 0.5) * 40;
                    ep[i * 3 + 2] = (Math.random() - 0.5) * 30;
                }
            }
            embers.geo.attributes.position.needsUpdate = true;

            // Camera with mouse parallax
            camera.position.x = mx * 2.5;
            camera.position.y = 10 + my * 0.6;
            camera.position.z = 26;
            camera.lookAt(mx * 0.8, -1, 0);

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

    return (
        <>
            <canvas
                ref={canvasRef}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    zIndex: 0,
                }}
            />
            {/* Vignette overlay */}
            <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1,
                pointerEvents: "none",
                background: "radial-gradient(ellipse at center, transparent 30%, rgba(4,4,10,0.88) 100%)",
            }} />
            {/* Noise overlay */}
            <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1,
                pointerEvents: "none",
                opacity: 0.025,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundSize: "256px 256px",
            }} />
        </>
    );
}
