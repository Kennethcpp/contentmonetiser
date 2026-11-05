import { NextRequest, NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";
import { issueAuthToken } from "@/lib/auth-tokens";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const { email } = await req.json();
    const normalizedEmail = typeof email === "string" ? email.toLowerCase().trim() : "";
    if (!normalizedEmail) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    const result = await getDb().execute({
      sql: "SELECT id, name FROM users WHERE email = ?",
      args: [normalizedEmail],
    });
    const row = result.rows[0];
    if (row) {
      const token = await issueAuthToken(String(row.id), "PASSWORD_RESET", 60 * 60 * 1000);
      await sendPasswordResetEmail(normalizedEmail, String(row.name), token);
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists for that email, a password reset link has been sent.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Password reset request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
