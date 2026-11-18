import { NextResponse } from "next/server";
import { getWaitlistAnalytics } from "@/lib/analytics";
import { getStoredSubscribers } from "@/lib/waitlist";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "atelier2026";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const authHeader = request.headers.get("authorization");
    const providedPassword =
      body.password || (authHeader ? authHeader.replace("Bearer ", "") : "");

    if (providedPassword !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access: invalid atelier security credentials." },
        { status: 401 }
      );
    }

    const analytics = await getWaitlistAnalytics();
    const rawSubscribers = await getStoredSubscribers();

    // Privacy-conscious records list for curator review
    const records = rawSubscribers.map((s: any) => ({
      id: s.id,
      name: s.name ? `${s.name.slice(0, 1)}***` : "Anonymous",
      emailMasked: s.email ? s.email.replace(/(.{2})(.*)(?=@)/, "$1***") : "Hidden",
      stones: s.stones || [s.preferredWatch].filter(Boolean),
      restingPlateInterest: s.restingPlateInterest || "unanswered",
      createdAt: s.createdAt,
    }));

    return NextResponse.json({
      success: true,
      analytics,
      records,
    });
  } catch (error) {
    console.error("Admin waitlist error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching registry." },
      { status: 500 }
    );
  }
}
