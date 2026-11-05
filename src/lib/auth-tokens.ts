import crypto from "crypto";
import { getDb, initDb } from "./db";

export type AuthTokenType = "EMAIL_VERIFICATION" | "PASSWORD_RESET";

export function createRawToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function issueAuthToken(
  userId: string,
  type: AuthTokenType,
  lifetimeMs: number
): Promise<string> {
  await initDb();
  const db = getDb();
  const rawToken = createRawToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + lifetimeMs).toISOString();

  await db.execute({
    sql: "UPDATE auth_tokens SET usedAt = ? WHERE userId = ? AND type = ? AND usedAt IS NULL",
    args: [now.toISOString(), userId, type],
  });
  await db.execute({
    sql: `INSERT INTO auth_tokens (id, userId, tokenHash, type, expiresAt, createdAt)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      `auth_${crypto.randomUUID()}`,
      userId,
      hashToken(rawToken),
      type,
      expiresAt,
      now.toISOString(),
    ],
  });
  return rawToken;
}

export async function consumeAuthToken(token: string, type: AuthTokenType) {
  await initDb();
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT id, userId FROM auth_tokens
          WHERE tokenHash = ? AND type = ? AND usedAt IS NULL AND expiresAt > ?`,
    args: [hashToken(token), type, new Date().toISOString()],
  });
  const row = result.rows[0];
  if (!row) return null;

  await db.execute({
    sql: "UPDATE auth_tokens SET usedAt = ? WHERE id = ? AND usedAt IS NULL",
    args: [new Date().toISOString(), row.id],
  });
  return String(row.userId);
}
