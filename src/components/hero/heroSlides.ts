import type { StoneId, StoneType } from "@/data/collection";

export interface HeroSlide {
  id: StoneId;
  stoneKey: StoneType;
  titleLine1: string;
  titleLine2: string;
  size: string;
  panelColor: string;
  stoneLabel: string;
  filmHeadline: string;
  bodyCopy: string;
  dialRangeLabel: string;
  sampleDialNo: string;
  discoverLabel: string;
  pricePlaceholder: string;
  moodySrc: string;
  frontSrc: string;
  filmSrc: string;
  detailSpecs: {
    caseSize: string;
    dialMaterial: string;
    numbering: string;
    edition: string;
  };
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "overflow",
    stoneKey: "citrine",
    titleLine1: "OVERFLOW",
    titleLine2: "CITRINE DIAL",
    size: "40MM",
    panelColor: "#E3A93A",
    stoneLabel: "CITRINE",
    filmHeadline: "Worn for abundance",
    bodyCopy:
      "Worn for abundance, in the tradition of citrine. Energized by {PRACTITIONER_NAME} before it ships.",
    dialRangeLabel: "DIAL NO. 0001 — 0300 · LIMITED EDITION",
    sampleDialNo: "0147",
    discoverLabel: "DISCOVER OVERFLOW",
    pricePlaceholder: "₹ {PRICE}",
    moodySrc: "/watches/overflow/moody.webp",
    frontSrc: "/watches/overflow/front.png",
    filmSrc: "/films/overflow.mp4",
    detailSpecs: {
      caseSize: "40MM brushed stainless steel",
      dialMaterial: "Natural cut citrine stone — no two dials alike",
      numbering: "Individual sequential dial no. 0001 — 0300",
      edition: "Limited edition of 300 numbered pieces",
    },
  },
  {
    id: "cherish",
    stoneKey: "rosequartz",
    titleLine1: "CHERISH",
    titleLine2: "ROSE QUARTZ DIAL",
    size: "40MM",
    panelColor: "#E7A9B0",
    stoneLabel: "ROSE QUARTZ",
    filmHeadline: "Worn for the love you give yourself",
    bodyCopy:
      "Worn for the love you give yourself, in the tradition of rose quartz. Energized by {PRACTITIONER_NAME} before it ships.",
    dialRangeLabel: "DIAL NO. 0001 — 0300 · LIMITED EDITION",
    sampleDialNo: "0082",
    discoverLabel: "DISCOVER CHERISH",
    pricePlaceholder: "₹ {PRICE}",
    moodySrc: "/watches/cherish/moody.webp",
    frontSrc: "/watches/cherish/front.png",
    filmSrc: "/films/cherish.mp4",
    detailSpecs: {
      caseSize: "40MM brushed stainless steel",
      dialMaterial: "Natural cut rose quartz stone — no two dials alike",
      numbering: "Individual sequential dial no. 0001 — 0300",
      edition: "Limited edition of 300 numbered pieces",
    },
  },
  {
    id: "hush",
    stoneKey: "amethyst",
    titleLine1: "HUSH",
    titleLine2: "AMETHYST DIAL",
    size: "40MM",
    panelColor: "#9B7FD1",
    stoneLabel: "AMETHYST",
    filmHeadline: "Worn for a quieter mind",
    bodyCopy:
      "Worn for a quieter mind, in the tradition of amethyst. Energized by {PRACTITIONER_NAME} before it ships.",
    dialRangeLabel: "DIAL NO. 0001 — 0300 · LIMITED EDITION",
    sampleDialNo: "0219",
    discoverLabel: "DISCOVER HUSH",
    pricePlaceholder: "₹ {PRICE}",
    moodySrc: "/watches/hush/moody.webp",
    frontSrc: "/watches/hush/front.png",
    filmSrc: "/films/hush.mp4",
    detailSpecs: {
      caseSize: "40MM brushed stainless steel",
      dialMaterial: "Natural cut amethyst stone — no two dials alike",
      numbering: "Individual sequential dial no. 0001 — 0300",
      edition: "Limited edition of 300 numbered pieces",
    },
  },
  {
    id: "ascent",
    stoneKey: "tigereye",
    titleLine1: "ASCENT",
    titleLine2: "TIGER'S EYE DIAL",
    size: "40MM",
    panelColor: "#B9813B",
    stoneLabel: "TIGER'S EYE",
    filmHeadline: "Worn for the next step up",
    bodyCopy:
      "Worn for the next step up, in the tradition of tiger's eye. Energized by {PRACTITIONER_NAME} before it ships.",
    dialRangeLabel: "DIAL NO. 0001 — 0300 · LIMITED EDITION",
    sampleDialNo: "0014",
    discoverLabel: "DISCOVER ASCENT",
    pricePlaceholder: "₹ {PRICE}",
    moodySrc: "/watches/ascent/moody.webp",
    frontSrc: "/watches/ascent/front.png",
    filmSrc: "/films/ascent.mp4",
    detailSpecs: {
      caseSize: "40MM brushed stainless steel",
      dialMaterial: "Natural cut tiger's eye stone — no two dials alike",
      numbering: "Individual sequential dial no. 0001 — 0300",
      edition: "Limited edition of 300 numbered pieces",
    },
  },
  {
    id: "wildfire",
    stoneKey: "sunstone",
    titleLine1: "WILDFIRE",
    titleLine2: "SUNSTONE DIAL",
    size: "40MM",
    panelColor: "#E8743B",
    stoneLabel: "SUNSTONE",
    filmHeadline: "Worn to be seen",
    bodyCopy:
      "Worn to be seen, in the tradition of sunstone. Energized by {PRACTITIONER_NAME} before it ships.",
    dialRangeLabel: "DIAL NO. 0001 — 0300 · LIMITED EDITION",
    sampleDialNo: "0173",
    discoverLabel: "DISCOVER WILDFIRE",
    pricePlaceholder: "₹ {PRICE}",
    moodySrc: "/watches/wildfire/moody.webp",
    frontSrc: "/watches/wildfire/front.png",
    filmSrc: "/films/wildfire.mp4",
    detailSpecs: {
      caseSize: "40MM brushed stainless steel",
      dialMaterial: "Natural cut sunstone — no two dials alike",
      numbering: "Individual sequential dial no. 0001 — 0300",
      edition: "Limited edition of 300 numbered pieces",
    },
  },
  {
    id: "cadence",
    stoneKey: "sodalite",
    titleLine1: "CADENCE",
    titleLine2: "SODALITE DIAL",
    size: "40MM",
    panelColor: "#3F6FD1",
    stoneLabel: "SODALITE",
    filmHeadline: "Worn for words that land",
    bodyCopy:
      "Worn for words that land, in the tradition of sodalite. Energized by {PRACTITIONER_NAME} before it ships.",
    dialRangeLabel: "DIAL NO. 0001 — 0300 · LIMITED EDITION",
    sampleDialNo: "0264",
    discoverLabel: "DISCOVER CADENCE",
    pricePlaceholder: "₹ {PRICE}",
    moodySrc: "/watches/cadence/moody.webp",
    frontSrc: "/watches/cadence/front.png",
    filmSrc: "/films/cadence.mp4",
    detailSpecs: {
      caseSize: "40MM brushed stainless steel",
      dialMaterial: "Natural cut sodalite stone — no two dials alike",
      numbering: "Individual sequential dial no. 0001 — 0300",
      edition: "Limited edition of 300 numbered pieces",
    },
  },
];
