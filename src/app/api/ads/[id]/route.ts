import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const { action } = await req.json(); // "PAUSE" | "RESUME" | "STOP" | "APPROVE" | "REJECT"
    const db = getDb();
    const now = new Date().toISOString();

    const adRes = await db.execute({
      sql: "SELECT * FROM ads WHERE id = ?",
      args: [id],
    });

    if (adRes.rows.length === 0) {
      return NextResponse.json({ error: "Ad not found." }, { status: 404 });
    }

    const ad = adRes.rows[0];

    // Check ownership or admin
    const isOwner = ad.advertiserId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let newStatus = String(ad.status);

    if (action === "PAUSE" && (isOwner || isAdmin)) {
      newStatus = "PAUSED";
    } else if (action === "RESUME" && (isOwner || isAdmin)) {
      newStatus = "APPROVED";
    } else if (action === "STOP" && (isOwner || isAdmin)) {
      newStatus = "STOPPED";
    } else if (action === "APPROVE" && isAdmin) {
      newStatus = "APPROVED";
    } else if (action === "REJECT" && isAdmin) {
      newStatus = "REJECTED";
    }

    await db.execute({
      sql: "UPDATE ads SET status = ?, updatedAt = ? WHERE id = ?",
      args: [newStatus, now, id],
    });

    return NextResponse.json({
      success: true,
      status: newStatus,
      message: `Ad status updated to ${newStatus}.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update ad";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const db = getDb();

    const adRes = await db.execute({
      sql: "SELECT * FROM ads WHERE id = ?",
      args: [id],
    });

    if (adRes.rows.length === 0) {
      return NextResponse.json({ error: "Ad not found." }, { status: 404 });
    }

    const ad = adRes.rows[0];
    if (ad.advertiserId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete associated promotions first
    await db.execute({
      sql: "DELETE FROM promotions WHERE advertId = ?",
      args: [id],
    });

    await db.execute({
      sql: "DELETE FROM ads WHERE id = ?",
      args: [id],
    });

    return NextResponse.json({
      success: true,
      message: "Ad deleted successfully.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete ad";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
