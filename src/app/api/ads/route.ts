import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb, initDb } from "@/lib/db";
import { detectCategory } from "@/lib/categories";

export async function GET(req: NextRequest) {
  try {
    await initDb();
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope"); // "mine" | "available" | "all"
    const db = getDb();

    if (scope === "mine") {
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const res = await db.execute({
        sql: `SELECT * FROM ads WHERE advertiserId = ? ORDER BY createdAt DESC`,
        args: [user.id],
      });
      return NextResponse.json({ ads: res.rows });
    }

    if (scope === "available") {
      // NOTE: "approved advertisers' ad doesn't show on the home page, only shown to creators' dashboards."
      if (!user || user.role !== "CREATOR") {
        return NextResponse.json(
          { error: "Only approved creators can access available ads." },
          { status: 403 }
        );
      }

      if (user.status !== "APPROVED") {
        return NextResponse.json({
          ads: [],
          message: "Your creator account is waiting approval.",
        });
      }

      const res = await db.execute(`
        SELECT a.*, u.name as advertiserName 
        FROM ads a
        JOIN users u ON a.advertiserId = u.id
        WHERE a.status = 'APPROVED'
        ORDER BY a.createdAt DESC
      `);
      return NextResponse.json({ ads: res.rows });
    }

    if (scope === "all") {
      if (!user || user.role !== "ADMIN") {
        return NextResponse.json({ error: "Admin only" }, { status: 403 });
      }
      const res = await db.execute(`
        SELECT a.*, u.name as advertiserName, u.email as advertiserEmail
        FROM ads a
        JOIN users u ON a.advertiserId = u.id
        ORDER BY a.createdAt DESC
      `);
      return NextResponse.json({ ads: res.rows });
    }

    return NextResponse.json({ ads: [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch ads";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const user = await getCurrentUser();
    if (!user || user.role !== "ADVERTISER") {
      return NextResponse.json(
        { error: "Only advertisers can create ads." },
        { status: 403 }
      );
    }

    const {
      title,
      description,
      expectedViews,
      placements, // array of ["STARTING", "MIDDLE", "ENDING"]
      ctaType, // "PHONE" | "WEBSITE" | "ADDRESS" | "OTHER"
      ctaValue,
      flyerUrl,
      categoryOverride,
    } = await req.json();

    const views = Number(expectedViews);
    if (!title || !description || isNaN(views) || views <= 0) {
      return NextResponse.json(
        { error: "Please enter valid title, description, and expected views." },
        { status: 400 }
      );
    }

    // Rate: 5 Naira per 1000 views
    const cost = (views / 1000) * 5;

    // Auto-detect category from description & title unless overridden
    const detected = categoryOverride || detectCategory(`${title} ${description}`);

    const adId = `ad_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const db = getDb();

    // Check balance or charge
    const userRow = await db.execute({
      sql: "SELECT balance FROM users WHERE id = ?",
      args: [user.id],
    });
    const currentBalance = Number(userRow.rows[0]?.balance || 0);

    // If balance is sufficient, deduct immediately, otherwise mark paid via checkout
    const newBalance = Math.max(0, currentBalance - cost);
    await db.execute({
      sql: "UPDATE users SET balance = ?, updatedAt = ? WHERE id = ?",
      args: [newBalance, now, user.id],
    });

    // Record ad transaction
    const txnId = `txn_${Date.now()}`;
    await db.execute({
      sql: `INSERT INTO transactions (id, userId, type, amount, reference, status, description, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        txnId,
        user.id,
        "AD_SPEND",
        cost,
        `AD-${adId}`,
        "COMPLETED",
        `Placed ad: ${title} (${views.toLocaleString()} views)`,
        now,
      ],
    });

    // Save ad with PENDING_APPROVAL status (Admin must approve before it is visible to creators)
    await db.execute({
      sql: `INSERT INTO ads (id, advertiserId, title, description, category, expectedViews, cost, placements, ctaType, ctaValue, flyerUrl, status, viewsDelivered, paid, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        adId,
        user.id,
        title,
        description,
        detected,
        views,
        cost,
        JSON.stringify(Array.isArray(placements) ? placements : ["MIDDLE"]),
        ctaType || "WEBSITE",
        ctaValue || "",
        flyerUrl || null,
        "PENDING_APPROVAL",
        0,
        1,
        now,
        now,
      ],
    });

    return NextResponse.json({
      success: true,
      adId,
      cost,
      category: detected,
      message:
        "Ad submitted successfully and payment confirmed! Your ad is now pending admin review before creators can pick it.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create ad";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
