import * as THREE from "three";

/**
 * Six interchangeable natural stone dial material definitions.
 * Mapped to the six authentic natural crystal matrices of Watch Inc.
 */
export const STONE_DIAL_CONFIGS = {
  overflow: {
    id: "overflow",
    name: "Overflow",
    stone: "Citrine",
    texturePath: "/images/dial-macro-overflow.webp",
    roughness: 0.42,
    metalness: 0.08,
    clearcoat: 0.65,
    clearcoatRoughness: 0.18,
    color: "#E8A33D",
  },
  cherish: {
    id: "cherish",
    name: "Cherish",
    stone: "Rose Quartz",
    texturePath: "/images/dial-macro-cherish.webp",
    roughness: 0.48,
    metalness: 0.05,
    clearcoat: 0.55,
    clearcoatRoughness: 0.22,
    color: "#E9B4B8",
  },
  hush: {
    id: "hush",
    name: "Hush",
    stone: "Amethyst",
    texturePath: "/images/dial-macro-hush.webp",
    roughness: 0.38,
    metalness: 0.1,
    clearcoat: 0.7,
    clearcoatRoughness: 0.15,
    color: "#A98BD9",
  },
  ascent: {
    id: "ascent",
    name: "Ascent",
    stone: "Tiger's Eye",
    texturePath: "/images/dial-macro-ascent.webp",
    roughness: 0.35,
    metalness: 0.15,
    clearcoat: 0.8,
    clearcoatRoughness: 0.12,
    color: "#C68A3E",
  },
  wildfire: {
    id: "wildfire",
    name: "Wildfire",
    stone: "Sunstone",
    texturePath: "/images/dial-macro-wildfire.webp",
    roughness: 0.45,
    metalness: 0.12,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
    color: "#F0773A",
  },
  cadence: {
    id: "cadence",
    name: "Cadence",
    stone: "Sodalite",
    texturePath: "/images/dial-macro-cadence.webp",
    roughness: 0.4,
    metalness: 0.06,
    clearcoat: 0.62,
    clearcoatRoughness: 0.18,
    color: "#7E9CC4",
  },
};

/**
 * High-precision architectural materials for WatchInc 38mm timepiece
 */
export const WATCH_MATERIALS = {
  // Brushed 316L Stainless Steel for Case and Bracelet
  steelBrushed: new THREE.MeshStandardMaterial({
    color: new THREE.Color("#D1D5DB"),
    metalness: 0.92,
    roughness: 0.26,
    envMapIntensity: 1.4,
  }),

  // Mirror-polished Rhodium Steel for Bezel facets, Hands, Crown & Indices
  steelPolished: new THREE.MeshStandardMaterial({
    color: new THREE.Color("#F3F4F6"),
    metalness: 0.98,
    roughness: 0.08,
    envMapIntensity: 1.8,
  }),

  // Domed AR-coated Sapphire Crystal
  sapphireGlass: new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#FFFFFF"),
    transmission: 0.96,
    opacity: 1,
    transparent: true,
    roughness: 0.03,
    ior: 1.77,
    thickness: 0.4,
    specularIntensity: 1.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    envMapIntensity: 1.2,
  }),
};
