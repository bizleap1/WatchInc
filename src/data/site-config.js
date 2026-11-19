export const SITE_CONFIG = {
    brandName: "WATCH INC",
    practitionerName: "",
    ritualDate: "{DATE}",
    sampleDialNo: "{DIAL_NO}",
    watchPrice: "{PRICE}",
    selenitePlatePrice: "{PRICE}",
    editionPerStone: 300,
    editionLabel: "300 PIECES PER STONE",
    disclaimer: "Stone meanings are traditional and cultural. Watch Inc makes no claim of any outcome. Each watch is energized as a ritual, recorded on its dated card.",
    ritualFooterLine: "We sell the ritual that was performed. Nothing more is promised.",
    seleniteLines: {
        headingLine1: "SELENITE",
        headingLine2: "THE RESTING PLATE",
        primaryCopy: "Selenite is traditionally used to cleanse other stones. Rest your watch on it overnight.",
        secondaryCopy: "Nothing about the watch changes. The plate is a ritual, not a mechanism.",
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
            panelColor: "#B58E4A",
            traditionLine: "Worn for abundance, in the tradition of citrine.",
            moodySrc: "/watches/overflow/diagonal.webp",
            frontSrc: "/watches/overflow/front.webp",
            macroSrc: "/images/dial-macro-overflow.webp",
        },
        {
            index: "02",
            id: "cherish",
            stoneKey: "rosequartz",
            name: "CHERISH",
            stone: "ROSE QUARTZ",
            pieceType: "THE SELF-LOVE PIECE",
            panelColor: "#B88B90",
            traditionLine: "Worn for the love you give yourself, in the tradition of rose quartz.",
            moodySrc: "/watches/cherish/diagonal.webp",
            frontSrc: "/watches/cherish/front.webp",
            macroSrc: "/images/dial-macro-cherish.webp",
        },
        {
            index: "03",
            id: "hush",
            stoneKey: "amethyst",
            name: "HUSH",
            stone: "AMETHYST",
            pieceType: "THE PEACE PIECE",
            panelColor: "#8C7BA8",
            traditionLine: "Worn for a quieter mind, in the tradition of amethyst.",
            moodySrc: "/watches/hush/diagonal.webp",
            frontSrc: "/watches/hush/front.webp",
            macroSrc: "/images/dial-macro-hush.webp",
        },
        {
            index: "04",
            id: "ascent",
            stoneKey: "tigereye",
            name: "ASCENT",
            stone: "TIGER'S EYE",
            pieceType: "THE CAREER PIECE",
            panelColor: "#A3794B",
            traditionLine: "Worn for the next step up, in the tradition of tiger's eye.",
            moodySrc: "/watches/ascent/diagonal.webp",
            frontSrc: "/watches/ascent/front.webp",
            macroSrc: "/images/dial-macro-ascent.webp",
        },
        {
            index: "05",
            id: "wildfire",
            stoneKey: "sunstone",
            name: "WILDFIRE",
            stone: "SUNSTONE",
            pieceType: "THE FAME PIECE",
            panelColor: "#BF7352",
            traditionLine: "Worn to be seen, in the tradition of sunstone.",
            moodySrc: "/watches/wildfire/diagonal.webp",
            frontSrc: "/watches/wildfire/front.webp",
            macroSrc: "/images/dial-macro-wildfire.webp",
        },
        {
            index: "06",
            id: "cadence",
            stoneKey: "sodalite",
            name: "CADENCE",
            stone: "SODALITE",
            pieceType: "THE VOICE PIECE",
            panelColor: "#5F7AA8",
            traditionLine: "Worn for words that land, in the tradition of sodalite.",
            moodySrc: "/watches/cadence/diagonal.webp",
            frontSrc: "/watches/cadence/front.webp",
            macroSrc: "/images/dial-macro-cadence.webp",
        },
    ],
};
export function getPractitionerName() {
    const value = SITE_CONFIG.practitionerName?.trim();
    if (!value || (value.startsWith("{") && value.endsWith("}"))) {
        return null;
    }
    return value;
}
export function getEnergizedClause() {
    const practitioner = getPractitionerName();
    return practitioner
        ? `energized as a ritual by ${practitioner} before dispatch`
        : "energized as a ritual before dispatch";
}
