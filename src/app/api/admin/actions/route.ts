import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb, initDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { action, targetId } = await req.json();
    const db = getDb();
    const now = new Date().toISOString();

    // 1. Creator Approval / Rejection
    if (action === "APPROVE_CREATOR") {
      await db.execute({
        sql: `UPDATE users SET status = 'APPROVED', updatedAt = ? WHERE id = ?`,
        args: [now, targetId],
      });
      return NextResponse.json({
        success: true,
        message: "Creator application approved! The creator now has full marketplace access.",
      });
    }

    if (action === "REJECT_CREATOR") {
      await db.execute({
        sql: `UPDATE users SET status = 'REJECTED', updatedAt = ? WHERE id = ?`,
        args: [now, targetId],
      });
      return NextResponse.json({
        success: true,
        message: "Creator application rejected.",
      });
    }

    // 2. Ad Approval / Rejection
    if (action === "APPROVE_AD") {
      await db.execute({
        sql: `UPDATE ads SET status = 'APPROVED', updatedAt = ? WHERE id = ?`,
        args: [now, targetId],
      });
      return NextResponse.json({
        success: true,
        message: "Advertisement approved! It is now live in the creators' dashboard.",
      });
    }

    if (action === "REJECT_AD") {
      await db.execute({
        sql: `UPDATE ads SET status = 'REJECTED', updatedAt = ? WHERE id = ?`,
        args: [now, targetId],
      });
      return NextResponse.json({
        success: true,
        message: "Advertisement rejected.",
      });
    }

    // 3. Withdrawal Processing
    if (action === "APPROVE_WITHDRAWAL") {
      await db.execute({
        sql: `UPDATE withdrawals SET status = 'PAID', processedAt = ? WHERE id = ?`,
        args: [now, targetId],
      });

      // Update corresponding transaction
      await db.execute({
        sql: `UPDATE transactions SET status = 'COMPLETED' WHERE reference = ?`,
        args: [`WTH-${targetId}`],
      });

      return NextResponse.json({
        success: true,
        message: "Withdrawal marked as paid successfully.",
      });
    }

    if (action === "REJECT_WITHDRAWAL") {
      // Find amount to refund
      const wRes = await db.execute({
        sql: `SELECT creatorId, amount FROM withdrawals WHERE id = ?`,
        args: [targetId],
      });
      if (wRes.rows.length > 0) {
        const row = wRes.rows[0];
        // Refund creator balance
        await db.execute({
          sql: `UPDATE users SET balance = balance + ?, updatedAt = ? WHERE id = ?`,
          args: [row.amount, now, row.creatorId],
        });
        await db.execute({
          sql: `UPDATE withdrawals SET status = 'REJECTED', processedAt = ? WHERE id = ?`,
          args: [now, targetId],
        });
      }
      return NextResponse.json({
        success: true,
        message: "Withdrawal rejected and creator balance refunded.",
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Admin action failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
