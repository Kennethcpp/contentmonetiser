import mysql, { Pool, RowDataPacket } from "mysql2/promise";

type SqlValue = string | number | boolean | bigint | Date | Buffer | Uint8Array | null;
type Query = string | { sql: string; args?: SqlValue[] };

export interface DatabaseResult {
  rows: RowDataPacket[];
}

let pool: Pool | null = null;

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required database configuration: ${name}`);
  }
  return value;
}

export function getDb(): Database {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || "127.0.0.1",
      port: Number(process.env.MYSQL_PORT || 3306),
      database: requiredEnv("MYSQL_DATABASE"),
      user: requiredEnv("MYSQL_USER"),
      password: process.env.MYSQL_PASSWORD || "",
      waitForConnections: true,
      connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
      maxIdle: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
      idleTimeout: 60000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }
  return new Database(pool);
}

class Database {
  constructor(private readonly pool: Pool) {}

  async execute(query: Query): Promise<DatabaseResult> {
    const sql = typeof query === "string" ? query : query.sql;
    const args = typeof query === "string" ? [] : query.args || [];
    const [result] = await this.pool.execute(sql, args);
    return {
      rows: Array.isArray(result)
        ? (result as RowDataPacket[]).map((row) => normalizeRow(row))
        : [],
    };
  }
}

function normalizeRow(row: RowDataPacket): RowDataPacket {
  for (const key of ["categories", "placements", "adPlacements"]) {
    const value = row[key];
    if (value !== null && typeof value === "object") {
      row[key] = JSON.stringify(value);
    }
  }
  return row;
}

let initialized = false;

export async function initDb(): Promise<void> {
  if (initialized) return;

  const db = getDb();
  const result = await db.execute({
    sql: `SELECT COUNT(*) AS tableCount
          FROM information_schema.tables
          WHERE table_schema = ? AND table_name IN
            ('users', 'auth_tokens', 'ads', 'promotions', 'transactions', 'withdrawals', 'support_tickets')`,
    args: [requiredEnv("MYSQL_DATABASE")],
  });
  const tableCount = Number(result.rows[0]?.tableCount || 0);

  if (tableCount !== 7) {
    throw new Error(
      "The MySQL schema is incomplete. Import database/contentmonetiser.sql into the configured database."
    );
  }

  initialized = true;
}
