"use client";

/**
 * ProceduralWatch — a 38mm steel watch built entirely in code (no .glb needed).
 * The dial uses the real stone macro photo for each piece, so every watch keeps
 * its own citrine / rose quartz / amethyst / tiger's eye / sunstone / sodalite face.
 *
 * Props
 *   stoneId   – one of the six watch ids
 *   turn      – framer-motion MotionValue (radians) for the scroll-driven turn
 *   spinKey   – number that changes whenever the watch changes (+1 next, -1 prev);
 *               each change plays one full 360° spin
 */

import React, { Suspense, useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, ContactShadows, useTexture } from "@react-three/drei";

const DIALS = {
    overflow: "/images/dial-macro-overflow.webp",
    cherish: "/images/dial-macro-cherish.webp",
    hush: "/images/dial-macro-hush.webp",
    ascent: "/images/dial-macro-ascent.webp",
    wildfire: "/images/dial-macro-wildfire.webp",
    cadence: "/images/dial-macro-cadence.webp",
};
const DIAL_IDS = Object.keys(DIALS);

/* ---------- Materials ---------- */
function useSteel() {
    return useMemo(
        () => ({
            brushed: new THREE.MeshStandardMaterial({ color: "#C9CDD3", metalness: 1, roughness: 0.32 }),
            polished: new THREE.MeshStandardMaterial({ color: "#F1F2F4", metalness: 1, roughness: 0.08 }),
            dark: new THREE.MeshStandardMaterial({ color: "#1A1A1C", metalness: 0.6, roughness: 0.4 }),
            glass: new THREE.MeshPhysicalMaterial({
                color: "#ffffff",
                metalness: 0,
                roughness: 0.02,
                transparent: true,
                opacity: 0.12,
                clearcoat: 1,
                clearcoatRoughness: 0.02,
            }),
        }),
        []
    );
}

/* ---------- Bracelet: links on a loop around the wrist ---------- */
function Bracelet({ mat }) {
    const links = useMemo(() => {
        const cz = -1.05; // loop centre (behind the case)
        const r = Math.hypot(1.28, 1.05);
        const start = Math.atan2(1.28, 1.05) + 0.06;
        const end = Math.PI * 2 - start;
        const count = 30;
        const step = (end - start) / (count - 1);
        return Array.from({ length: count }, (_, i) => {
            const phi = start + i * step;
            return {
                y: r * Math.sin(phi),
                z: cz + r * Math.cos(phi),
                rot: -phi,
                len: r * step * 0.92,
            };
        });
    }, []);

    return (
        <group>
            {links.map((l, i) => (
                <group key={i} position={[0, l.y, l.z]} rotation={[l.rot, 0, 0]}>
                    {/* centre link (polished) */}
                    <mesh material={mat.polished} castShadow>
                        <boxGeometry args={[0.2, l.len, 0.09]} />
                    </mesh>
                    {/* outer links (brushed) */}
                    <mesh material={mat.brushed} position={[-0.21, 0, 0]} castShadow>
                        <boxGeometry args={[0.2, l.len, 0.1]} />
                    </mesh>
                    <mesh material={mat.brushed} position={[0.21, 0, 0]} castShadow>
                        <boxGeometry args={[0.2, l.len, 0.1]} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

/* ---------- Watch head ---------- */
function WatchBody({ stoneId, turn, spinKey }) {
    const group = useRef();
    const hourHand = useRef();
    const minuteHand = useRef();
    const secondHand = useRef();
    const mat = useSteel();

    const textures = useTexture(DIAL_IDS.map((id) => DIALS[id]));
    useEffect(() => {
        textures.forEach((t) => {
            t.colorSpace = THREE.SRGBColorSpace;
            t.anisotropy = 8;
            t.needsUpdate = true;
        });
    }, [textures]);

    const dialMat = useMemo(
        () => new THREE.MeshPhysicalMaterial({ roughness: 0.35, metalness: 0.05, clearcoat: 0.8, clearcoatRoughness: 0.12 }),
        []
    );
    useEffect(() => {
        const t = textures[Math.max(0, DIAL_IDS.indexOf(stoneId))];
        dialMat.map = t;
        dialMat.needsUpdate = true;
    }, [stoneId, textures, dialMat]);

    // Each change of spinKey adds a full turn in that direction
    const spinTarget = useRef(0);
    const lastKey = useRef(spinKey);
    useEffect(() => {
        const diff = spinKey - lastKey.current;
        lastKey.current = spinKey;
        spinTarget.current += Math.sign(diff) * Math.PI * 2;
    }, [spinKey]);

    useFrame((state, delta) => {
        const g = group.current;
        if (!g) return;
        const target = spinTarget.current + (turn ? turn.get() : 0) + state.pointer.x * 0.12;
        g.rotation.y = THREE.MathUtils.damp(g.rotation.y, target, 3.2, delta);
        g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0.12 - state.pointer.y * 0.08, 3, delta);
        g.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.03;

        // Real time on the hands
        const now = new Date();
        const s = now.getSeconds() + now.getMilliseconds() / 1000;
        const m = now.getMinutes() + s / 60;
        const h = (now.getHours() % 12) + m / 60;
        if (secondHand.current) secondHand.current.rotation.z = -(s / 60) * Math.PI * 2;
        if (minuteHand.current) minuteHand.current.rotation.z = -(m / 60) * Math.PI * 2;
        if (hourHand.current) hourHand.current.rotation.z = -(h / 12) * Math.PI * 2;
    });

    const indices = useMemo(
        () =>
            Array.from({ length: 12 }, (_, i) => {
                const a = (i / 12) * Math.PI * 2;
                const long = i % 3 === 0;
                return { x: Math.sin(a) * 0.72, y: Math.cos(a) * 0.72, a, long };
            }),
        []
    );

    return (
        <group ref={group} scale={1.05}>
            {/* Case (faces +Z) */}
            <mesh material={mat.brushed} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[1, 1, 0.3, 96]} />
            </mesh>
            {/* Polished bezel */}
            <mesh material={mat.polished} position={[0, 0, 0.15]}>
                <torusGeometry args={[0.95, 0.06, 24, 96]} />
            </mesh>
            {/* Caseback */}
            <mesh material={mat.polished} position={[0, 0, -0.16]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.82, 0.88, 0.06, 64]} />
            </mesh>

            {/* Stone dial */}
            <mesh material={dialMat} position={[0, 0, 0.152]}>
                <circleGeometry args={[0.9, 96]} />
            </mesh>

            {/* Applied indices */}
            {indices.map((p, i) => (
                <mesh key={i} material={mat.polished} position={[p.x, p.y, 0.17]} rotation={[0, 0, -p.a]}>
                    <boxGeometry args={[p.long ? 0.045 : 0.03, p.long ? 0.17 : 0.11, 0.02]} />
                </mesh>
            ))}

            {/* Hands (pivot at centre) */}
            <group ref={hourHand} position={[0, 0, 0.19]}>
                <mesh material={mat.polished} position={[0, 0.22, 0]}>
                    <boxGeometry args={[0.05, 0.44, 0.015]} />
                </mesh>
            </group>
            <group ref={minuteHand} position={[0, 0, 0.205]}>
                <mesh material={mat.polished} position={[0, 0.32, 0]}>
                    <boxGeometry args={[0.035, 0.64, 0.012]} />
                </mesh>
            </group>
            <group ref={secondHand} position={[0, 0, 0.22]}>
                <mesh material={mat.dark} position={[0, 0.28, 0]}>
                    <boxGeometry args={[0.012, 0.76, 0.008]} />
                </mesh>
            </group>
            <mesh material={mat.polished} position={[0, 0, 0.23]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.035, 0.035, 0.02, 24]} />
            </mesh>

            {/* Sapphire crystal */}
            <mesh material={mat.glass} position={[0, 0, 0.2]} scale={[1, 1, 0.18]}>
                <sphereGeometry args={[0.92, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>

            {/* Crown */}
            <mesh material={mat.polished} position={[1.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.09, 0.09, 0.16, 32]} />
            </mesh>

            {/* Lugs */}
            {[
                [-0.42, 0.98],
                [0.42, 0.98],
                [-0.42, -0.98],
                [0.42, -0.98],
            ].map(([x, y], i) => (
                <mesh key={i} material={mat.brushed} position={[x, y, -0.02]}>
                    <boxGeometry args={[0.16, 0.42, 0.22]} />
                </mesh>
            ))}

            <Bracelet mat={mat} />
        </group>
    );
}

export default function ProceduralWatch({ stoneId = "overflow", turn, spinKey = 0, className = "" }) {
    return (
        <div className={`relative w-full h-full ${className}`}>
            <Canvas
                camera={{ position: [0, 0, 5.2], fov: 32 }}
                gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
                dpr={[1, 2]}
                shadows
            >
                <ambientLight intensity={0.35} />
                <directionalLight position={[3, 5, 5]} intensity={1.4} castShadow />
                <directionalLight position={[-4, -1, 3]} intensity={0.5} color="#FFE6C2" />

                <Suspense fallback={null}>
                    {/* Studio reflections built locally — no external HDR download */}
                    <Environment resolution={256}>
                        <Lightformer intensity={3} position={[0, 4, 3]} scale={[8, 1.5, 1]} color="#FFF4E0" />
                        <Lightformer intensity={2} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
                        <Lightformer intensity={2} position={[5, 0, 2]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} color="#FFE2B8" />
                        <Lightformer intensity={1} position={[0, -4, 1]} rotation-x={-Math.PI / 2} scale={[8, 3, 1]} />
                    </Environment>
                    <WatchBody stoneId={stoneId} turn={turn} spinKey={spinKey} />
                    <ContactShadows position={[0, -2.1, 0]} opacity={0.45} scale={6} blur={2.6} far={4} />
                </Suspense>
            </Canvas>
        </div>
    );
}