import { getStoredSubscribers } from "./waitlist.js";

/**
 * Calculates aggregate, privacy-preserving waitlist analytics.
 * STRICT PRIVACY: Never returns email addresses, IDs, or timestamps.
 * 
 * Formula:
 * Selenite Yes Percentage = (Yes / (Yes + No + Maybe)) * 100
 */
export async function getWaitlistAnalytics() {
  const subscribers = await getStoredSubscribers();

  const total = subscribers.length;

  const plateCounts = {
    yes: 0,
    no: 0,
    maybe: 0,
    unanswered: 0,
  };

  const stoneCounts = {
    overflow: 0,
    cherish: 0,
    hush: 0,
    ascent: 0,
    wildfire: 0,
    cadence: 0,
    undecided: 0,
  };

  for (const sub of subscribers) {
    // Plate interest
    const plate = sub.restingPlateInterest ? sub.restingPlateInterest.toLowerCase() : "unanswered";
    if (plateCounts[plate] !== undefined) {
      plateCounts[plate]++;
    } else {
      plateCounts.unanswered++;
    }

    // Stone preferences (can be array or single preferredWatch)
    if (Array.isArray(sub.stones) && sub.stones.length > 0) {
      for (const st of sub.stones) {
        const norm = st.toLowerCase();
        if (stoneCounts[norm] !== undefined) {
          stoneCounts[norm]++;
        }
      }
    } else if (sub.preferredWatch) {
      const norm = sub.preferredWatch.toLowerCase();
      if (stoneCounts[norm] !== undefined) {
        stoneCounts[norm]++;
      } else {
        stoneCounts.undecided++;
      }
    } else {
      stoneCounts.undecided++;
    }
  }

  // Strict percentage formula: Yes / (Yes + No + Maybe)
  const answeredTotal = plateCounts.yes + plateCounts.no + plateCounts.maybe;
  const plateYesPercent = answeredTotal > 0
    ? Number(((plateCounts.yes / answeredTotal) * 100).toFixed(1))
    : 0;

  return {
    totalRegistrations: total,
    plateInterest: {
      yes: plateCounts.yes,
      no: plateCounts.no,
      maybe: plateCounts.maybe,
      unanswered: plateCounts.unanswered,
      answeredTotal,
      yesPercent: plateYesPercent,
      sharePercent: plateYesPercent,
      formulaNote: "Calculated strictly as: Yes / (Yes + No + Maybe). Unanswered responses are excluded from the denominator.",
    },
    watchPreferences: stoneCounts,
    stoneBreakdown: stoneCounts,
  };
}
