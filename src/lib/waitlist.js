import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const WAITLIST_FILE = path.join(DATA_DIR, "waitlist-records.json");

// In-memory rate limiter for basic abuse protection
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

/**
 * Checks if the waitlist persistence service is configured and ready.
 */
export function checkWaitlistServiceStatus() {
  const storageMode = process.env.WAITLIST_STORAGE_MODE || "local-file";

  if (storageMode === "disabled") {
    return {
      available: false,
      reason: "Waitlist registration is temporarily paused while undergoing maintenance.",
    };
  }

  if (storageMode === "external") {
    const apiKey = process.env.WAITLIST_API_KEY;
    const dbUrl = process.env.WAITLIST_DATABASE_URL;
    if (!apiKey && !dbUrl) {
      return {
        available: false,
        reason:
          "Waitlist database credentials (WAITLIST_API_KEY / WAITLIST_DATABASE_URL) are not configured.",
      };
    }
  }

  return {
    available: true,
    mode: storageMode,
  };
}

/**
 * Enforces in-memory rate limiting based on client IP or fallback identifier.
 */
export function checkRateLimit(clientId) {
  const now = Date.now();
  const clientRecord = rateLimitMap.get(clientId) || [];

  const activeTimestamps = clientRecord.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );

  if (activeTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(
        (activeTimestamps[0] + RATE_LIMIT_WINDOW_MS - now) / 1000
      ),
    };
  }

  activeTimestamps.push(now);
  rateLimitMap.set(clientId, activeTimestamps);

  if (rateLimitMap.size > 1000) {
    for (const [key, stamps] of rateLimitMap.entries()) {
      if (stamps.every((t) => now - t > RATE_LIMIT_WINDOW_MS)) {
        rateLimitMap.delete(key);
      }
    }
  }

  return { allowed: true };
}

/**
 * Ensures the data directory and waitlist file exist with valid JSON structure.
 */
async function ensureStorage() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      const content = await fs.readFile(WAITLIST_FILE, "utf8");
      JSON.parse(content);
    } catch {
      await fs.writeFile(
        WAITLIST_FILE,
        JSON.stringify({ subscribers: [], updatedAt: new Date().toISOString() }, null, 2),
        "utf8"
      );
    }
  } catch (err) {
    console.error("Failed to initialize waitlist storage directory:", err);
  }
}

/**
 * Reads all waitlist records from the server storage with auto-healing.
 */
export async function getStoredSubscribers() {
  await ensureStorage();
  try {
    const content = await fs.readFile(WAITLIST_FILE, "utf8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed.subscribers) ? parsed.subscribers : [];
  } catch (err) {
    console.error("Auto-healing corrupted waitlist file:", err);
    const cleanDefault = { subscribers: [], updatedAt: new Date().toISOString() };
    try {
      await fs.writeFile(WAITLIST_FILE, JSON.stringify(cleanDefault, null, 2), "utf8");
    } catch (writeErr) {
      console.error("Failed to write clean waitlist file:", writeErr);
    }
    return [];
  }
}

/**
 * Persists a new subscriber with deduplication and timestamp.
 */
export async function persistSubscriber(subscriberData) {
  const status = checkWaitlistServiceStatus();
  if (!status.available) {
    return {
      success: false,
      status: 503,
      error: status.reason,
    };
  }

  await ensureStorage();

  const subscribers = await getStoredSubscribers();
  const normalizedEmail = subscriberData.email.toLowerCase().trim();

  // Deduplication check
  const existing = subscribers.find(
    (s) => s.email && s.email.toLowerCase().trim() === normalizedEmail
  );

  if (existing) {
    return {
      success: false,
      status: 409,
      duplicate: true,
      error: "This email address is already registered on our launch waitlist.",
    };
  }

  const newRecord = {
    id: crypto.randomUUID(),
    name: subscriberData.name || "",
    email: normalizedEmail,
    stones: Array.isArray(subscriberData.stones) && subscriberData.stones.length > 0
      ? subscriberData.stones
      : subscriberData.preferredWatch
      ? [subscriberData.preferredWatch]
      : [],
    preferredWatch: subscriberData.preferredWatch || (subscriberData.stones && subscriberData.stones[0]) || null,
    restingPlateInterest: subscriberData.restingPlateInterest || "unanswered",
    consent: subscriberData.consent,
    createdAt: subscriberData.timestamp || new Date().toISOString(),
  };

  subscribers.push(newRecord);

  const tempPath = `${WAITLIST_FILE}.${Date.now()}.tmp`;
  await fs.writeFile(
    tempPath,
    JSON.stringify({ subscribers, updatedAt: new Date().toISOString() }, null, 2),
    "utf8"
  );
  await fs.rename(tempPath, WAITLIST_FILE);

  return {
    success: true,
    status: 201,
    id: newRecord.id,
    createdAt: newRecord.createdAt,
    message: "You're on the list. Number pending.",
  };
}
