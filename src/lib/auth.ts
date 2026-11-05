import { cookies } from "next/headers";
import crypto from "crypto";
import { getDb, initDb } from "./db";

const SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production" ? "" : "cm_local_development_secret");

function getSecret(): string {
  if (!SECRET) {
    throw new Error("JWT_SECRET must be configured in production.");
  }
  return SECRET;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "ADVERTISER" | "CREATOR" | "ADMIN";
  status: string;
  balance: number;
  facebookPageName?: string | null;
  facebookPageUrl?: string | null;
  facebookFollowers?: number | null;
}

// Zero-dependency secure HMAC-SHA256 Token
export async function createSessionToken(user: SessionUser): Promise<string> {
  const payload = JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });

  const encodedPayload = Buffer.from(payload).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [encodedPayload, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", getSecret())
      .update(encodedPayload)
      .digest("base64url");

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSig);
    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }

    const json = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf-8"));
    if (json.exp && json.exp < Date.now()) return null;

    return json as SessionUser;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  await initDb();
  const cookieStore = await cookies();
  const token = cookieStore.get("cm_session")?.value;

  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session?.id) return null;

  const db = getDb();
  const result = await db.execute({
    sql: "SELECT id, name, email, role, status, balance, facebookPageName, facebookPageUrl, facebookFollowers FROM users WHERE id = ?",
    args: [session.id],
  });

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    role: row.role as "ADVERTISER" | "CREATOR" | "ADMIN",
    status: String(row.status),
    balance: Number(row.balance || 0),
    facebookPageName: row.facebookPageName ? String(row.facebookPageName) : null,
    facebookPageUrl: row.facebookPageUrl ? String(row.facebookPageUrl) : null,
    facebookFollowers: row.facebookFollowers ? Number(row.facebookFollowers) : null,
  };
}
