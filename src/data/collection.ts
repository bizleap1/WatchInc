/**
 * Watch Inc Collection
 * Six stones. Six intentions. No two alike.
 */

export type StoneId =
  | "overflow"
  | "cherish"
  | "hush"
  | "ascent"
  | "wildfire"
  | "cadence";

export type StoneType =
  | "citrine"
  | "rosequartz"
  | "amethyst"
  | "tigereye"
  | "sunstone"
  | "sodalite";

export interface StoneColorWorld {
  bg: string;
  accent: string;
  glow: string;
  textMuted: string;
  dialGradient: [string, string, string];
}

export interface WatchPiece {
  id: StoneId;
  name: string;
  stone: string;
  stoneKey: StoneType;
  intention: string;
  line: string;
  pieceType: string;
  colors: StoneColorWorld;
  dialNumberRange: string;
  price: string;
  images: {
    hero: string;
    moody: string;
    front: string;
    dialMacro: string;
    model: string;
  };
  mineralDetails: {
    mineralogy: string;
    provenance: string;
    growthStructure: string;
    veiningDescription: string;
  };
  sampleProof: {
    dialNo: string;
    practitioner: string;
    ritualDate: string;
    dedicationCard: string;
  };
}

export const collection: WatchPiece[] = [
  {
    id: "overflow",
    name: "Overflow",
    stone: "Citrine",
    stoneKey: "citrine",
    intention: "Worn for abundance.",
    line: "Worn for abundance, in the tradition of citrine.",
    pieceType: "The wealth piece.",
    colors: {
      bg: "#0A0A0B",
      accent: "#E3A93A",
      glow: "rgba(227, 169, 58, 0.35)",
      textMuted: "rgba(255, 255, 255, 0.55)",
      dialGradient: ["#F9D37A", "#E3A93A", "#6B430D"],
    },
    dialNumberRange: "No. 0001 — 0300",
    price: "{PRICE}",
    images: {
      hero: "/watches/overflow/front.png",
      moody: "/watches/overflow/moody.webp",
      front: "/watches/overflow/front.png",
      dialMacro: "/images/dial-macro-overflow.webp",
      model: "/images/wrist-overflow.webp",
    },
    mineralDetails: {
      mineralogy: "Natural Citrine Quartz",
      provenance: "Natural stone slab",
      growthStructure: "Translucent golden-amber crystalline matrix",
      veiningDescription: "Honey tones with natural cloudy inclusions and depth",
    },
    sampleProof: {
      dialNo: "{DIAL_NO}",
      practitioner: "{PRACTITIONER_NAME}",
      ritualDate: "{DATE}",
      dedicationCard: "Ritual Record · {DIAL_NO}",
    },
  },
  {
    id: "cherish",
    name: "Cherish",
    stone: "Rose quartz",
    stoneKey: "rosequartz",
    intention: "Worn for the love you give yourself.",
    line: "Worn for the love you give yourself, in the tradition of rose quartz.",
    pieceType: "The self-love piece.",
    colors: {
      bg: "#0A0A0B",
      accent: "#E7A9B0",
      glow: "rgba(231, 169, 176, 0.35)",
      textMuted: "rgba(255, 255, 255, 0.55)",
      dialGradient: ["#FDE8EC", "#E7A9B0", "#8A4D57"],
    },
    dialNumberRange: "No. 0001 — 0300",
    price: "{PRICE}",
    images: {
      hero: "/watches/cherish/front.png",
      moody: "/watches/cherish/moody.webp",
      front: "/watches/cherish/front.png",
      dialMacro: "/images/dial-macro-cherish.webp",
      model: "/images/wrist-overflow.webp",
    },
    mineralDetails: {
      mineralogy: "Natural Rose Quartz",
      provenance: "Natural stone slab",
      growthStructure: "Translucent milky pink quartz matrix",
      veiningDescription: "Soft milky pink with faint white cloudy streaks",
    },
    sampleProof: {
      dialNo: "{DIAL_NO}",
      practitioner: "{PRACTITIONER_NAME}",
      ritualDate: "{DATE}",
      dedicationCard: "Ritual Record · {DIAL_NO}",
    },
  },
  {
    id: "hush",
    name: "Hush",
    stone: "Amethyst",
    stoneKey: "amethyst",
    intention: "Worn for a quieter mind.",
    line: "Worn for a quieter mind, in the tradition of amethyst.",
    pieceType: "The peace piece.",
    colors: {
      bg: "#0A0A0B",
      accent: "#9B7FD1",
      glow: "rgba(155, 127, 209, 0.35)",
      textMuted: "rgba(255, 255, 255, 0.55)",
      dialGradient: ["#D8C4F4", "#9B7FD1", "#3D245E"],
    },
    dialNumberRange: "No. 0001 — 0300",
    price: "{PRICE}",
    images: {
      hero: "/watches/hush/front.png",
      moody: "/watches/hush/moody.webp",
      front: "/watches/hush/front.png",
      dialMacro: "/images/dial-macro-hush.webp",
      model: "/images/wrist-hush.webp",
    },
    mineralDetails: {
      mineralogy: "Natural Amethyst Quartz",
      provenance: "Natural stone slab",
      growthStructure: "Crystalline banded violet quartz",
      veiningDescription: "Deep violet fading to lavender with natural banding",
    },
    sampleProof: {
      dialNo: "{DIAL_NO}",
      practitioner: "{PRACTITIONER_NAME}",
      ritualDate: "{DATE}",
      dedicationCard: "Ritual Record · {DIAL_NO}",
    },
  },
  {
    id: "ascent",
    name: "Ascent",
    stone: "Tiger's eye",
    stoneKey: "tigereye",
    intention: "Worn for the next step up.",
    line: "Worn for the next step up, in the tradition of tiger's eye.",
    pieceType: "The career piece.",
    colors: {
      bg: "#0A0A0B",
      accent: "#B9813B",
      glow: "rgba(185, 129, 59, 0.35)",
      textMuted: "rgba(255, 255, 255, 0.55)",
      dialGradient: ["#E4B168", "#B9813B", "#482D08"],
    },
    dialNumberRange: "No. 0001 — 0300",
    price: "{PRICE}",
    images: {
      hero: "/watches/ascent/front.png",
      moody: "/watches/ascent/moody.webp",
      front: "/watches/ascent/front.png",
      dialMacro: "/images/dial-macro-ascent.webp",
      model: "/images/wrist-overflow.webp",
    },
    mineralDetails: {
      mineralogy: "Natural Tiger's Eye",
      provenance: "Natural stone slab",
      growthStructure: "Fibrous parallel chatoyant mineral structure",
      veiningDescription: "Golden-brown silky bands with natural shimmer",
    },
    sampleProof: {
      dialNo: "{DIAL_NO}",
      practitioner: "{PRACTITIONER_NAME}",
      ritualDate: "{DATE}",
      dedicationCard: "Ritual Record · {DIAL_NO}",
    },
  },
  {
    id: "wildfire",
    name: "Wildfire",
    stone: "Sunstone",
    stoneKey: "sunstone",
    intention: "Worn to be seen.",
    line: "Worn to be seen, in the tradition of sunstone.",
    pieceType: "The fame piece.",
    colors: {
      bg: "#0A0A0B",
      accent: "#E8743B",
      glow: "rgba(232, 116, 59, 0.35)",
      textMuted: "rgba(255, 255, 255, 0.55)",
      dialGradient: ["#FFAC7D", "#E8743B", "#692209"],
    },
    dialNumberRange: "No. 0001 — 0300",
    price: "{PRICE}",
    images: {
      hero: "/watches/wildfire/front.png",
      moody: "/watches/wildfire/moody.webp",
      front: "/watches/wildfire/front.png",
      dialMacro: "/images/dial-macro-wildfire.webp",
      model: "/images/wrist-overflow.webp",
    },
    mineralDetails: {
      mineralogy: "Natural Sunstone Feldspar",
      provenance: "Natural stone slab",
      growthStructure: "Translucent feldspar with copper inclusions",
      veiningDescription: "Warm orange-peach with sparkling copper flecks",
    },
    sampleProof: {
      dialNo: "{DIAL_NO}",
      practitioner: "{PRACTITIONER_NAME}",
      ritualDate: "{DATE}",
      dedicationCard: "Ritual Record · {DIAL_NO}",
    },
  },
  {
    id: "cadence",
    name: "Cadence",
    stone: "Sodalite",
    stoneKey: "sodalite",
    intention: "Worn for words that land.",
    line: "Worn for words that land, in the tradition of sodalite.",
    pieceType: "The voice piece.",
    colors: {
      bg: "#0A0A0B",
      accent: "#3F6FD1",
      glow: "rgba(63, 111, 209, 0.35)",
      textMuted: "rgba(255, 255, 255, 0.55)",
      dialGradient: ["#89B1F9", "#3F6FD1", "#0E244E"],
    },
    dialNumberRange: "No. 0001 — 0300",
    price: "{PRICE}",
    images: {
      hero: "/watches/cadence/front.png",
      moody: "/watches/cadence/moody.webp",
      front: "/watches/cadence/front.png",
      dialMacro: "/images/dial-macro-cadence.webp",
      model: "/images/wrist-cadence.webp",
    },
    mineralDetails: {
      mineralogy: "Natural Sodalite",
      provenance: "Natural stone slab",
      growthStructure: "Royal blue mineral matrix",
      veiningDescription: "Deep royal blue veined with natural white calcite",
    },
    sampleProof: {
      dialNo: "{DIAL_NO}",
      practitioner: "{PRACTITIONER_NAME}",
      ritualDate: "{DATE}",
      dedicationCard: "Ritual Record · {DIAL_NO}",
    },
  },
];

export const seleniteWorld: StoneColorWorld = {
  bg: "#ECEAE6",
  accent: "#8F8B84",
  glow: "rgba(255, 255, 255, 0.4)",
  textMuted: "rgba(10, 10, 11, 0.65)",
  dialGradient: ["#FFFFFF", "#ECEAE6", "#C7C2B8"],
};

export const baseColorWorld = {
  bg: "#0A0A0B",
  text: "#FFFFFF",
  accent: "#E3A93A",
  border: "rgba(255, 255, 255, 0.12)",
  muted: "rgba(255, 255, 255, 0.5)",
};

export function getPieceById(id: string): WatchPiece | undefined {
  return collection.find((item) => item.id === id || item.stoneKey === id);
}

export function getPieceByStone(stone: string): WatchPiece | undefined {
  const normalized = stone.toLowerCase().replace(/[\s'-]/g, "");
  return collection.find(
    (item) =>
      item.stone.toLowerCase().replace(/[\s'-]/g, "") === normalized ||
      item.stoneKey === normalized ||
      item.id === normalized
  );
}
