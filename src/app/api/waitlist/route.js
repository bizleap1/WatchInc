import { NextResponse } from "next/server";
import { validateWaitlistInput } from "@/lib/validation";
import { persistSubscriber, checkRateLimit, checkWaitlistServiceStatus } from "@/lib/waitlist";
import { getWaitlistAnalytics } from "@/lib/analytics";

export async function POST(request) {
  try {
    // Basic abuse protection: rate limiting by IP
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
    
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many submissions from this connection. Please try again in ${rateCheck.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    // Check service readiness
    const serviceStatus = checkWaitlistServiceStatus();
    if (!serviceStatus.available) {
      return NextResponse.json(
        {
          success: false,
          error: serviceStatus.reason || "Waitlist storage service is currently unavailable.",
        },
        { status: 503 }
      );
    }

    // Parse body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload in request." },
        { status: 400 }
      );
    }

    // Validate inputs
    const { isValid, errors, sanitized } = validateWaitlistInput(body);
    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Please correct the errors in the form.",
          validationErrors: errors,
        },
        { status: 400 }
      );
    }

    // Persist to server store
    const result = await persistSubscriber(sanitized);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          duplicate: Boolean(result.duplicate),
        },
        { status: result.status || 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        id: result.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unhandled error in waitlist API route:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while processing your request. Please try again.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const analytics = await getWaitlistAnalytics();
    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Error retrieving waitlist analytics:", error);
    return NextResponse.json(
      { success: false, error: "Unable to calculate waitlist metrics." },
      { status: 500 }
    );
  }
}
