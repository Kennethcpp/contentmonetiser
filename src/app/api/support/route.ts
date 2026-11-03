import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb, initDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, message } = await req.json();
    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required." },
        { status: 400 }
      );
    }

    const db = getDb();
    const ticketId = `tkt_${Date.now()}`;
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO support_tickets (id, userId, subject, message, status, createdAt)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [ticketId, user.id, subject, message, "OPEN", now],
    });

    return NextResponse.json({
      success: true,
      message: "Support ticket submitted! Our operations team will respond promptly.",
      ticketId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send ticket";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
