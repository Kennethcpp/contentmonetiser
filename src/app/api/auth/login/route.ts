import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb, initDb } from "@/lib/db";
import { createSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const db = getDb();
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE email = ?",
      args: [email.toLowerCase().trim()],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const row = result.rows[0];
    const passwordValid = await bcrypt.compare(password, String(row.password));

    if (!passwordValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const userObj = {
      id: String(row.id),
      name: String(row.name),
      email: String(row.email),
      role: row.role as "ADVERTISER" | "CREATOR" | "ADMIN",
      status: String(row.status),
      balance: Number(row.balance || 0),
      facebookPageName: row.facebookPageName ? String(row.facebookPageName) : null,
      facebookPageUrl: row.facebookPageUrl ? String(row.facebookPageUrl) : null,
      facebookFollowers: row.facebookFollowers ? Number(row.facebookFollowers) : null,
    };

    const token = await createSessionToken(userObj);

    const response = NextResponse.json({
      success: true,
      user: userObj,
    });

    response.cookies.set("cm_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
