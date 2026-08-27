import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/server/auth";
import connectDB from "@/lib/db/connection";
import { getPostHogClient } from "@/lib/posthog-server";

/*
 * POST /api/auth/login
 *   body: { email: string }
 */
export async function POST(request: Request) {
  await connectDB();
  const { email } = await request.json();
  if (!email)
    return NextResponse.json(
      { success: false, error: "Email is required" },
      { status: 401 },
    );

  const res = await sendVerificationEmail(email);

  const posthog = getPostHogClient();
  if (posthog) {
    posthog.capture({
      distinctId: email,
      event: "admin_magic_link_requested",
      properties: { valid: !!res },
    });
    await posthog.flush();
  }

  return NextResponse.json({ success: true, valid: res });
}
