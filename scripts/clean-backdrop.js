const sharp = require('sharp');

async function cleanBackdrop() {
  const image = sharp('public/images/hero/reference-hero.jpg');
  const { width, height } = await image.metadata();

  const rawBuffer = await image
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data } = rawBuffer;
  const channels = 3;

  function getPixel(x, y) {
    const clampedX = Math.max(0, Math.min(width - 1, x));
    const clampedY = Math.max(0, Math.min(height - 1, y));
    const idx = (clampedY * width + clampedX) * channels;
    return [data[idx], data[idx+1], data[idx+2]];
  }

  function setPixel(x, y, r, g, b) {
    const clampedX = Math.max(0, Math.min(width - 1, x));
    const clampedY = Math.max(0, Math.min(height - 1, y));
    const idx = (clampedY * width + clampedX) * channels;
    data[idx] = r;
    data[idx+1] = g;
    data[idx+2] = b;
  }

  function inpaintBox(boxLeft, boxRight, boxTop, boxBottom) {
    for (let y = boxTop; y <= boxBottom; y++) {
      const yRatio = (y - boxTop) / (boxBottom - boxTop);
      for (let x = boxLeft; x <= boxRight; x++) {
        const xRatio = (x - boxLeft) / (boxRight - boxLeft);

        const topP = getPixel(x, boxTop - 3);
        const botP = getPixel(x, boxBottom + 3);
        const leftP = getPixel(boxLeft - 3, y);
        const rightP = getPixel(boxRight + 3, y);

        const vR = topP[0] * (1 - yRatio) + botP[0] * yRatio;
        const vG = topP[1] * (1 - yRatio) + botP[1] * yRatio;
        const vB = topP[2] * (1 - yRatio) + botP[2] * yRatio;

        const hR = leftP[0] * (1 - xRatio) + rightP[0] * xRatio;
        const hG = leftP[1] * (1 - xRatio) + rightP[1] * xRatio;
        const hB = leftP[2] * (1 - xRatio) + rightP[2] * xRatio;

        setPixel(x, y, Math.round((vR + hR)/2), Math.round((vG + hG)/2), Math.round((vB + hB)/2));
      }
    }
  }

  // 1. Text & button box
  inpaintBox(270, 755, 205, 375);

  // 2. Hotspots
  // Hotspot 1 (top-left): cx ~ 203, cy ~ 67
  inpaintBox(180, 226, 45, 90);

  // Hotspot 2 (bottom-left): cx ~ 205, cy ~ 423
  inpaintBox(180, 230, 400, 446);

  // Hotspot 3 (top-right): cx ~ 855, cy ~ 61
  inpaintBox(832, 878, 38, 84);

  // Hotspot 4 (bottom-right): cx ~ 766, cy ~ 447
  inpaintBox(742, 790, 424, 470);

  // 3. Bottom-right 3-dots button: cx ~ 995, cy ~ 460
  inpaintBox(968, 1020, 435, 485);

  await sharp(data, {
    raw: {
      width,
      height,
      channels
    }
  })
  .jpeg({ quality: 96 })
  .toFile('public/images/hero/hero-backdrop-clean.jpg');

  console.log('✓ Cleaned backdrop saved successfully!');
}

cleanBackdrop().catch(console.error);
