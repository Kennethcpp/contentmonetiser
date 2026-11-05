import { NextRequest, NextResponse } from "next/server";
import { consumeAuthToken } from "@/lib/auth-tokens";
import { getDb, initDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Verification token is required." }, { status: 400 });
    }

    const userId = await consumeAuthToken(token, "EMAIL_VERIFICATION");
    if (!userId) {
      return NextResponse.json({ error: "This verification link is invalid or has expired." }, { status: 400 });
    }

    await initDb();
    await getDb().execute({
      sql: "UPDATE users SET emailVerified = 1, updatedAt = ? WHERE id = ?",
      args: [new Date().toISOString(), userId],
    });
    return NextResponse.json({ success: true, message: "Email verified. You can now sign in." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
