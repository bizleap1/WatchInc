import type { StoneId, StoneType } from "./collection";

export interface StoneWatchConfig {
  index: string; // "01" .. "06"
  id: StoneId;
  stoneKey: StoneType;
  name: string; // "OVERFLOW"
  stone: string; // "CITRINE"
  pieceType: string; // "THE WEALTH PIECE"
  panelColor: string; // exact hero flat panel colour
  traditionLine: string;
  moodySrc: string;
  frontSrc: string;
  macroSrc: string;
}

export const SITE_CONFIG = {
  brandName: "WATCH INC",
  practitionerName: "{PRACTITIONER_NAME}",
  ritualDate: "{DATE}",
  sampleDialNo: "{DIAL_NO}",
  watchPrice: "{PRICE}",
  selenitePlatePrice: "{PRICE}",
  editionPerStone: 300,
  editionLabel: "300 PIECES PER STONE",
  disclaimer:
    "Stone meanings are traditional and cultural. Watch Inc makes no claim of any outcome. Each watch is energized as a ritual, recorded on its dated card.",
  ritualFooterLine:
    "We sell the ritual that was performed. Nothing more is promised.",
  seleniteLines: {
    headingLine1: "SELENITE",
    headingLine2: "THE RESTING PLATE",
    primaryCopy:
      "Selenite is traditionally used to cleanse other stones. Rest your watch on it overnight.",
    secondaryCopy:
      "Nothing about the watch changes. The plate is a ritual, not a mechanism.",
    cta: "ADD WITH YOUR WATCH",
  },
  images: {
    selenitePlate: "/images/selenite-plate.webp",
    ritualCard: "/images/ritual-card.webp",
    presentationBox: "/images/box.webp",
    wrist: {
      overflow: "/images/wrist-overflow.webp",
      hush: "/images/wrist-hush.webp",
      cadence: "/images/wrist-cadence.webp",
    },
  },
  watches: [
    {
      index: "01",
      id: "overflow",
      stoneKey: "citrine",
      name: "OVERFLOW",
      stone: "CITRINE",
      pieceType: "THE WEALTH PIECE",
      panelColor: "#E3A93A",
      traditionLine: "Worn for abundance, in the tradition of citrine.",
      moodySrc: "/watches/overflow/moody.webp",
      frontSrc: "/watches/overflow/front.png",
      macroSrc: "/images/dial-macro-overflow.webp",
    },
    {
      index: "02",
      id: "cherish",
      stoneKey: "rosequartz",
      name: "CHERISH",
      stone: "ROSE QUARTZ",
      pieceType: "THE SELF-LOVE PIECE",
      panelColor: "#E7A9B0",
      traditionLine: "Worn for the love you give yourself, in the tradition of rose quartz.",
      moodySrc: "/watches/cherish/moody.webp",
      frontSrc: "/watches/cherish/front.png",
      macroSrc: "/images/dial-macro-cherish.webp",
    },
    {
      index: "03",
      id: "hush",
      stoneKey: "amethyst",
      name: "HUSH",
      stone: "AMETHYST",
      pieceType: "THE PEACE PIECE",
      panelColor: "#9B7FD1",
      traditionLine: "Worn for a quieter mind, in the tradition of amethyst.",
      moodySrc: "/watches/hush/moody.webp",
      frontSrc: "/watches/hush/front.png",
      macroSrc: "/images/dial-macro-hush.webp",
    },
    {
      index: "04",
      id: "ascent",
      stoneKey: "tigereye",
      name: "ASCENT",
      stone: "TIGER'S EYE",
      pieceType: "THE CAREER PIECE",
      panelColor: "#B9813B",
      traditionLine: "Worn for the next step up, in the tradition of tiger's eye.",
      moodySrc: "/watches/ascent/moody.webp",
      frontSrc: "/watches/ascent/front.png",
      macroSrc: "/images/dial-macro-ascent.webp",
    },
    {
      index: "05",
      id: "wildfire",
      stoneKey: "sunstone",
      name: "WILDFIRE",
      stone: "SUNSTONE",
      pieceType: "THE FAME PIECE",
      panelColor: "#E8743B",
      traditionLine: "Worn to be seen, in the tradition of sunstone.",
      moodySrc: "/watches/wildfire/moody.webp",
      frontSrc: "/watches/wildfire/front.png",
      macroSrc: "/images/dial-macro-wildfire.webp",
    },
    {
      index: "06",
      id: "cadence",
      stoneKey: "sodalite",
      name: "CADENCE",
      stone: "SODALITE",
      pieceType: "THE VOICE PIECE",
      panelColor: "#3F6FD1",
      traditionLine: "Worn for words that land, in the tradition of sodalite.",
      moodySrc: "/watches/cadence/moody.webp",
      frontSrc: "/watches/cadence/front.png",
      macroSrc: "/images/dial-macro-cadence.webp",
    },
  ] as StoneWatchConfig[],
};
