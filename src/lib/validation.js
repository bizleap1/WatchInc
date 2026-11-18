/**
 * Input validation utilities for waitlist submission.
 */

const VALID_WATCH_SLUGS = [
  "overflow",
  "cherish",
  "hush",
  "ascent",
  "wildfire",
  "cadence",
];

const VALID_PLATE_RESPONSES = ["yes", "no", "maybe", "unanswered"];

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function validateWaitlistInput(data = {}) {
  const errors = {};

  // Honeypot bot protection
  if (data.website_trap || data.hp) {
    errors.bot = "Submission rejected.";
    return { isValid: false, errors };
  }

  // Name validation (optional or minimal string)
  let name = "";
  if (data.name && typeof data.name === "string") {
    name = data.name.trim().slice(0, 100);
  }

  // Email validation
  if (!data.email || typeof data.email !== "string") {
    errors.email = "Please enter your email address.";
  } else {
    const trimmed = data.email.trim();
    if (trimmed.length < 5 || trimmed.length > 254) {
      errors.email = "Email address must be between 5 and 254 characters.";
    } else if (!EMAIL_REGEX.test(trimmed)) {
      errors.email = "Please enter a valid email address.";
    }
  }

  // Multi-select stone chips
  let stones = [];
  if (Array.isArray(data.stones)) {
    stones = data.stones
      .map((s) => String(s).trim().toLowerCase())
      .filter((s) => VALID_WATCH_SLUGS.includes(s));
  } else if (data.preferredWatch && typeof data.preferredWatch === "string") {
    const s = data.preferredWatch.trim().toLowerCase();
    if (VALID_WATCH_SLUGS.includes(s)) {
      stones = [s];
    }
  }

  // Selenite resting plate interest: "yes" | "no" | "maybe"
  let restingPlateInterest = "unanswered";
  if (data.restingPlateInterest !== undefined && data.restingPlateInterest !== null) {
    const plateVal = String(data.restingPlateInterest).trim().toLowerCase();
    if (["yes", "no", "maybe"].includes(plateVal)) {
      restingPlateInterest = plateVal;
    } else if (plateVal === "unanswered") {
      restingPlateInterest = "unanswered";
    } else {
      errors.restingPlateInterest = "Please select Yes, No, or Maybe for the selenite resting plate.";
    }
  }

  // Consent validation
  if (!data.consent) {
    errors.consent = "You must agree to receive launch updates to join the waitlist.";
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    sanitized: isValid
      ? {
          name,
          email: data.email.trim().toLowerCase(),
          stones,
          preferredWatch: stones[0] || null,
          restingPlateInterest,
          consent: Boolean(data.consent),
          timestamp: new Date().toISOString(),
        }
      : null,
  };
}
