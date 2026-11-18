const puppeteer = require("puppeteer-core");
const path = require("path");

const ARTIFACT_DIR =
  "C:\\Users\\LENOVO\\.gemini\\antigravity\\brain\\2460ab27-41d5-42de-859d-69cb1e7ee5ce";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const SLIDE_NAMES = [
  "hero_slide_01_overflow.png",
  "hero_slide_02_cherish.png",
  "hero_slide_03_hush.png",
  "hero_slide_04_ascent.png",
  "hero_slide_05_wildfire.png",
  "hero_slide_06_cadence.png",
];

async function main() {
  console.log("=== PHASE 4: FULL 6-SLIDE + MID-TRANSITION VERIFICATION ===");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--no-proxy-server",
      "--window-size=1440,900",
    ],
  });

  const consoleErrors = [];

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
        console.error("[Console Error]:", msg.text());
      }
    });
    page.on("pageerror", (err) => {
      consoleErrors.push(err.toString());
      console.error("[Page Error]:", err.toString());
    });
    page.on("response", (res) => {
      if (res.status() >= 400) {
        console.error(`[HTTP ${res.status()}]: ${res.url()}`);
      }
    });

    const port = process.env.TEST_PORT || "3000";
    await page.goto(`http://127.0.0.1:${port}`, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Skip entrance loader
    const skipBtn = await page.$('button[aria-label="Skip introductory calibration"]');
    if (skipBtn) await skipBtn.click();

    // Wait for initial load timeline to finish
    await new Promise((r) => setTimeout(r, 1800));

    // Slide 1 (Overflow / Citrine)
    await page.screenshot({ path: path.join(ARTIFACT_DIR, SLIDE_NAMES[0]) });
    console.log("✓ Captured:", SLIDE_NAMES[0]);

    const nextBtn = await page.$('button[aria-label="Next watch"]');
    if (!nextBtn) throw new Error("Next watch button not found");

    // Advance through slides 2..6, capturing mid-transition on slide 1 -> 2
    for (let i = 1; i < SLIDE_NAMES.length; i++) {
      await nextBtn.click();

      if (i === 1) {
        // Capture mid-curtain transition frame (~480ms into 1.4s sweep)
        await new Promise((r) => setTimeout(r, 480));
        await page.screenshot({
          path: path.join(ARTIFACT_DIR, "hero_mid_transition.png"),
        });
        console.log("✓ Captured: hero_mid_transition.png");
        await new Promise((r) => setTimeout(r, 1250));
      } else {
        await new Promise((r) => setTimeout(r, 1750));
      }

      const activeTitle = await page.evaluate(() => {
        const h1 = document.querySelector("#hero h1");
        return h1 ? h1.textContent : "";
      });
      console.log(`  Slide ${i + 1} title:`, activeTitle);

      await page.screenshot({ path: path.join(ARTIFACT_DIR, SLIDE_NAMES[i]) });
      console.log("✓ Captured:", SLIDE_NAMES[i]);
    }

    // Also capture Open Product on Cadence (slide 6) to verify real transparent front.png in detail view
    const discoverBtn = await page.$('button[aria-label="DISCOVER CADENCE"]');
    if (discoverBtn) {
      await discoverBtn.click();
      await new Promise((r) => setTimeout(r, 1350));
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "hero_open_product_real.png"),
      });
      console.log("✓ Captured: hero_open_product_real.png");
    }

    console.log("\n--- CONSOLE ERRORS SUMMARY ---");
    if (consoleErrors.length === 0) {
      console.log("ZERO console errors!");
    } else {
      console.error(`Found ${consoleErrors.length} errors:`, consoleErrors);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
