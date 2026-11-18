const puppeteer = require("puppeteer-core");
const path = require("path");

const ARTIFACT_DIR =
  "C:\\Users\\LENOVO\\.gemini\\antigravity\\brain\\2460ab27-41d5-42de-859d-69cb1e7ee5ce";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function main() {
  console.log("=== HERO SLIDER FULL VERIFICATION ===");
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

    const port = process.env.TEST_PORT || "3100";
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "networkidle0", timeout: 30000 });

    // Skip entrance loader immediately if visible
    const skipBtn = await page.$('button[aria-label="Skip introductory calibration"]');
    if (skipBtn) {
      await skipBtn.click();
    }

    // Wait for initial load timeline (~1.2s) to settle completely
    await new Promise((r) => setTimeout(r, 1700));

    // Verify computed font & dimensions
    const metrics = await page.evaluate(() => {
      const h1 = document.querySelector("#hero h1");
      const h1Style = h1 ? getComputedStyle(h1) : null;
      const nav = document.querySelector("header");
      return {
        navHeight: nav ? nav.getBoundingClientRect().height : 0,
        h1Font: h1Style ? h1Style.fontFamily : "none",
        h1Size: h1Style ? h1Style.fontSize : "none",
        h1Text: h1 ? h1.textContent : "",
        overflowX: document.documentElement.scrollWidth > window.innerWidth,
      };
    });
    console.log("Hero Metrics:", metrics);

    // 1. Screenshot: Load State (Overflow / Citrine)
    const loadPath = path.join(ARTIFACT_DIR, "hero_load_state.png");
    await page.screenshot({ path: loadPath });
    console.log("1. Captured load state:", loadPath);

    // 2. Trigger Next Slide & capture Mid-Curtain Transition (~480ms into 1.4s sweep)
    const nextBtn = await page.$('button[aria-label="Next watch"]');
    if (!nextBtn) throw new Error("Next watch button not found");
    await nextBtn.click();
    await new Promise((r) => setTimeout(r, 480));

    const midCurtainPath = path.join(ARTIFACT_DIR, "hero_mid_curtain.png");
    await page.screenshot({ path: midCurtainPath });
    console.log("2. Captured mid-curtain transition:", midCurtainPath);

    // 3. Wait for Next Slide to settle (Cherish / Rose Quartz)
    await new Promise((r) => setTimeout(r, 1250));
    const nextSlideTitle = await page.evaluate(() => {
      const h1 = document.querySelector("#hero h1");
      return h1 ? h1.textContent : "";
    });
    console.log("Active slide after transition:", nextSlideTitle);

    const nextSlidePath = path.join(ARTIFACT_DIR, "hero_next_slide.png");
    await page.screenshot({ path: nextSlidePath });
    console.log("3. Captured next slide:", nextSlidePath);

    // 4. Open Product View (click DISCOVER CHERISH button)
    const discoverBtn = await page.$('button[aria-label="DISCOVER CHERISH"]');
    if (!discoverBtn) throw new Error("DISCOVER CHERISH button not found");
    await discoverBtn.click();
    await new Promise((r) => setTimeout(r, 1350));

    const productPathUrl = await page.evaluate(() => window.location.pathname);
    console.log("URL after opening product:", productPathUrl);

    const openProductPath = path.join(ARTIFACT_DIR, "hero_open_product.png");
    await page.screenshot({ path: openProductPath });
    console.log("4. Captured open product view:", openProductPath);

    // 5. Open Film Overlay (click 64px play button inside coloured area)
    const detailPlayBtn = await page.$('button[aria-label="Watch detail film for CHERISH"]');
    if (!detailPlayBtn) throw new Error("Detail film play button not found");
    await detailPlayBtn.click();
    await new Promise((r) => setTimeout(r, 1500));

    const filmOverlayPath = path.join(ARTIFACT_DIR, "hero_film_overlay.png");
    await page.screenshot({ path: filmOverlayPath });
    console.log("5. Captured film overlay:", filmOverlayPath);

    // Close Film Overlay via Escape
    await page.keyboard.press("Escape");
    await new Promise((r) => setTimeout(r, 900));

    // Close Product View via ← BACK button
    const backBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent && b.textContent.trim().includes("BACK")
      );
    });
    if (backBtn && backBtn.asElement()) {
      await backBtn.asElement().click();
      await new Promise((r) => setTimeout(r, 1300));
    }
    const restoredUrl = await page.evaluate(() => window.location.pathname);
    console.log("URL after closing product:", restoredUrl);

    // Check mobile viewport (375x812) for zero overflow
    await page.setViewport({ width: 375, height: 812 });
    await new Promise((r) => setTimeout(r, 500));
    const mobileOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    console.log("Mobile 375px horizontal overflow:", mobileOverflow);

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
