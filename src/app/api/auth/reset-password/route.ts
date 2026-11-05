import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { consumeAuthToken } from "@/lib/auth-tokens";
import { getDb, initDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || typeof token !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Reset token and password are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
    }

    const userId = await consumeAuthToken(token, "PASSWORD_RESET");
    if (!userId) {
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    }

    await initDb();
    const passwordHash = await bcrypt.hash(password, 12);
    await getDb().execute({
      sql: "UPDATE users SET password = ?, emailVerified = 1, updatedAt = ? WHERE id = ?",
      args: [passwordHash, new Date().toISOString(), userId],
    });
    return NextResponse.json({ success: true, message: "Password reset successfully. You can now sign in." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Password reset failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
