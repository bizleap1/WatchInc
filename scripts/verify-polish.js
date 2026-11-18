const puppeteer = require("puppeteer-core");
const path = require("path");

const ARTIFACT_DIR =
  "C:\\Users\\LENOVO\\.gemini\\antigravity\\brain\\2460ab27-41d5-42de-859d-69cb1e7ee5ce";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function main() {
  console.log("=== VERIFYING HERO POLISH FIXES ===");
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

    const port = process.env.TEST_PORT || "3100";
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "networkidle0", timeout: 30000 });
    const skipBtn = await page.$('button[aria-label="Skip introductory calibration"]');
    if (skipBtn) await skipBtn.click();
    await new Promise((r) => setTimeout(r, 1700));

    // Verify watch stays 100% stationary when hovering across the left side
    const watchBefore = await page.evaluate(() => {
      const r = document.querySelector("#hero [data-hero-watch]").getBoundingClientRect();
      return { x: Math.round(r.x * 100) / 100, y: Math.round(r.y * 100) / 100 };
    });
    await page.mouse.move(220, 440);
    await new Promise((r) => setTimeout(r, 350));
    await page.mouse.move(380, 260);
    await new Promise((r) => setTimeout(r, 350));
    const watchAfter = await page.evaluate(() => {
      const r = document.querySelector("#hero [data-hero-watch]").getBoundingClientRect();
      return { x: Math.round(r.x * 100) / 100, y: Math.round(r.y * 100) / 100 };
    });
    console.log("Stationary left-watch hover check:", {
      watchBefore,
      watchAfter,
      isStationary: watchBefore.x === watchAfter.x && watchBefore.y === watchAfter.y,
    });

    // Check cursor is normal, description font is Cormorant Garamond, nav is Plus Jakarta Sans + Cormorant serif wordmark
    const checks = await page.evaluate(() => {
      const bodyStyle = getComputedStyle(document.body);
      const desc = document.querySelector("#hero p.font-serif");
      const descStyle = desc ? getComputedStyle(desc) : null;
      const header = document.querySelector("header");
      const brandSpan = document.querySelector("header a span");
      const navBtn = document.querySelector("header nav button");
      return {
        navHeight: header ? header.getBoundingClientRect().height : 0,
        brandFont: brandSpan ? getComputedStyle(brandSpan).fontFamily : "missing",
        navFont: navBtn ? getComputedStyle(navBtn).fontFamily : "missing",
        bodyCursor: bodyStyle.cursor,
        hasCustomCursorClass: document.body.classList.contains("has-custom-cursor"),
        descFont: descStyle ? descStyle.fontFamily : "missing",
        descSize: descStyle ? descStyle.fontSize : "missing",
      };
    });
    console.log("DOM & Style Checks:", checks);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, "hero_final_premium.png") });
    console.log("✓ Captured: hero_final_premium.png");

    // Verify automatic slow sliding triggers on its own after ~6.5s
    console.log("Waiting for automatic slow slide advance (~6.5s)...");
    await new Promise((r) => setTimeout(r, 8500));
    const afterAutoSlide = await page.evaluate(() => {
      const visibleSlot = Array.from(document.querySelectorAll("#hero [aria-hidden='false'] h1"))[0];
      return visibleSlot ? visibleSlot.textContent : "";
    });
    console.log("Active title after automatic slide:", afterAutoSlide);

    // Open Product -> Click BACK -> measure aspect ratio mid-back-transition to verify zero stretch
    const discoverBtn = await page.$('button[aria-label="DISCOVER CHERISH"]');
    if (discoverBtn) {
      await discoverBtn.click();
      await new Promise((r) => setTimeout(r, 1400));

      const backBtn = await page.evaluateHandle(() =>
        Array.from(document.querySelectorAll("button")).find(
          (b) => b.textContent && b.textContent.trim() === "BACK"
        )
      );
      if (backBtn && backBtn.asElement()) {
        await backBtn.asElement().click();
        // Sample mid-return (~450ms into 1.15s Flip)
        await new Promise((r) => setTimeout(r, 450));
        const midBackRatio = await page.evaluate(() => {
          const el = document.querySelector('#hero [aria-label^="Open details"]');
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return {
            width: Math.round(r.width),
            height: Math.round(r.height),
            ratio: Number((r.width / r.height).toFixed(3)),
            expectedRatio: 0.671,
          };
        });
        console.log("Mid-BACK watch aspect ratio (0.671 = zero stretch):", midBackRatio);
        await page.screenshot({ path: path.join(ARTIFACT_DIR, "hero_mid_back_smooth.png") });
        console.log("✓ Captured: hero_mid_back_smooth.png");

        await new Promise((r) => setTimeout(r, 1000));
      }
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
