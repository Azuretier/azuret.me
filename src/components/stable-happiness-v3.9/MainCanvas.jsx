/* ═══════════════════════════════════════════════════════════════════
   MAIN CANVAS - Three.js 3D Scene Component
   ═══════════════════════════════════════════════════════════════════ */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
    buildVoxelWorld, createSword, buildFairyAura, buildFairyCore,
    buildFlourish, buildSparkExplosion, buildAmbient, buildTextSystem,
    buildBoardEdgeGlow,
} from "./builders";

export default function MainCanvas({ scrollProgress, activeSection, sections }) {
    const canvasRef = useRef(null);
    const scrollRef = useRef(0);
    const activeRef = useRef(0);
    const mouseRef = useRef({ x: 0, y: 0 });
    const typewriterRef = useRef({ progress: {}, sparkTimes: {}, started: {} });

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
        scene.fog = new THREE.FogExp2(0x04040a, 0.014);

        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
        camera.position.set(0, 8, 22);

        // Lighting
        scene.add(new THREE.AmbientLight(0x10101a, 0.5));
        const sun = new THREE.DirectionalLight(0xffeedd, 0.4);
        sun.position.set(8, 15, 10); scene.add(sun);

        // Env map
        const pmrem = new THREE.PMREMGenerator(renderer);
        const envS = new THREE.Scene();
        envS.background = new THREE.Color(0x060610);
        const d1 = new THREE.DirectionalLight(0xffffff, 1.5); d1.position.set(1, 1, 1); envS.add(d1);
        const d2 = new THREE.DirectionalLight(0x8b1a1a, 0.8); d2.position.set(-1, 0, -1); envS.add(d2);
        const d3 = new THREE.DirectionalLight(0xc9a84c, 0.5); d3.position.set(0, -1, 1); envS.add(d3);
        scene.environment = pmrem.fromScene(envS).texture;

        // Build world
        const voxels = buildVoxelWorld(scene);
        const edgeGlow = buildBoardEdgeGlow(voxels.group);
        const ambient = buildAmbient(scene);

        // Build fairy systems + text
        const fairySystems = [];
        const typewriterState = typewriterRef.current;

        sections.forEach((sec, i) => {
            const angle = (i / sections.length) * Math.PI * 2 - Math.PI / 2;
            const r = 6;
            const cx = Math.cos(angle) * r, cz = Math.sin(angle) * r, cy = 2.5;

            const sword = createSword(sec.fairy.sword);
            sword.position.set(cx, cy, cz); scene.add(sword);

            const fairyCore = buildFairyCore(scene, sec.fairy.aura);
            const aura = buildFairyAura(scene, sec.fairy);
            const flourish = buildFlourish(scene, sec.fairy);
            const spark = buildSparkExplosion(scene, sec.fairy);
            const text = buildTextSystem(scene, sec, i, sections.length);

            typewriterState.progress[i] = 0;
            typewriterState.sparkTimes[i] = -100;
            typewriterState.started[i] = false;

            fairySystems.push({
                sword, fairyCore, aura, flourish, spark, text,
                cx, cy, cz, smoothActive: 0,
                fc: sec.fairy.color, auraHex: sec.fairy.aura,
            });
        });

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

        // Animation
        let time = 0, frame;
        const tmpM = new THREE.Matrix4(), tmpP = new THREE.Vector3(), tmpQ = new THREE.Quaternion(), tmpS = new THREE.Vector3();

        const animate = () => {
            frame = requestAnimationFrame(animate);
            time += 0.004;
            const sp = scrollRef.current;
            const ai = activeRef.current;
            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;
            const t = time * 10;

            // Voxels
            for (let i = 0; i < voxels.colData.length; i++) {
                const d = voxels.colData[i];
                const wave = Math.sin(d.wx * 0.2 + t * 0.04 + d.phase) * Math.cos(d.wz * 0.18 + t * 0.03) * 0.35;
                voxels.mesh.getMatrixAt(i, tmpM); tmpM.decompose(tmpP, tmpQ, tmpS);
                tmpP.y = d.baseY + wave * (d.isTop ? 1 : 0.15);
                if (d.isTop) { const p = 1 + Math.sin(t * 0.1 + d.phase) * 0.025; tmpS.set(p, p, p); }
                tmpM.compose(tmpP, tmpQ, tmpS); voxels.mesh.setMatrixAt(i, tmpM);
            }
            voxels.mesh.instanceMatrix.needsUpdate = true;
            voxels.group.rotation.y = 0.3 + t * 0.001 + sp * 0.35;
            voxels.group.position.y = -9 - sp * 1.5;

            edgeGlow.mat.uniforms.uTime.value = t;

            ambient.mat.uniforms.uTime.value = t;
            ambient.mat.uniforms.uScroll.value = sp;

            // Fairy-Sword-Text Systems
            for (let i = 0; i < fairySystems.length; i++) {
                const fs = fairySystems[i];
                const isActive = ai === i;
                const target = isActive ? 1.0 : 0.1;
                fs.smoothActive += (target - fs.smoothActive) * 0.035;

                // Sword float + spin
                const swordY = fs.cy + Math.sin(t * 0.12 + i * 1.2) * 0.35;
                const sSpin = t * (isActive ? 0.03 : 0.012) + i * 1.25;
                fs.sword.position.y = swordY;
                fs.sword.rotation.z = Math.PI / 6 + Math.sin(sSpin) * 0.12;
                fs.sword.rotation.y = sSpin;
                const sc = 0.6 + fs.smoothActive * 0.5;
                fs.sword.scale.set(sc, sc, sc);
                if (fs.sword.children[0]?.material) fs.sword.children[0].material.emissiveIntensity = 0.04 + fs.smoothActive * 0.2;

                // Fairy orbit
                const fR = 1.6 + Math.sin(t * 0.08 + i) * 0.4;
                const fSpeed = isActive ? 0.06 : 0.025;
                const fAngle = t * fSpeed + i * 1.25;
                const fx = fs.cx + Math.cos(fAngle) * fR;
                const fz = fs.cz + Math.sin(fAngle) * fR;
                const fy = swordY + 0.7 + Math.sin(t * 0.15 + i * 2) * 0.5;
                fs.fairyCore.group.position.set(fx, fy, fz);
                fs.fairyCore.core.material.opacity = 0.4 + fs.smoothActive * 0.6;
                fs.fairyCore.glow.material.opacity = 0.06 + fs.smoothActive * 0.12;
                fs.fairyCore.outer.material.opacity = 0.02 + fs.smoothActive * 0.06;
                fs.fairyCore.light.intensity = 0.3 + fs.smoothActive * 2.5;
                const csc = 0.7 + fs.smoothActive * 0.5 + Math.sin(t * 0.25) * 0.08;
                fs.fairyCore.group.scale.set(csc, csc, csc);

                // Aura
                fs.aura.mat.uniforms.uTime.value = t;
                fs.aura.mat.uniforms.uFairyPos.value.set(fx, fy, fz);
                fs.aura.mat.uniforms.uSwordPos.value.copy(fs.sword.position);
                fs.aura.mat.uniforms.uActive.value = fs.smoothActive;

                // Typewriter
                const tw = typewriterState;
                if (isActive && !tw.started[i]) { tw.started[i] = true; tw.progress[i] = 0; tw.sparkTimes[i] = -100; }
                if (!isActive) { tw.started[i] = false; tw.progress[i] = Math.max(0, tw.progress[i] - 0.003); }
                if (tw.started[i] && tw.progress[i] < 1.0) {
                    tw.progress[i] = Math.min(1.0, tw.progress[i] + 0.004);
                    if (tw.progress[i] >= 1.0 && tw.sparkTimes[i] < 0) tw.sparkTimes[i] = t;
                }

                // Update text shaders
                fs.text.bodyMat.uniforms.uTime.value = t;
                fs.text.bodyMat.uniforms.uProgress.value = tw.progress[i];
                const sparkElapsed = t - tw.sparkTimes[i];
                fs.text.bodyMat.uniforms.uSpark.value = (sparkElapsed > 0 && sparkElapsed < 3) ? Math.min(sparkElapsed, 1.0) : 0;

                fs.text.bodyPlane.lookAt(camera.position);
                fs.text.kanjiPlane.lookAt(camera.position);
                fs.text.kanjiMat.uniforms.uTime.value = t;
                fs.text.kanjiMat.uniforms.uActive.value = fs.smoothActive;

                // Flourish particles
                const cursorFrac = tw.progress[i];
                const cursorLocalX = -3 + cursorFrac * 6;
                fs.flourish.mat.uniforms.uTime.value = t;
                fs.flourish.mat.uniforms.uCursorX.value = fs.text.cx + Math.sin(Math.atan2(-fs.text.cz, -fs.text.cx)) * cursorLocalX * 0.3;
                fs.flourish.mat.uniforms.uCursorY.value = 1.8;
                fs.flourish.mat.uniforms.uCursorZ.value = fs.text.cz + Math.cos(Math.atan2(-fs.text.cz, -fs.text.cx)) * cursorLocalX * 0.3;
                fs.flourish.mat.uniforms.uActive.value = (tw.started[i] && tw.progress[i] < 1.0) ? fs.smoothActive : fs.smoothActive * 0.15;

                // Spark explosion
                fs.spark.mat.uniforms.uTime.value = t;
                fs.spark.mat.uniforms.uTrigger.value = tw.sparkTimes[i];
                fs.spark.mat.uniforms.uOrigin.value.set(fs.text.cx, 2.0, fs.text.cz);
            }

            // Camera
            camera.position.x = mx * 2.2;
            camera.position.y = 8 + my * 0.5 - sp * 2.5;
            camera.position.z = 22 - sp * 4;
            camera.lookAt(mx * 0.6, 0.5 + sp * 1.5, -sp * 2);

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("resize", onResize);
            window.removeEventListener("mousemove", onMouse);
            renderer.dispose(); pmrem.dispose();
        };
    }, [sections]);

    return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 0 }} />;
}
