import { createClient, Client } from "@libsql/client";
import path from "path";

// Initialize client: local SQLite file by default, or DATABASE_URL if configured
const dbPath = path.resolve(process.cwd(), "contentmonetiser.db");
const dbUrl = process.env.DATABASE_URL || `file:${dbPath}`;

let clientInstance: Client | null = null;

export function getDb(): Client {
  if (!clientInstance) {
    clientInstance = createClient({
      url: dbUrl,
    });
  }
  return clientInstance;
}

// Initialize tables
let initialized = false;

export async function initDb(): Promise<void> {
  if (initialized) return;

  const db = getDb();

  // Users table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      emailVerified INTEGER DEFAULT 0,
      phone TEXT,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL,
      balance REAL DEFAULT 0,
      facebookPageName TEXT,
      facebookPageUrl TEXT,
      facebookFollowers INTEGER DEFAULT 0,
      categories TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS auth_tokens (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      tokenHash TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      usedAt TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Keep existing local databases compatible with the production schema.
  const userColumns = await db.execute("PRAGMA table_info(users)");
  if (!userColumns.rows.some((column) => String(column.name) === "emailVerified")) {
    await db.execute("ALTER TABLE users ADD COLUMN emailVerified INTEGER DEFAULT 0");
  }

  // Ads table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ads (
      id TEXT PRIMARY KEY,
      advertiserId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      expectedViews INTEGER NOT NULL,
      cost REAL NOT NULL,
      placements TEXT NOT NULL,
      ctaType TEXT NOT NULL,
      ctaValue TEXT NOT NULL,
      flyerUrl TEXT,
      status TEXT NOT NULL,
      viewsDelivered INTEGER DEFAULT 0,
      paid INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (advertiserId) REFERENCES users(id)
    )
  `);

  // Promotions table (Creator promoting an ad)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS promotions (
      id TEXT PRIMARY KEY,
      creatorId TEXT NOT NULL,
      advertId TEXT NOT NULL,
      status TEXT NOT NULL,
      postUrl TEXT,
      viewsContributed INTEGER DEFAULT 0,
      earnings REAL DEFAULT 0,
      startedAt TEXT NOT NULL,
      completedAt TEXT,
      FOREIGN KEY (creatorId) REFERENCES users(id),
      FOREIGN KEY (advertId) REFERENCES ads(id)
    )
  `);

  // Transactions table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      reference TEXT NOT NULL,
      status TEXT NOT NULL,
      description TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Withdrawals table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS withdrawals (
      id TEXT PRIMARY KEY,
      creatorId TEXT NOT NULL,
      amount REAL NOT NULL,
      bankName TEXT NOT NULL,
      accountNumber TEXT NOT NULL,
      accountName TEXT NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      processedAt TEXT,
      FOREIGN KEY (creatorId) REFERENCES users(id)
    )
  `);

  // Support tickets table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL,
      reply TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  initialized = true;
}
