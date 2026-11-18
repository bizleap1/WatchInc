const sharp = require('sharp');
const fs = require('fs');

async function processHero() {
  const image = sharp('public/images/hero/reference-hero.jpg');
  const { width, height } = await image.metadata();
  console.log(`Processing image: ${width}x${height}`);

  // 1. Extract the frosted glowing emblem (approx center x: 470..550, y: 95..190)
  // Let's extract a generous region and save
  await sharp('public/images/hero/reference-hero.jpg')
    .extract({ left: 470, top: 90, width: 84, height: 105 })
    .toFile('public/images/hero/frosted-emblem.png');
  console.log('✓ Extracted frosted emblem');

  // 2. Sample colors around the text to create a clean seamless background
  // The text region is roughly: left 280 to 744, top 210 to 370.
  // The background behind it is a soft gradient:
  // Left: ~ [206, 219, 227] (powder blue/grey)
  // Center: ~ [220, 220, 228] (lavender mist)
  // Right: ~ [228, 222, 230] (soft blush)
  
  // Let's create an inpaint/seamless overlay for the text area:
  // We can sample vertical slices or create a smooth patch matching the gradient exactly
  // Even better: we can read the raw pixel buffer, interpolate the background across the text rectangle,
  // and blur the patch slightly so it seamlessly replaces the text!
  
  const rawBuffer = await sharp('public/images/hero/reference-hero.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = rawBuffer;
  const channels = info.channels;

  function getPixel(x, y) {
    const idx = (y * width + x) * channels;
    return [data[idx], data[idx+1], data[idx+2]];
  }

  function setPixel(x, y, r, g, b) {
    const idx = (y * width + x) * channels;
    data[idx] = r;
    data[idx+1] = g;
    data[idx+2] = b;
  }

  // Text bounding box roughly:
  // x: 280..745, y: 205..370
  // Inpainting by bilinear interpolation from border pixels above and below, and left and right!
  const boxLeft = 280;
  const boxRight = 745;
  const boxTop = 205;
  const boxBottom = 375;

  for (let y = boxTop; y <= boxBottom; y++) {
    const yRatio = (y - boxTop) / (boxBottom - boxTop);
    for (let x = boxLeft; x <= boxRight; x++) {
      const xRatio = (x - boxLeft) / (boxRight - boxLeft);

      // Top pixel & bottom pixel
      const topP = getPixel(x, boxTop - 3);
      const botP = getPixel(x, boxBottom + 3);

      // Left pixel & right pixel
      const leftP = getPixel(boxLeft - 3, y);
      const rightP = getPixel(boxRight + 3, y);

      // Interpolate
      const vR = topP[0] * (1 - yRatio) + botP[0] * yRatio;
      const vG = topP[1] * (1 - yRatio) + botP[1] * yRatio;
      const vB = topP[2] * (1 - yRatio) + botP[2] * yRatio;

      const hR = leftP[0] * (1 - xRatio) + rightP[0] * xRatio;
      const hG = leftP[1] * (1 - xRatio) + rightP[1] * xRatio;
      const hB = leftP[2] * (1 - xRatio) + rightP[2] * xRatio;

      // Blend horizontal and vertical interpolation
      const finalR = Math.round((vR + hR) / 2);
      const finalG = Math.round((vG + hG) / 2);
      const finalB = Math.round((vB + hB) / 2);

      setPixel(x, y, finalR, finalG, finalB);
    }
  }

  // Also inpaint the 3 dots button in bottom-right corner: x: 978..1012, y: 442..476
  // so we can render our own crisp, interactive HTML 3-dots button!
  for (let y = 438; y <= 480; y++) {
    const yRatio = (y - 438) / (480 - 438);
    for (let x = 970; x <= 1018; x++) {
      const xRatio = (x - 970) / (1018 - 970);
      const topP = getPixel(x, 435);
      const botP = getPixel(x, Math.min(height - 1, 485));
      const leftP = getPixel(965, y);
      const rightP = getPixel(Math.min(width - 1, 1022), y);

      const r = Math.round(((topP[0] * (1 - yRatio) + botP[0] * yRatio) + (leftP[0] * (1 - xRatio) + rightP[0] * xRatio)) / 2);
      const g = Math.round(((topP[1] * (1 - yRatio) + botP[1] * yRatio) + (leftP[1] * (1 - xRatio) + rightP[1] * xRatio)) / 2);
      const b = Math.round(((topP[2] * (1 - yRatio) + botP[2] * yRatio) + (leftP[2] * (1 - xRatio) + rightP[2] * xRatio)) / 2);
      setPixel(x, y, r, g, b);
    }
  }

  // Save the cleaned backdrop
  await sharp(data, {
    raw: {
      width,
      height,
      channels
    }
  })
  .jpeg({ quality: 95 })
  .toFile('public/images/hero/hero-backdrop-clean.jpg');

  console.log('✓ Created clean hero backdrop without text: public/images/hero/hero-backdrop-clean.jpg');
}

processHero().catch(console.error);
