"use client";

import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import { STONE_DIAL_CONFIGS, WATCH_MATERIALS } from "./StoneMaterials";

export default function WatchModel({
  stoneId = "overflow",
  modelUrl = "/models/watch-38mm.glb",
  interactive = true,
  scale = 1.0,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  ...props
}) {
  const groupRef = useRef();
  const { scene } = useGLTF(modelUrl);

  const stoneConfig = STONE_DIAL_CONFIGS[stoneId] || STONE_DIAL_CONFIGS.overflow;

  // Load the active stone dial texture
  const dialTexture = useTexture(stoneConfig.texturePath);
  useEffect(() => {
    if (dialTexture) {
      dialTexture.colorSpace = THREE.SRGBColorSpace;
      dialTexture.wrapS = THREE.ClampToEdgeWrapping;
      dialTexture.wrapT = THREE.ClampToEdgeWrapping;
      dialTexture.needsUpdate = true;
    }
  }, [dialTexture]);

  // Clone scene & assign materials to recognized geometry groups
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((child) => {
      if (!child.isMesh) return;

      child.castShadow = true;
      child.receiveShadow = true;

      const name = (child.name || "").toLowerCase();

      // 1. Dial Face: apply interchangeable stone texture
      if (name.includes("dial")) {
        child.material = new THREE.MeshPhysicalMaterial({
          map: dialTexture,
          roughness: stoneConfig.roughness,
          metalness: stoneConfig.metalness,
          clearcoat: stoneConfig.clearcoat,
          clearcoatRoughness: stoneConfig.clearcoatRoughness,
          envMapIntensity: 1.2,
        });
      }
      // 2. Sapphire Crystal Dome
      else if (name.includes("glass") || name.includes("crystal")) {
        child.material = WATCH_MATERIALS.sapphireGlass;
      }
      // 3. Polished details: Hands, Crown, Applied Indices, Bezel Rim
      else if (
        name.includes("hand") ||
        name.includes("index") ||
        name.includes("indices") ||
        name.includes("crown")
      ) {
        child.material = WATCH_MATERIALS.steelPolished;
      }
      // 4. Brushed Steel: 38mm Case, Lugs, Link Bracelet & Caseback
      else {
        child.material = WATCH_MATERIALS.steelBrushed;
      }
    });

    return clone;
  }, [scene, dialTexture, stoneConfig]);

  // Subtle architectural parallax tracking mouse pointer without aggressive spinning
  useFrame((state, delta) => {
    if (!groupRef.current || !interactive) return;

    const targetX = rotation[0] + state.pointer.y * 0.12;
    const targetY = rotation[1] + state.pointer.x * 0.18;

    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      targetX,
      4,
      delta
    );
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetY,
      4,
      delta
    );
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} {...props}>
      <primitive object={clonedScene} />
    </group>
  );
}

