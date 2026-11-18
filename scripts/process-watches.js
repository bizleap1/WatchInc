const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ARTIFACT_DIR =
  "C:/Users/LENOVO/.gemini/antigravity/brain/2460ab27-41d5-42de-859d-69cb1e7ee5ce";

const WATCHES = [
  {
    id: "overflow",
    panelColor: "#E3A93A",
    moodyFile: "overflow_citrine_moody_1794988329394.jpg",
    frontFile: "overflow_citrine_front_1794988221465.jpg",
  },
  {
    id: "cherish",
    panelColor: "#E7A9B0",
    moodyFile: "cherish_rosequartz_moody_1794988460252.jpg",
    frontFile: "cherish_rosequartz_front_1794988429599.jpg",
  },
  {
    id: "hush",
    panelColor: "#9B7FD1",
    moodyFile: "hush_amethyst_moody_1794988458947.jpg",
    frontFile: "hush_amethyst_front_1794988433772.jpg",
  },
  {
    id: "ascent",
    panelColor: "#B9813B",
    moodyFile: "ascent_tigereye_moody_1794988458678.jpg",
    frontFile: "ascent_tigereye_front_1794988428266.jpg",
  },
  {
    id: "wildfire",
    panelColor: "#E8743B",
    moodyFile: "wildfire_sunstone_moody_1794988464976.jpg",
    frontFile: "wildfire_sunstone_front_1794988427549.jpg",
  },
  {
    id: "cadence",
    panelColor: "#3F6FD1",
    moodyFile: "cadence_sodalite_moody_1794988459409.jpg",
    frontFile: "cadence_sodalite_front_1794988433590.jpg",
  },
];

/**
 * High-precision boundary-connected white background removal with
 * anti-aliased edge feathering and white-matte color decontamination.
 * Preserves 100% of interior highlights, reflections, and stone veining.
 */
async function removeWhiteBgToPng(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .resize({ height: 2000, withoutEnlargement: false, kernel: sharp.kernel.lanczos3 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h } = info;
  const total = w * h;
  const isBg = new Uint8Array(total);
  const queue = new Int32Array(total);
  let qHead = 0;
  let qTail = 0;

  const isNearWhite = (idx) => {
    const o = idx * 4;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const maxC = r > g ? (r > b ? r : b) : g > b ? g : b;
    const minC = r < g ? (r < b ? r : b) : g < b ? g : b;
    return minC >= 232 && maxC - minC <= 18;
  };

  // Seed flood fill from all four borders
  for (let x = 0; x < w; x++) {
    const topIdx = x;
    if (!isBg[topIdx] && isNearWhite(topIdx)) {
      isBg[topIdx] = 1;
      queue[qTail++] = topIdx;
    }
    const botIdx = (h - 1) * w + x;
    if (!isBg[botIdx] && isNearWhite(botIdx)) {
      isBg[botIdx] = 1;
      queue[qTail++] = botIdx;
    }
  }
  for (let y = 0; y < h; y++) {
    const leftIdx = y * w;
    if (!isBg[leftIdx] && isNearWhite(leftIdx)) {
      isBg[leftIdx] = 1;
      queue[qTail++] = leftIdx;
    }
    const rightIdx = y * w + (w - 1);
    if (!isBg[rightIdx] && isNearWhite(rightIdx)) {
      isBg[rightIdx] = 1;
      queue[qTail++] = rightIdx;
    }
  }

  // Also seed enclosed pure-white lug-to-strap springbar gaps (strictly inside lug span & pure #F5+)
  const cx = w * 0.495;
  const cy = h * 0.50;
  const rCaseSq = Math.pow(w * 0.355, 2);
  for (let y = Math.floor(h * 0.26); y <= Math.floor(h * 0.74); y++) {
    for (let x = Math.floor(w * 0.335); x <= Math.floor(w * 0.665); x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= rCaseSq) continue;
      const idx = y * w + x;
      const o = idx * 4;
      const r = data[o], g = data[o + 1], b = data[o + 2];
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      if (!isBg[idx] && minC >= 244 && maxC - minC <= 8) {
        isBg[idx] = 1;
        queue[qTail++] = idx;
      }
    }
  }

  // 4-connected BFS flood fill across seamless white studio background
  while (qHead < qTail) {
    const idx = queue[qHead++];
    const x = idx % w;
    const y = (idx - x) / w;

    if (x > 0) {
      const n = idx - 1;
      if (!isBg[n] && isNearWhite(n)) {
        isBg[n] = 1;
        queue[qTail++] = n;
      }
    }
    if (x < w - 1) {
      const n = idx + 1;
      if (!isBg[n] && isNearWhite(n)) {
        isBg[n] = 1;
        queue[qTail++] = n;
      }
    }
    if (y > 0) {
      const n = idx - w;
      if (!isBg[n] && isNearWhite(n)) {
        isBg[n] = 1;
        queue[qTail++] = n;
      }
    }
    if (y < h - 1) {
      const n = idx + w;
      if (!isBg[n] && isNearWhite(n)) {
        isBg[n] = 1;
        queue[qTail++] = n;
      }
    }
  }

  // Compute distance (1..2px) from exterior background for crisp anti-aliased edge cleanup
  const edgeRing = new Uint8Array(total);
  for (let i = 0; i < total; i++) {
    if (isBg[i]) continue;
    const x = i % w;
    const y = (i - x) / w;
    if (
      (x > 0 && isBg[i - 1]) ||
      (x < w - 1 && isBg[i + 1]) ||
      (y > 0 && isBg[i - w]) ||
      (y < h - 1 && isBg[i + w])
    ) {
      edgeRing[i] = 1;
    }
  }
  for (let i = 0; i < total; i++) {
    if (isBg[i] || edgeRing[i] === 1) continue;
    const x = i % w;
    const y = (i - x) / w;
    if (
      (x > 0 && edgeRing[i - 1] === 1) ||
      (x < w - 1 && edgeRing[i + 1] === 1) ||
      (y > 0 && edgeRing[i - w] === 1) ||
      (y < h - 1 && edgeRing[i + w] === 1)
    ) {
      edgeRing[i] = 2;
    }
  }

  // Apply alpha + white-matte color decontamination along the 2px perimeter
  for (let i = 0; i < total; i++) {
    const o = i * 4;
    if (isBg[i]) {
      data[o + 3] = 0;
      continue;
    }

    const ring = edgeRing[i];
    if (ring === 1 || ring === 2) {
      const r = data[o];
      const g = data[o + 1];
      const b = data[o + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const sat = Math.max(r, g, b) - Math.min(r, g, b);

      // Soften semi-white anti-aliased fringe & decontaminate white bleed
      if (ring === 1 && lum > 170 && sat < 24) {
        const a = Math.max(0, Math.min(1, (242 - lum) / 85));
        data[o + 3] = Math.round(a * 255);
        if (a > 0.08) {
          // Un-premultiply against white background (#FFFFFF)
          data[o] = Math.max(0, Math.min(255, Math.round((r - (1 - a) * 255) / a)));
          data[o + 1] = Math.max(0, Math.min(255, Math.round((g - (1 - a) * 255) / a)));
          data[o + 2] = Math.max(0, Math.min(255, Math.round((b - (1 - a) * 255) / a)));
        }
      } else if (ring === 2 && lum > 215 && sat < 20) {
        const a = Math.max(0.25, Math.min(1, (248 - lum) / 48));
        data[o + 3] = Math.round(a * 255);
        if (a > 0.2) {
          data[o] = Math.max(0, Math.min(255, Math.round((r - (1 - a) * 255) / a)));
          data[o + 1] = Math.max(0, Math.min(255, Math.round((g - (1 - a) * 255) / a)));
          data[o + 2] = Math.max(0, Math.min(255, Math.round((b - (1 - a) * 255) / a)));
        }
      }
    }
  }

  await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outputPath);

  return { width: w, height: h };
}

/**
 * Process moody angled shot: ~2000px tall RGBA WebP (quality 90) with exterior
 * pure-black studio background removed to true alpha transparency + silky top/bottom
 * strap fade so it blends 100% invisibly into #0A0A0B with zero rectangular box edge.
 */
async function processMoodyToWebp(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .resize({ height: 2000, withoutEnlargement: false, kernel: sharp.kernel.lanczos3 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h } = info;
  const total = w * h;
  const isBg = new Uint8Array(total);
  const queue = new Int32Array(total);
  let qHead = 0;
  let qTail = 0;

  // Exterior studio black detector (strict low luminance so pebbled black leather stays solid)
  const isPureBlackBg = (idx) => {
    const o = idx * 4;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    return r <= 12 && g <= 12 && b <= 12;
  };

  // Seed flood fill from all four borders
  for (let x = 0; x < w; x++) {
    const topIdx = x;
    if (!isBg[topIdx] && isPureBlackBg(topIdx)) {
      isBg[topIdx] = 1;
      queue[qTail++] = topIdx;
    }
    const botIdx = (h - 1) * w + x;
    if (!isBg[botIdx] && isPureBlackBg(botIdx)) {
      isBg[botIdx] = 1;
      queue[qTail++] = botIdx;
    }
  }
  for (let y = 0; y < h; y++) {
    const leftIdx = y * w;
    if (!isBg[leftIdx] && isPureBlackBg(leftIdx)) {
      isBg[leftIdx] = 1;
      queue[qTail++] = leftIdx;
    }
    const rightIdx = y * w + (w - 1);
    if (!isBg[rightIdx] && isPureBlackBg(rightIdx)) {
      isBg[rightIdx] = 1;
      queue[qTail++] = rightIdx;
    }
  }

  // 4-connected BFS flood fill across exterior black studio backdrop
  while (qHead < qTail) {
    const idx = queue[qHead++];
    const x = idx % w;
    const y = (idx - x) / w;

    if (x > 0) {
      const n = idx - 1;
      if (!isBg[n] && isPureBlackBg(n)) {
        isBg[n] = 1;
        queue[qTail++] = n;
      }
    }
    if (x < w - 1) {
      const n = idx + 1;
      if (!isBg[n] && isPureBlackBg(n)) {
        isBg[n] = 1;
        queue[qTail++] = n;
      }
    }
    if (y > 0) {
      const n = idx - w;
      if (!isBg[n] && isPureBlackBg(n)) {
        isBg[n] = 1;
        queue[qTail++] = n;
      }
    }
    if (y < h - 1) {
      const n = idx + w;
      if (!isBg[n] && isPureBlackBg(n)) {
        isBg[n] = 1;
        queue[qTail++] = n;
      }
    }
  }

  // Soft 4px distance falloff from exterior background for silky anti-aliased blending
  const dist = new Uint8Array(total);
  dist.fill(255);
  let dHead = 0;
  let dTail = 0;
  const dQueue = new Int32Array(total);
  for (let i = 0; i < total; i++) {
    if (isBg[i]) {
      dist[i] = 0;
      dQueue[dTail++] = i;
    }
  }
  while (dHead < dTail) {
    const idx = dQueue[dHead++];
    const d = dist[idx];
    if (d >= 4) continue;
    const x = idx % w;
    const y = (idx - x) / w;
    const nextD = d + 1;
    if (x > 0 && dist[idx - 1] > nextD) {
      dist[idx - 1] = nextD;
      dQueue[dTail++] = idx - 1;
    }
    if (x < w - 1 && dist[idx + 1] > nextD) {
      dist[idx + 1] = nextD;
      dQueue[dTail++] = idx + 1;
    }
    if (y > 0 && dist[idx - w] > nextD) {
      dist[idx - w] = nextD;
      dQueue[dTail++] = idx - w;
    }
    if (y < h - 1 && dist[idx + w] > nextD) {
      dist[idx + w] = nextD;
      dQueue[dTail++] = idx + w;
    }
  }

  // Apply exterior transparency + edge feather + smooth top/bottom strap fade
  const topFadeEnd = h * 0.14;
  const botFadeStart = h * 0.84;

  for (let i = 0; i < total; i++) {
    const o = i * 4;
    if (isBg[i]) {
      data[o + 3] = 0;
      continue;
    }

    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    let alpha = 1.0;

    // Anti-alias dark shadow halo pixels within 4px of exterior background
    const d = dist[i];
    if (d <= 4 && lum < 36) {
      const lumFactor = Math.max(0, Math.min(1, (lum - 8) / 28));
      const distFactor = d / 4;
      alpha *= Math.max(lumFactor, distFactor * 0.85);
    }

    // Dissolve top & bottom leather strap tips seamlessly into #0A0A0B
    const y = Math.floor(i / w);
    if (y < topFadeEnd) {
      const t = Math.max(0, y / topFadeEnd);
      alpha *= t * t * (3 - 2 * t);
    } else if (y > botFadeStart) {
      const t = Math.max(0, (h - 1 - y) / (h - 1 - botFadeStart));
      alpha *= t * t * (3 - 2 * t);
    }

    data[o + 3] = Math.max(0, Math.min(255, Math.round(alpha * 255)));
  }

  await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .webp({ quality: 90, alphaQuality: 95, effort: 5 })
    .toFile(outputPath);

  return { width: w, height: h };
}

async function main() {
  const qaComposites = [];
  const qaW = 340;
  const qaH = 510;

  for (let i = 0; i < WATCHES.length; i++) {
    const w = WATCHES[i];
    const outDir = path.join(process.cwd(), "public", "watches", w.id);
    fs.mkdirSync(outDir, { recursive: true });

    const moodyIn = path.join(ARTIFACT_DIR, w.moodyFile);
    const frontIn = path.join(ARTIFACT_DIR, w.frontFile);
    const moodyOut = path.join(outDir, "moody.webp");
    const frontOut = path.join(outDir, "front.png");

    const mInfo = await processMoodyToWebp(moodyIn, moodyOut);
    const fInfo = await removeWhiteBgToPng(frontIn, frontOut);

    console.log(
      `✓ ${w.id.padEnd(9)} | moody.webp (${mInfo.width}x${mInfo.height}) | front.png (${fInfo.width}x${fInfo.height})`
    );

    // Build edge-check QA composite over actual saturated stone panel color
    const resizedFront = await sharp(frontOut)
      .resize(qaW, qaH, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    const tile = await sharp({
      create: { width: qaW, height: qaH, channels: 4, background: w.panelColor },
    })
      .composite([{ input: resizedFront }])
      .png()
      .toBuffer();

    qaComposites.push({ input: tile, left: i * qaW, top: 0 });
  }

  await sharp({
    create: { width: qaW * 6, height: qaH, channels: 4, background: "#0A0A0B" },
  })
    .composite(qaComposites)
    .jpeg({ quality: 92 })
    .toFile(path.join(ARTIFACT_DIR, "front_cutout_qa.jpg"));

  // Also composite all 6 moody.webp over #141417 to guarantee zero black-box contrast!
  const moodyQaComposites = [];
  for (let i = 0; i < WATCHES.length; i++) {
    const w = WATCHES[i];
    const moodyOut = path.join(process.cwd(), "public", "watches", w.id, "moody.webp");
    const mBuf = await sharp(moodyOut)
      .resize(qaW, qaH, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();
    moodyQaComposites.push({ input: mBuf, left: i * qaW, top: 0 });
  }
  await sharp({
    create: { width: qaW * 6, height: qaH, channels: 4, background: "#141417" },
  })
    .composite(moodyQaComposites)
    .jpeg({ quality: 92 })
    .toFile(path.join(ARTIFACT_DIR, "moody_blend_qa.jpg"));

  console.log("✓ Saved QA sheets: front_cutout_qa.jpg & moody_blend_qa.jpg");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
