import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb, initDb } from "@/lib/db";

export async function GET() {
  try {
    await initDb();
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const db = getDb();

    // Stats
    const usersRes = await db.execute(`SELECT role, status, count(*) as count FROM users GROUP BY role, status`);
    const adsRes = await db.execute(`SELECT status, count(*) as count, sum(cost) as totalCost, sum(viewsDelivered) as totalViews FROM ads GROUP BY status`);
    const withdrawalsRes = await db.execute(`SELECT status, count(*) as count, sum(amount) as totalAmount FROM withdrawals GROUP BY status`);
    const promosRes = await db.execute(`SELECT status, count(*) as count, sum(earnings) as totalEarnings FROM promotions GROUP BY status`);

    // List of pending creators
    const pendingCreators = await db.execute(`
      SELECT id, name, email, phone, facebookPageName, facebookPageUrl, facebookFollowers, categories, createdAt
      FROM users
      WHERE role = 'CREATOR' AND status = 'WAITING_APPROVAL'
      ORDER BY createdAt DESC
    `);

    // List of all creators
    const allCreators = await db.execute(`
      SELECT id, name, email, phone, status, balance, facebookPageName, facebookPageUrl, facebookFollowers, categories, createdAt
      FROM users
      WHERE role = 'CREATOR'
      ORDER BY createdAt DESC
    `);

    // List of pending ads
    const pendingAds = await db.execute(`
      SELECT a.*, u.name as advertiserName, u.email as advertiserEmail
      FROM ads a
      JOIN users u ON a.advertiserId = u.id
      WHERE a.status = 'PENDING_APPROVAL'
      ORDER BY a.createdAt DESC
    `);

    // List of all ads
    const allAds = await db.execute(`
      SELECT a.*, u.name as advertiserName, u.email as advertiserEmail
      FROM ads a
      JOIN users u ON a.advertiserId = u.id
      ORDER BY a.createdAt DESC
    `);

    // List of pending withdrawals
    const pendingWithdrawals = await db.execute(`
      SELECT w.*, u.name as creatorName, u.email as creatorEmail, u.facebookPageName
      FROM withdrawals w
      JOIN users u ON w.creatorId = u.id
      ORDER BY w.createdAt DESC
    `);

    return NextResponse.json({
      metrics: {
        users: usersRes.rows,
        ads: adsRes.rows,
        withdrawals: withdrawalsRes.rows,
        promotions: promosRes.rows,
      },
      pendingCreators: pendingCreators.rows,
      allCreators: allCreators.rows,
      pendingAds: pendingAds.rows,
      allAds: allAds.rows,
      pendingWithdrawals: pendingWithdrawals.rows,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load admin overview";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
