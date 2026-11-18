const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const http = require("http");
const puppeteer = require("puppeteer-core");
const sharp = require("sharp");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR =
  "C:/Users/LENOVO/.gemini/antigravity/brain/2460ab27-41d5-42de-859d-69cb1e7ee5ce";
const PORT = 3100;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(url, (res) => {
        res.resume();
        if (res.statusCode && res.statusCode < 500) {
          resolve();
        } else if (Date.now() - start > timeoutMs) {
          reject(new Error(`Server responded with ${res.statusCode}`));
        } else {
          setTimeout(attempt, 350);
        }
      });
      req.on("error", () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error("Timed out waiting for Next.js server"));
        } else {
          setTimeout(attempt, 350);
        }
      });
    };
    attempt();
  });
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function scrollToY(page, y) {
  await page.evaluate((targetY) => {
    window.scrollTo({ top: targetY, behavior: "instant" });
  }, y);
  await sleep(600);
}

async function buildContactSheet(imagePaths, outPath, cols, tileW, tileH) {
  const rows = Math.ceil(imagePaths.length / cols);
  const pad = 20;
  const labelH = 34;
  const width = cols * (tileW + pad) + pad;
  const height = rows * (tileH + labelH + pad) + pad;

  const composites = [];
  for (let i = 0; i < imagePaths.length; i++) {
    const { file, label } = imagePaths[i];
    if (!fs.existsSync(file)) continue;
    const col = i % cols;
    const row = Math.floor(i / cols);
    const left = pad + col * (tileW + pad);
    const top = pad + row * (tileH + labelH + pad);

    const resized = await sharp(file)
      .resize(tileW, tileH, { fit: "contain", background: "#0A0A0B" })
      .toBuffer();

    const labelSvg = Buffer.from(
      `<svg width="${tileW}" height="${labelH}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${tileW}" height="${labelH}" fill="#141416"/>
        <text x="12" y="22" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="14" font-weight="700" letter-spacing="1.5">${label}</text>
      </svg>`
    );

    composites.push({ input: labelSvg, left, top });
    composites.push({ input: resized, left, top: top + labelH });
  }

  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 10, g: 10, b: 11 },
    },
  })
    .composite(composites)
    .jpeg({ quality: 88 })
    .toFile(outPath);
}

async function main() {
  const server = spawn(
    process.platform === "win32" ? "cmd.exe" : "sh",
    process.platform === "win32"
      ? ["/c", "npx", "next", "start", "-p", String(PORT), "-H", "127.0.0.1"]
      : ["-c", `npx next start -p ${PORT} -H 127.0.0.1`],
    {
      cwd: process.cwd(),
      env: { ...process.env, NEXT_DIST_DIR: ".next-verify" },
      stdio: ["ignore", "pipe", "pipe"],
    }
  );

  let browser;
  try {
    await waitForServer(BASE_URL);
    console.log("Server ready on", BASE_URL);

    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--no-proxy-server",
        "--disable-gpu-sandbox",
      ],
    });

    const consoleErrors = [];
    const pageErrors = [];
    const failedResponses = [];

    const attachListeners = (page, label) => {
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(`[${label}] ${msg.text()}`);
      });
      page.on("pageerror", (err) => {
        pageErrors.push(`[${label}] ${err.message}`);
      });
      page.on("response", (res) => {
        if (res.status() >= 400 && !res.url().includes("favicon")) {
          failedResponses.push(`[${label}] ${res.status()} ${res.url()}`);
        }
      });
    };

    // 1. DESKTOP 1440 x 900
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.evaluateOnNewDocument(() => {
      try {
        sessionStorage.setItem("watchinc_entrance_seen", "true");
      } catch {}
    });
    attachListeners(page, "desktop-home");

    await page.goto(BASE_URL, { waitUntil: "networkidle2", timeout: 45000 });
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await sleep(1000);

    const totalH = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y <= totalH; y += 600) {
      await page.evaluate((pos) => window.scrollTo(0, pos), y);
      await sleep(150);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(700);

    const desktopAudit = await page.evaluate(() => {
      const overflow = document.documentElement.scrollWidth > window.innerWidth;
      const imgs = Array.from(document.querySelectorAll("img"));
      const brokenImgs = imgs
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.getAttribute("src") || img.alt);

      const navLabels = Array.from(document.querySelectorAll("header nav button")).map(
        (b) => b.textContent?.trim()
      );

      const removedIdsPresent = [
        "manifesto",
        "collection",
        "no-two-alike",
        "ritual",
        "in-the-box",
        "waitlist",
      ].filter((id) => Boolean(document.getElementById(id)));

      const keptSections = ["selenite", "worn", "footer"].map((id) => {
        const el = document.getElementById(id);
        if (!el) return { id, missing: true };
        const rect = el.getBoundingClientRect();
        return {
          id,
          top: Math.round(rect.top + window.scrollY),
          height: Math.round(rect.height),
        };
      });

      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        scrollHeight: document.documentElement.scrollHeight,
        overflow,
        navLabels,
        removedIdsPresent,
        brokenImgs,
        keptSections,
      };
    });

    console.log("DESKTOP AUDIT:", JSON.stringify(desktopAudit, null, 2));

    const getSec = (id) => desktopAudit.keptSections.find((s) => s.id === id);
    const desktopShots = [];
    const snapDesktop = async (name, label, y) => {
      await scrollToY(page, Math.max(0, y));
      const file = path.join(ARTIFACT_DIR, `final_desktop_${name}.png`);
      await page.screenshot({ path: file });
      desktopShots.push({ file, label });
    };

    await snapDesktop("01_hero", "HERO (1440px)", 0);
    await snapDesktop("02_selenite", "SELENITE (1440px)", getSec("selenite").top + 40);
    await snapDesktop("03_worn", "WORN (1440px)", getSec("worn").top + 20);
    await snapDesktop("04_footer", "FOOTER (1440px)", getSec("footer").top - 40);

    await buildContactSheet(
      desktopShots,
      path.join(ARTIFACT_DIR, "final_desktop_1440.jpg"),
      2,
      720,
      450
    );

    // 2. MOBILE 390 x 844
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await mobilePage.evaluateOnNewDocument(() => {
      try {
        sessionStorage.setItem("watchinc_entrance_seen", "true");
      } catch {}
    });
    attachListeners(mobilePage, "mobile-home");

    await mobilePage.goto(BASE_URL, { waitUntil: "networkidle2", timeout: 45000 });
    await mobilePage.evaluate(() => document.fonts && document.fonts.ready);
    await sleep(900);

    const mobH = await mobilePage.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y <= mobH; y += 500) {
      await mobilePage.evaluate((pos) => window.scrollTo(0, pos), y);
      await sleep(120);
    }
    await mobilePage.evaluate(() => window.scrollTo(0, 0));
    await sleep(600);

    const mobileAudit = await mobilePage.evaluate(() => {
      const overflow = document.documentElement.scrollWidth > window.innerWidth;
      const keptSections = ["selenite", "worn", "footer"].map((id) => {
        const el = document.getElementById(id);
        if (!el) return { id, missing: true };
        const rect = el.getBoundingClientRect();
        return {
          id,
          top: Math.round(rect.top + window.scrollY),
          height: Math.round(rect.height),
        };
      });
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        scrollHeight: document.documentElement.scrollHeight,
        overflow,
        keptSections,
      };
    });

    console.log("MOBILE AUDIT:", JSON.stringify(mobileAudit, null, 2));

    const getMobSec = (id) => mobileAudit.keptSections.find((s) => s.id === id);
    const mobileShots = [];
    const snapMobile = async (name, label, y) => {
      await scrollToY(mobilePage, Math.max(0, y));
      const file = path.join(ARTIFACT_DIR, `final_mobile_${name}.png`);
      await mobilePage.screenshot({ path: file });
      mobileShots.push({ file, label });
    };

    await snapMobile("01_hero", "HERO (390px)", 0);
    await snapMobile("02_selenite", "SELENITE (390px)", getMobSec("selenite").top);
    await snapMobile("03_worn", "WORN (390px)", getMobSec("worn").top);
    await snapMobile("04_footer", "FOOTER (390px)", getMobSec("footer").top);

    await buildContactSheet(
      mobileShots,
      path.join(ARTIFACT_DIR, "final_mobile_390.jpg"),
      2,
      390,
      844
    );

    console.log("CONSOLE ERRORS:", consoleErrors);
    console.log("PAGE ERRORS:", pageErrors);
    console.log("FAILED RESPONSES:", failedResponses);

    if (
      consoleErrors.length > 0 ||
      pageErrors.length > 0 ||
      failedResponses.length > 0 ||
      desktopAudit.overflow ||
      mobileAudit.overflow ||
      desktopAudit.removedIdsPresent.length > 0 ||
      desktopAudit.brokenImgs.length > 0
    ) {
      process.exitCode = 1;
    }
  } finally {
    if (browser) await browser.close();
    server.kill("SIGTERM");
    if (process.platform === "win32" && server.pid) {
      try {
        spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"], {
          stdio: "ignore",
        });
      } catch {}
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
