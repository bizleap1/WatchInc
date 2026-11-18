const sharp = require('sharp');
const fs = require('fs');

async function processWatches() {
  const upscaledBuffer = await sharp('public/images/hero/watch-steel-lapis.png')
    .resize(420, 960, { kernel: 'lanczos3' })
    .sharpen()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = upscaledBuffer;
  const { width, height, channels } = info;

  // 0. Base Lapis Lazuli watch
  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile('public/images/products/real-watch-lapis.png');
  console.log('✓ Created real-watch-lapis.png');

  async function createVariant(name, tintR, tintG, tintB) {
    const variantData = Buffer.from(data);

    for (let y = 370; y <= 590; y++) {
      for (let x = 120; x <= 300; x++) {
        const dx = (x - 210);
        const dy = (y - 480);
        const dist = Math.sqrt(dx * dx + (dy * dy) * 0.9);

        if (dist < 88) {
          const idx = (y * width + x) * channels;
          const r = variantData[idx];
          const g = variantData[idx + 1];
          const b = variantData[idx + 2];

          const isBlue = b > r && b > g;
          const brightness = (r + g + b) / 3;

          // Preserve white markers and hands
          if (isBlue && brightness < 205) {
            const intensity = b / 255;
            variantData[idx] = Math.min(255, Math.round(tintR * intensity * 1.3));
            variantData[idx + 1] = Math.min(255, Math.round(tintG * intensity * 1.3));
            variantData[idx + 2] = Math.min(255, Math.round(tintB * intensity * 1.3));
          }
        }
      }
    }

    await sharp(variantData, { raw: { width, height, channels } })
      .png()
      .toFile(`public/images/products/${name}`);
    console.log(`✓ Created ${name}`);
  }

  // 1. Malachite (Emerald Green, exactly matching the reference model's watch!)
  await createVariant('real-watch-malachite.png', 18, 145, 82);

  // 2. Citrine (Honey Amber Gold)
  await createVariant('real-watch-citrine.png', 225, 160, 40);

  // 3. Rose Quartz / Mother of Pearl (Soft Iridescent Rose)
  await createVariant('real-watch-rosequartz.png', 230, 165, 180);

  // 4. Amethyst (Regal Deep Violet)
  await createVariant('real-watch-amethyst.png', 140, 95, 185);

  // 5. Tiger's Eye (Golden Bronze / Chatoyant Brown)
  await createVariant('real-watch-tigereye.png', 175, 115, 45);
}

processWatches().catch(console.error);
