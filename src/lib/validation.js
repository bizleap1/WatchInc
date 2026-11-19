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

  // Optional preferred watch: one of the six watches, "undecided", or omitted
  let stones = [];
  let preferredWatch = null;

  if (Array.isArray(data.stones) && data.stones.length > 0) {
    stones = data.stones
      .map((s) => String(s).trim().toLowerCase())
      .filter((s) => VALID_WATCH_SLUGS.includes(s));
    preferredWatch = stones[0] || null;
  } else if (data.preferredWatch && typeof data.preferredWatch === "string") {
    const s = data.preferredWatch.trim().toLowerCase();
    if (VALID_WATCH_SLUGS.includes(s)) {
      stones = [s];
      preferredWatch = s;
    } else if (s === "undecided" || s === "help-me-choose") {
      stones = [];
      preferredWatch = "undecided";
    }
  }

  // Selenite resting plate interest: "yes" | "maybe" | "no" | "unanswered"
  let restingPlateInterest = "unanswered";
  if (data.restingPlateInterest !== undefined && data.restingPlateInterest !== null && data.restingPlateInterest !== "") {
    const plateVal = String(data.restingPlateInterest).trim().toLowerCase();
    if (VALID_PLATE_RESPONSES.includes(plateVal)) {
      restingPlateInterest = plateVal;
    } else {
      errors.restingPlateInterest = "Please select Yes, Maybe, or No for the selenite resting plate.";
    }
  }

  // Consent defaults to true when submitting the waitlist form unless explicitly false
  const consent = data.consent === undefined ? true : Boolean(data.consent);
  if (data.consent === false) {
    errors.consent = "Please confirm you would like to receive launch updates.";
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
          preferredWatch,
          restingPlateInterest,
          consent,
          timestamp: new Date().toISOString(),
        }
      : null,
  };
}
