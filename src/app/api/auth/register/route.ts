import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb, initDb } from "@/lib/db";
import { verifyFacebookPage } from "@/lib/facebook";
import { issueAuthToken } from "@/lib/auth-tokens";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const body = await req.json();
    const {
      name,
      email,
      phone,
      password,
      role, // "ADVERTISER" | "CREATOR"
      facebookPageInput,
      categories,
    } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required." },
        { status: 400 }
      );
    }

    const db = getDb();
    const existing = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [email.toLowerCase().trim()],
    });

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    if (role !== "ADVERTISER" && role !== "CREATOR") {
      return NextResponse.json({ error: "Invalid account type." }, { status: 400 });
    }

    if (String(password).length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    let userStatus = "APPROVED";
    let fbPageName = null;
    let fbPageUrl = null;
    let fbFollowers = 0;

    if (role === "CREATOR") {
      if (!facebookPageInput) {
        return NextResponse.json(
          { error: "Facebook page name or URL is required for creators." },
          { status: 400 }
        );
      }

      const fbCheck = await verifyFacebookPage(facebookPageInput);
      if (!fbCheck.eligible) {
        return NextResponse.json(
          {
            error:
              fbCheck.errorMessage ||
              "Your Facebook page must have at least 5,000 followers to qualify.",
          },
          { status: 400 }
        );
      }

      fbPageName = fbCheck.pageName;
      fbPageUrl = fbCheck.pageUrl;
      fbFollowers = fbCheck.followerCount;
      userStatus = "WAITING_APPROVAL";
    }

    await db.execute({
      sql: `INSERT INTO users (id, name, email, phone, password, role, status, balance, facebookPageName, facebookPageUrl, facebookFollowers, categories, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        userId,
        name,
        email.toLowerCase().trim(),
        phone || null,
        hashedPassword,
        role,
        userStatus,
        0,
        fbPageName,
        fbPageUrl,
        fbFollowers,
        categories ? JSON.stringify(categories) : null,
        now,
        now,
      ],
    });

    try {
      const verificationToken = await issueAuthToken(
        userId,
        "EMAIL_VERIFICATION",
        24 * 60 * 60 * 1000
      );
      await sendVerificationEmail(email.toLowerCase().trim(), name, verificationToken);
    } catch (emailError) {
      await db.execute({ sql: "DELETE FROM auth_tokens WHERE userId = ?", args: [userId] });
      await db.execute({ sql: "DELETE FROM users WHERE id = ?", args: [userId] });
      throw emailError;
    }

    return NextResponse.json({
      success: true,
      message: "Account created. Check your email to verify your address before signing in.",
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
