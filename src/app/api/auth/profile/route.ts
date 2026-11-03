import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, currentPassword, newPassword } = await req.json();
    const db = getDb();
    const now = new Date().toISOString();

    // If updating password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to set a new password." },
          { status: 400 }
        );
      }

      const rowRes = await db.execute({
        sql: "SELECT password FROM users WHERE id = ?",
        args: [user.id],
      });
      if (rowRes.rows.length === 0) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }

      const valid = await bcrypt.compare(
        currentPassword,
        String(rowRes.rows[0].password)
      );
      if (!valid) {
        return NextResponse.json(
          { error: "Incorrect current password." },
          { status: 400 }
        );
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await db.execute({
        sql: "UPDATE users SET password = ?, updatedAt = ? WHERE id = ?",
        args: [hashed, now, user.id],
      });
    }

    if (name || phone !== undefined) {
      await db.execute({
        sql: "UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), updatedAt = ? WHERE id = ?",
        args: [name || null, phone || null, now, user.id],
      });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Profile update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
