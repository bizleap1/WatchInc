const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ARTIFACT_DIR =
  "C:/Users/LENOVO/.gemini/antigravity/brain/2460ab27-41d5-42de-859d-69cb1e7ee5ce";
const OUT_DIR = path.join(process.cwd(), "public", "images");

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // 1. dial-macro-overflow.webp (from generated 100mm macro photo)
  await sharp(path.join(ARTIFACT_DIR, "dial_macro_overflow_1794995037847.jpg"))
    .resize(1200, 1200, { fit: "cover" })
    .webp({ quality: 90 })
    .toFile(path.join(OUT_DIR, "dial-macro-overflow.webp"));
  console.log("✓ dial-macro-overflow.webp");

  // 2. dial-macro-[other 5].webp (true macro crop from approved 2000px master front photographs)
  const frontMasters = [
    { id: "cherish", file: "cherish_rosequartz_front_1794988429599.jpg" },
    { id: "hush", file: "hush_amethyst_front_1794988433772.jpg" },
    { id: "ascent", file: "ascent_tigereye_front_1794988428266.jpg" },
    { id: "wildfire", file: "wildfire_sunstone_front_1794988427549.jpg" },
    { id: "cadence", file: "cadence_sodalite_front_1794988433590.jpg" },
  ];

  for (const m of frontMasters) {
    const srcPath = path.join(ARTIFACT_DIR, m.file);
    const meta = await sharp(srcPath).metadata();
    // Crop tightly inside the circular dial showing stone texture + steel hand tip + steel batons
    const cropSize = Math.round(meta.width * 0.44);
    const left = Math.round(meta.width * 0.34);
    const top = Math.round(meta.height * 0.35);

    await sharp(srcPath)
      .extract({ left, top, width: cropSize, height: cropSize })
      .resize(1000, 1000, { kernel: sharp.kernel.lanczos3 })
      .sharpen({ sigma: 0.7 })
      .webp({ quality: 90 })
      .toFile(path.join(OUT_DIR, `dial-macro-${m.id}.webp`));
    console.log(`✓ dial-macro-${m.id}.webp`);
  }

  // 3. wrist-[overflow, hush, cadence].webp (moody editorial crops from existing campaign photos, no face visible)
  const wristSources = [
    { id: "overflow", file: "public/images/hero/model-ai-citrine.jpg", w: 960, h: 1280, topPct: 0.28 },
    { id: "hush", file: "public/images/hero/model-ai-amethyst.jpg", w: 1200, h: 900, topPct: 0.34 },
    { id: "cadence", file: "public/images/hero/model-ai-lapis.jpg", w: 1200, h: 900, topPct: 0.34 },
  ];

  for (const ws of wristSources) {
    const fullSrc = path.join(process.cwd(), ws.file);
    const meta = await sharp(fullSrc).metadata();
    const cropTop = Math.round(meta.height * ws.topPct);
    const availH = meta.height - cropTop;
    await sharp(fullSrc)
      .extract({ left: 0, top: cropTop, width: meta.width, height: availH })
      .resize(ws.w, ws.h, { fit: "cover", position: "center" })
      .modulate({ brightness: 0.88, saturation: 0.92 })
      .webp({ quality: 90 })
      .toFile(path.join(OUT_DIR, `wrist-${ws.id}.webp`));
    console.log(`✓ wrist-${ws.id}.webp`);
  }

  // 4. selenite-plate.webp (citrine master watch resting on fibrous white selenite slab on pale moonlight #ECEAE6)
  {
    const W = 1200, H = 1500;
    const slabSvg = Buffer.from(`
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="moonBg" cx="48%" cy="45%" r="65%">
            <stop offset="0%" stop-color="#F3F1ED"/>
            <stop offset="100%" stop-color="#E4E1DB"/>
          </radialGradient>
          <linearGradient id="seleniteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="35%" stop-color="#F7F6F3"/>
            <stop offset="70%" stop-color="#EAE8E4"/>
            <stop offset="100%" stop-color="#DDDAD4"/>
          </linearGradient>
          <filter id="slabShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="18" dy="32" stdDeviation="28" flood-color="#1A1917" flood-opacity="0.16"/>
          </filter>
          <filter id="watchShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="12" dy="20" stdDeviation="16" flood-color="#0A0A0B" flood-opacity="0.22"/>
          </filter>
        </defs>
        <rect width="${W}" height="${H}" fill="url(#moonBg)"/>
        <!-- Natural rough-edged white selenite slab -->
        <g filter="url(#slabShadow)">
          <polygon points="180,310 1015,295 1030,1190 168,1205" fill="url(#seleniteGrad)" stroke="#FFFFFF" stroke-width="2"/>
          <!-- Silky fibrous selenite crystal striations -->
          <g stroke="#FFFFFF" stroke-opacity="0.65" stroke-width="1.5">
            <line x1="190" y1="360" x2="1010" y2="352"/>
            <line x1="186" y1="415" x2="1014" y2="408"/>
            <line x1="184" y1="490" x2="1018" y2="482"/>
            <line x1="182" y1="575" x2="1020" y2="566"/>
            <line x1="180" y1="680" x2="1022" y2="672"/>
            <line x1="178" y1="790" x2="1024" y2="782"/>
            <line x1="176" y1="905" x2="1025" y2="896"/>
            <line x1="174" y1="1020" x2="1027" y2="1012"/>
            <line x1="172" y1="1120" x2="1028" y2="1114"/>
          </g>
          <g stroke="#CFCBC4" stroke-opacity="0.35" stroke-width="1">
            <line x1="188" y1="388" x2="1012" y2="380"/>
            <line x1="184" y1="535" x2="1018" y2="528"/>
            <line x1="180" y1="735" x2="1022" y2="728"/>
            <line x1="176" y1="960" x2="1026" y2="952"/>
          </g>
        </g>
      </svg>
    `);

    const watchCutout = await sharp(path.join(process.cwd(), "public/watches/overflow/front.png"))
      .resize({ height: 1080 })
      .toBuffer();
    const wMeta = await sharp(watchCutout).metadata();

    await sharp(slabSvg)
      .composite([
        {
          input: watchCutout,
          left: Math.round((W - wMeta.width) / 2),
          top: Math.round((H - wMeta.height) / 2),
        },
      ])
      .webp({ quality: 90 })
      .toFile(path.join(OUT_DIR, "selenite-plate.webp"));
    console.log("✓ selenite-plate.webp");
  }

  // 5. ritual-card.webp (blank warm cream cotton-paper card with blind-embossed border on dark basalt stone)
  {
    const W = 1000, H = 1280;
    const cardSvg = Buffer.from(`
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="stoneBg" cx="45%" cy="35%" r="75%">
            <stop offset="0%" stop-color="#19191C"/>
            <stop offset="100%" stop-color="#0A0A0B"/>
          </radialGradient>
          <linearGradient id="cottonPaper" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#F6F3EC"/>
            <stop offset="55%" stop-color="#EFEAE0"/>
            <stop offset="100%" stop-color="#E5DFD3"/>
          </linearGradient>
          <filter id="paperGrain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.045"/>
            </feComponentTransfer>
          </filter>
          <filter id="cardDrop" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="28" stdDeviation="30" flood-color="#000000" flood-opacity="0.72"/>
          </filter>
        </defs>
        <rect width="${W}" height="${H}" fill="url(#stoneBg)"/>
        <rect width="${W}" height="${H}" filter="url(#paperGrain)"/>
        <g filter="url(#cardDrop)">
          <rect x="90" y="90" width="820" height="1100" fill="url(#cottonPaper)"/>
          <!-- Blind-embossed letterpress recessed border -->
          <rect x="132" y="132" width="736" height="1016" fill="none" stroke="rgba(0,0,0,0.14)" stroke-width="1.5"/>
          <rect x="133.5" y="133.5" width="733" height="1013" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="1"/>
        </g>
      </svg>
    `);

    await sharp(cardSvg)
      .webp({ quality: 90 })
      .toFile(path.join(OUT_DIR, "ritual-card.webp"));
    console.log("✓ ritual-card.webp");
  }

  // 6. box.webp (overhead flat-lay on pure #0A0A0B: open matte black box + real citrine watch + blank card + selenite plate)
  {
    const W = 1600, H = 960;
    const boxSvg = Buffer.from(`
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="stageGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stop-color="#141417"/>
            <stop offset="100%" stop-color="#0A0A0B"/>
          </radialGradient>
          <linearGradient id="boxOuter" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1D1D21"/>
            <stop offset="100%" stop-color="#0F0F11"/>
          </linearGradient>
          <linearGradient id="suedeWell" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#121215"/>
            <stop offset="100%" stop-color="#0B0B0D"/>
          </linearGradient>
          <linearGradient id="creamCard" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#F5F2EA"/>
            <stop offset="100%" stop-color="#E5DFD2"/>
          </linearGradient>
          <linearGradient id="seleniteMini" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="50%" stop-color="#EFECE7"/>
            <stop offset="100%" stop-color="#DDD9D2"/>
          </linearGradient>
          <filter id="boxShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="26" stdDeviation="28" flood-color="#000000" flood-opacity="0.85"/>
          </filter>
        </defs>
        <rect width="${W}" height="${H}" fill="url(#stageGlow)"/>
        <!-- Sharp-edged open presentation box (x: 310..1290, y: 150..810) -->
        <g filter="url(#boxShadow)">
          <rect x="310" y="150" width="980" height="660" fill="url(#boxOuter)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
          <rect x="344" y="184" width="912" height="592" fill="url(#suedeWell)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
          <!-- Left Watch Cushion Well (center x ~ 555, y ~ 480) -->
          <rect x="380" y="218" width="350" height="524" fill="#0E0E10" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
          <!-- Top-Right Blank Ritual Card Slot (x: 770..1218, y: 218..468) -->
          <rect x="770" y="218" width="448" height="250" fill="#0E0E10" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
          <rect x="814" y="246" width="360" height="194" fill="url(#creamCard)"/>
          <rect x="832" y="264" width="324" height="158" fill="none" stroke="rgba(0,0,0,0.14)" stroke-width="1"/>
          <!-- Bottom-Right Selenite Resting Plate Slot (x: 770..1218, y: 500..742) -->
          <rect x="770" y="500" width="448" height="242" fill="#0E0E10" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
          <rect x="824" y="534" width="340" height="174" fill="url(#seleniteMini)"/>
          <g stroke="#FFFFFF" stroke-opacity="0.7" stroke-width="1.2">
            <line x1="830" y1="566" x2="1158" y2="562"/>
            <line x1="830" y1="602" x2="1158" y2="598"/>
            <line x1="830" y1="640" x2="1158" y2="636"/>
            <line x1="830" y1="678" x2="1158" y2="674"/>
          </g>
        </g>
      </svg>
    `);

    const watchInBox = await sharp(path.join(process.cwd(), "public/watches/overflow/front.png"))
      .resize({ height: 470 })
      .toBuffer();
    const wbMeta = await sharp(watchInBox).metadata();

    await sharp(boxSvg)
      .composite([
        {
          input: watchInBox,
          left: Math.round(555 - wbMeta.width / 2),
          top: Math.round(480 - wbMeta.height / 2),
        },
      ])
      .webp({ quality: 90 })
      .toFile(path.join(OUT_DIR, "box.webp"));
    console.log("✓ box.webp");
  }

  console.log("All 12 section images prepared in /public/images/!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
