"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows, OrbitControls } from "@react-three/drei";
import WatchModel from "./WatchModel";

export default function WatchCanvas({
  stoneId = "overflow",
  modelUrl = "/models/watch-38mm.glb",
  variant = "moody",
  interactive = true,
  enableOrbit = false,
  className = "",
}) {
  // Angled view matches the moody studio shot; front view matches the straight orthographic look
  const initialRotation =
    variant === "moody" ? [0.18, -0.42, 0.08] : [0, 0, 0];
  const initialPosition = variant === "moody" ? [0.1, -0.05, 0] : [0, 0, 0];
  const initialScale = variant === "moody" ? 1.05 : 1.0;

  return (
    <div className={`relative w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
        className="w-full h-full"
      >
        <ambientLight intensity={0.4} />

        {/* Cinematic Three-Point Studio Lighting */}
        <directionalLight position={[4, 6, 5]} intensity={1.6} castShadow shadow-mapSize={1024} />
        <directionalLight position={[-4, -2, 2]} intensity={0.5} />
        <directionalLight position={[0, 5, -5]} intensity={1.2} />

        <Suspense fallback={null}>
          <Environment preset="studio" />
          <WatchModel
            stoneId={stoneId}
            modelUrl={modelUrl}
            position={initialPosition}
            rotation={initialRotation}
            scale={initialScale}
            interactive={interactive}
          />
          <ContactShadows
            position={[0, -1.6, 0]}
            opacity={0.35}
            scale={6}
            blur={2.4}
            far={3.5}
          />
        </Suspense>

        {enableOrbit && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableDamping
            dampingFactor={0.05}
            minPolarAngle={Math.PI / 2 - 0.25}
            maxPolarAngle={Math.PI / 2 + 0.25}
            minAzimuthAngle={-Math.PI / 4}
            maxAzimuthAngle={Math.PI / 4}
          />
        )}
      </Canvas>
    </div>
  );
}
