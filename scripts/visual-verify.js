const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const ARTIFACT_DIR = "C:\\Users\\LENOVO\\.gemini\\antigravity\\brain\\2460ab27-41d5-42de-859d-69cb1e7ee5ce";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function main() {
  console.log("=== STARTING VISUAL & PERFORMANCE VERIFICATION ===");
  console.log("Launching Chrome at:", CHROME_PATH);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const consoleErrors = [];
    page.on("console", (msg) => {
      const type = msg.type();
      const text = msg.text();
      if (type === "error") {
        consoleErrors.push(text);
        console.error("Browser Console Error:", text);
      }
    });

    page.on("response", (res) => {
      if (res.status() >= 400) {
        console.log(`404/Error URL: ${res.url()} [${res.status()}]`);
      }
    });

    page.on("pageerror", (err) => {
      consoleErrors.push(err.toString());
      console.error("Browser Page Error:", err);
    });

    console.log("Navigating to http://localhost:3000...");
    await page.goto("http://localhost:3000", { waitUntil: "networkidle0", timeout: 30000 });

    // Verify styles applied
    const computedStyles = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      const style = window.getComputedStyle(body);
      const htmlStyle = window.getComputedStyle(html);
      return {
        bodyBg: style.backgroundColor,
        bodyColor: style.color,
        fontFamily: style.fontFamily,
        themeBg: htmlStyle.getPropertyValue("--theme-bg"),
        classes: body.className,
      };
    });

    console.log("Computed Styles:", computedStyles);

    // Wait for entrance loader to dismiss (or click SKIP)
    try {
      const skipButton = await page.$('button[aria-label="Skip introductory calibration"]');
      if (skipButton) {
        console.log("Found SKIP button on entrance loader, clicking...");
        await skipButton.click();
      }
    } catch {}

    // Wait 2 seconds for unmount and smooth reveal
    await new Promise((r) => setTimeout(r, 2200));

    // Confirm loader is completely unmounted from DOM
    const loaderExists = await page.evaluate(() => {
      return document.querySelector('[aria-label="Skip introductory calibration"]') !== null;
    });
    console.log("Entrance loader completely unmounted:", !loaderExists);

    // 1. Screenshot: Hero
    const heroPath = path.join(ARTIFACT_DIR, "hero.png");
    await page.screenshot({ path: heroPath });
    console.log("✓ Hero screenshot captured:", heroPath);

    // 2. Screenshot: Pinned Collection (mid-scroll)
    console.log("Scrolling into Pinned Collection...");
    await page.evaluate(() => {
      const collectionEl = document.getElementById("collection");
      if (collectionEl) {
        const top = collectionEl.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top + 900, behavior: "instant" });
      } else {
        window.scrollTo({ top: 1600, behavior: "instant" });
      }
    });
    await new Promise((r) => setTimeout(r, 1200));

    const collectionPath = path.join(ARTIFACT_DIR, "collection_pinned.png");
    await page.screenshot({ path: collectionPath });
    console.log("✓ Pinned Collection screenshot captured:", collectionPath);

    // 3. Screenshot: "No two alike" section
    console.log("Scrolling to No Two Alike section...");
    await page.evaluate(() => {
      const grid = document.querySelector(".specimen-dial-card");
      if (grid) {
        grid.scrollIntoView({ behavior: "instant", block: "center" });
      } else {
        window.scrollTo({ top: 3200, behavior: "instant" });
      }
    });
    await new Promise((r) => setTimeout(r, 1200));

    const noTwoAlikePath = path.join(ARTIFACT_DIR, "no_two_alike.png");
    await page.screenshot({ path: noTwoAlikePath });
    console.log("✓ No Two Alike screenshot captured:", noTwoAlikePath);

    // 4. Screenshot: The Energizing Ritual card
    console.log("Scrolling to Energizing Ritual section...");
    await page.evaluate(() => {
      const el = document.getElementById("ritual");
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        // Scroll halfway into the 2200px pinned sequence so the card and signature are active
        window.scrollTo({ top: top + 1200, behavior: "instant" });
      } else {
        window.scrollTo({ top: 17500, behavior: "instant" });
      }
    });
    await new Promise((r) => setTimeout(r, 1500));

    const ritualPath = path.join(ARTIFACT_DIR, "ritual_card.png");
    await page.screenshot({ path: ritualPath });
    console.log("✓ Ritual Card screenshot captured:", ritualPath);

    // 5. Screenshot: Footer
    console.log("Scrolling to Footer...");
    await page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
    });
    await new Promise((r) => setTimeout(r, 1200));

    const footerPath = path.join(ARTIFACT_DIR, "footer.png");
    await page.screenshot({ path: footerPath });
    console.log("✓ Footer screenshot captured:", footerPath);

    console.log("\n--- CONSOLE ERRORS SUMMARY ---");
    if (consoleErrors.length === 0) {
      console.log("✓ ZERO console errors detected during full top-to-bottom scroll!");
    } else {
      console.log(`Found ${consoleErrors.length} console errors:`, consoleErrors);
    }

    console.log("\n=== ALL VISUAL SCREENSHOTS CAPTURED SUCCESSFULLY ===");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("Verification script failed:", err);
  process.exit(1);
});
