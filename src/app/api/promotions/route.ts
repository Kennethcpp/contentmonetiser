import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb, initDb } from "@/lib/db";

export async function GET() {
  try {
    await initDb();
    const user = await getCurrentUser();
    if (!user || user.role !== "CREATOR") {
      return NextResponse.json(
        { error: "Only creators can access promotions." },
        { status: 403 }
      );
    }

    const db = getDb();
    const result = await db.execute({
      sql: `
        SELECT p.*, a.title as adTitle, a.description as adDescription, a.category as adCategory, 
               a.cost as adCost, a.expectedViews as adExpectedViews, a.placements as adPlacements,
               a.ctaType as adCtaType, a.ctaValue as adCtaValue, a.flyerUrl as adFlyerUrl
        FROM promotions p
        JOIN ads a ON p.advertId = a.id
        WHERE p.creatorId = ?
        ORDER BY p.startedAt DESC
      `,
      args: [user.id],
    });

    const activePromotion = result.rows.find(
      (r) => r.status === "IN_PROGRESS" || r.status === "SUBMITTED"
    );

    return NextResponse.json({
      promotions: result.rows,
      activePromotion: activePromotion || null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch promotions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const user = await getCurrentUser();
    if (!user || user.role !== "CREATOR") {
      return NextResponse.json(
        { error: "Only creators can take up promotions." },
        { status: 403 }
      );
    }

    if (user.status !== "APPROVED") {
      return NextResponse.json(
        {
          error:
            "Your account is waiting approval. Once approved, you can start promoting ads.",
        },
        { status: 403 }
      );
    }

    const { advertId } = await req.json();
    if (!advertId) {
      return NextResponse.json({ error: "Advert ID is required." }, { status: 400 });
    }

    const db = getDb();

    // Check if creator ALREADY has an active promotion!
    // SPEC RULE: "Creators can only promote one ad per time, existing promotion must end before starting a new one."
    const activeCheck = await db.execute({
      sql: `SELECT id FROM promotions WHERE creatorId = ? AND (status = 'IN_PROGRESS' OR status = 'SUBMITTED')`,
      args: [user.id],
    });

    if (activeCheck.rows.length > 0) {
      return NextResponse.json(
        {
          error:
            "You already have an active ad promotion in progress. You must complete or end your current promotion before starting a new one.",
        },
        { status: 400 }
      );
    }

    // Verify ad exists and is APPROVED
    const adRes = await db.execute({
      sql: `SELECT * FROM ads WHERE id = ?`,
      args: [advertId],
    });

    if (adRes.rows.length === 0) {
      return NextResponse.json({ error: "Ad not found." }, { status: 404 });
    }

    const ad = adRes.rows[0];
    if (ad.status !== "APPROVED") {
      return NextResponse.json(
        { error: "This advertisement is no longer available for promotion." },
        { status: 400 }
      );
    }

    const promoId = `promo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO promotions (id, creatorId, advertId, status, postUrl, viewsContributed, earnings, startedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [promoId, user.id, advertId, "IN_PROGRESS", null, 0, 0, now],
    });

    return NextResponse.json({
      success: true,
      promoId,
      message: "Promotion started! Review the brief and post the ad on your Facebook page.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to accept ad";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await initDb();
    const user = await getCurrentUser();
    if (!user || user.role !== "CREATOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { promoId, postUrl, action, deliveredViews } = await req.json();
    const db = getDb();
    const now = new Date().toISOString();

    const promoRes = await db.execute({
      sql: `SELECT p.*, a.cost, a.expectedViews FROM promotions p JOIN ads a ON p.advertId = a.id WHERE p.id = ? AND p.creatorId = ?`,
      args: [promoId, user.id],
    });

    if (promoRes.rows.length === 0) {
      return NextResponse.json({ error: "Promotion not found." }, { status: 404 });
    }

    const promo = promoRes.rows[0];

    if (action === "SUBMIT_LINK") {
      if (!postUrl || !postUrl.includes("facebook.com")) {
        return NextResponse.json(
          { error: "Please enter a valid Facebook post URL as proof of promotion." },
          { status: 400 }
        );
      }

      await db.execute({
        sql: `UPDATE promotions SET postUrl = ?, status = 'SUBMITTED' WHERE id = ?`,
        args: [postUrl, promoId],
      });

      return NextResponse.json({
        success: true,
        message: "Proof submitted! System will track your post engagement and views.",
      });
    }

    if (action === "COMPLETE") {
      // Calculate earnings: ₦5 per 1,000 views or payout proportion
      const views = Number(deliveredViews) || Math.min(Number(promo.expectedViews), 15000);
      const earnedAmount = Number(((views / 1000) * 4.5).toFixed(2)); // Creator gets 90% share = ₦4.50 per 1k views

      await db.execute({
        sql: `UPDATE promotions SET status = 'COMPLETED', viewsContributed = ?, earnings = ?, completedAt = ? WHERE id = ?`,
        args: [views, earnedAmount, now, promoId],
      });

      // Update ad delivered views count
      await db.execute({
        sql: `UPDATE ads SET viewsDelivered = viewsDelivered + ? WHERE id = ?`,
        args: [views, promo.advertId],
      });

      // Credit Creator Balance
      await db.execute({
        sql: `UPDATE users SET balance = balance + ?, updatedAt = ? WHERE id = ?`,
        args: [earnedAmount, now, user.id],
      });

      // Record transaction
      const txnId = `txn_${Date.now()}`;
      await db.execute({
        sql: `INSERT INTO transactions (id, userId, type, amount, reference, status, description, createdAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          txnId,
          user.id,
          "CREATOR_PAYOUT",
          earnedAmount,
          `EARN-${promoId}`,
          "COMPLETED",
          `Earnings for ad promotion (${views.toLocaleString()} views)`,
          now,
        ],
      });

      return NextResponse.json({
        success: true,
        earnings: earnedAmount,
        views,
        message: `Promotion completed! ₦${earnedAmount.toLocaleString()} credited to your balance.`,
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update promotion";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
