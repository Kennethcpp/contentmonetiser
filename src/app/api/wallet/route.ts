import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb, initDb } from "@/lib/db";

export async function GET() {
  try {
    await initDb();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();

    // Get user transactions
    const txns = await db.execute({
      sql: `SELECT * FROM transactions WHERE userId = ? ORDER BY createdAt DESC`,
      args: [user.id],
    });

    // If creator, get withdrawal requests
    let withdrawals: unknown[] = [];
    if (user.role === "CREATOR") {
      const wRes = await db.execute({
        sql: `SELECT * FROM withdrawals WHERE creatorId = ? ORDER BY createdAt DESC`,
        args: [user.id],
      });
      withdrawals = wRes.rows;
    }

    return NextResponse.json({
      balance: user.balance,
      transactions: txns.rows,
      withdrawals,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load wallet data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, amount, bankName, accountNumber, accountName } = body;
    const db = getDb();
    const now = new Date().toISOString();

    // Action 1: DEPOSIT (available for Advertisers)
    if (action === "DEPOSIT") {
      const depositAmount = Number(amount);
      if (isNaN(depositAmount) || depositAmount < 500) {
        return NextResponse.json(
          { error: "Minimum deposit amount is ₦500." },
          { status: 400 }
        );
      }

      await db.execute({
        sql: `UPDATE users SET balance = balance + ?, updatedAt = ? WHERE id = ?`,
        args: [depositAmount, now, user.id],
      });

      const ref = `DEP-${Date.now()}`;
      await db.execute({
        sql: `INSERT INTO transactions (id, userId, type, amount, reference, status, description, createdAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          `txn_${Date.now()}`,
          user.id,
          "DEPOSIT",
          depositAmount,
          ref,
          "COMPLETED",
          "Wallet Deposit via Automated Transfer/Card",
          now,
        ],
      });

      return NextResponse.json({
        success: true,
        message: `Successfully deposited ₦${depositAmount.toLocaleString()} to your wallet!`,
        newBalance: user.balance + depositAmount,
      });
    }

    // Action 2: WITHDRAWAL (for Creators)
    if (action === "WITHDRAW") {
      if (user.role !== "CREATOR") {
        return NextResponse.json(
          { error: "Only creators can request withdrawals." },
          { status: 403 }
        );
      }

      const withdrawAmount = Number(amount);
      if (isNaN(withdrawAmount) || withdrawAmount < 1000) {
        return NextResponse.json(
          { error: "Minimum withdrawal amount is ₦1,000." },
          { status: 400 }
        );
      }

      if (withdrawAmount > user.balance) {
        return NextResponse.json(
          {
            error: `Insufficient balance. Available: ₦${user.balance.toLocaleString()}`,
          },
          { status: 400 }
        );
      }

      if (!bankName || !accountNumber || !accountName) {
        return NextResponse.json(
          { error: "Bank name, account number, and account name are required." },
          { status: 400 }
        );
      }

      // Deduct creator balance
      await db.execute({
        sql: `UPDATE users SET balance = balance - ?, updatedAt = ? WHERE id = ?`,
        args: [withdrawAmount, now, user.id],
      });

      const wId = `wth_${Date.now()}`;
      await db.execute({
        sql: `INSERT INTO withdrawals (id, creatorId, amount, bankName, accountNumber, accountName, status, createdAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          wId,
          user.id,
          withdrawAmount,
          bankName,
          accountNumber,
          accountName,
          "PENDING",
          now,
        ],
      });

      // Record transaction
      await db.execute({
        sql: `INSERT INTO transactions (id, userId, type, amount, reference, status, description, createdAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          `txn_${Date.now()}`,
          user.id,
          "WITHDRAWAL",
          withdrawAmount,
          `WTH-${wId}`,
          "PENDING",
          `Withdrawal to ${bankName} (${accountNumber})`,
          now,
        ],
      });

      return NextResponse.json({
        success: true,
        message: `Withdrawal request for ₦${withdrawAmount.toLocaleString()} submitted. Processed within 24 hours.`,
        newBalance: user.balance - withdrawAmount,
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Wallet action failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
