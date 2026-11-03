import { createClient, Client } from "@libsql/client";
import path from "path";
import fs from "fs";

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

// Initialize tables and default seed data
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

  // Seed default admin and sample users if not present
  const adminCheck = await db.execute({
    sql: "SELECT id FROM users WHERE email = ?",
    args: ["admin@contentmonetiser.io"],
  });

  if (adminCheck.rows.length === 0) {
    const now = new Date().toISOString();
    // Default admin
    await db.execute({
      sql: `INSERT INTO users (id, name, email, phone, password, role, status, balance, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        "usr_admin_1",
        "ContentMonetizer Admin",
        "admin@contentmonetiser.io",
        "+2348012345678",
        "$2a$10$wT3R2uO3EhyuXWw3M6Pmeexs9i3.Kj.eR4d7gJ2gX5vV8nE0yP16.", // "Admin123!"
        "ADMIN",
        "APPROVED",
        0,
        now,
        now,
      ],
    });

    // Sample Advertiser
    await db.execute({
      sql: `INSERT INTO users (id, name, email, phone, password, role, status, balance, categories, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        "usr_adv_1",
        "Tunde Adeyemi (TechZone NG)",
        "advertiser@techbrand.ng",
        "+2348098765432",
        "$2a$10$wT3R2uO3EhyuXWw3M6Pmeexs9i3.Kj.eR4d7gJ2gX5vV8nE0yP16.",
        "ADVERTISER",
        "APPROVED",
        25000,
        JSON.stringify(["Tech & Gadgets", "E-commerce & Retail"]),
        now,
        now,
      ],
    });

    // Sample Approved Creator
    await db.execute({
      sql: `INSERT INTO users (id, name, email, phone, password, role, status, balance, facebookPageName, facebookPageUrl, facebookFollowers, categories, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        "usr_creator_1",
        "Chinedu Okafor",
        "creator@lagosbuzz.tv",
        "+2348123456789",
        "$2a$10$wT3R2uO3EhyuXWw3M6Pmeexs9i3.Kj.eR4d7gJ2gX5vV8nE0yP16.",
        "CREATOR",
        "APPROVED",
        18500,
        "Lagos Buzz TV",
        "https://facebook.com/lagosbuzztv",
        34500,
        JSON.stringify(["Entertainment", "Tech & Gadgets", "Comedy & Skits"]),
        now,
        now,
      ],
    });

    // Sample Pending Creator
    await db.execute({
      sql: `INSERT INTO users (id, name, email, phone, password, role, status, balance, facebookPageName, facebookPageUrl, facebookFollowers, categories, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        "usr_creator_2",
        "Amina Bello",
        "amina@afrostyledaily.com",
        "+2348145556677",
        "$2a$10$wT3R2uO3EhyuXWw3M6Pmeexs9i3.Kj.eR4d7gJ2gX5vV8nE0yP16.",
        "CREATOR",
        "WAITING_APPROVAL",
        0,
        "AfroStyle Daily",
        "https://facebook.com/afrostyledaily",
        12200,
        JSON.stringify(["Fashion & Beauty", "Lifestyle"]),
        now,
        now,
      ],
    });

    // Seed Sample Ads
    // 1. Approved Active Ad (Visible to creators!)
    await db.execute({
      sql: `INSERT INTO ads (id, advertiserId, title, description, category, expectedViews, cost, placements, ctaType, ctaValue, flyerUrl, status, viewsDelivered, paid, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        "ad_sample_1",
        "usr_adv_1",
        "Wireless Earbuds Pro - 40% Black Friday Discount",
        "Promote our ultra noise-cancelling earbuds. Show the product or announce the special 40% discount with free nationwide delivery in Nigeria. Mention the link in caption or pin comment.",
        "Tech & Gadgets",
        100000,
        500.0, // 100,000 / 1000 * 5 = 500 Naira
        JSON.stringify(["STARTING", "MIDDLE"]),
        "WEBSITE",
        "https://techzoneng.com/earbuds-promo",
        "/images/07-marketing-promo-banner.png",
        "APPROVED",
        32400,
        1,
        now,
        now,
      ],
    });

    // 2. Pending Approval Ad (Visible in Admin for approval)
    await db.execute({
      sql: `INSERT INTO ads (id, advertiserId, title, description, category, expectedViews, cost, placements, ctaType, ctaValue, flyerUrl, status, viewsDelivered, paid, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        "ad_sample_2",
        "usr_adv_1",
        "FastTrack Learn Web Development - Bootcamp Intake",
        "3-month hands-on coding bootcamp. Beginners welcome. Job placement assistance. Creator should mention starting date and WhatsApp admission line.",
        "Education & Career",
        50000,
        250.0,
        JSON.stringify(["MIDDLE", "ENDING"]),
        "PHONE",
        "+2348099887766",
        "/images/04-advertiser-creator-promo-panel.png",
        "PENDING_APPROVAL",
        0,
        1,
        now,
        now,
      ],
    });

    // Seed Sample Deposit Transaction
    await db.execute({
      sql: `INSERT INTO transactions (id, userId, type, amount, reference, status, description, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        "txn_sample_1",
        "usr_adv_1",
        "DEPOSIT",
        30000,
        "DEP-TECHZONE-9812",
        "COMPLETED",
        "Wallet top-up via Paystack",
        now,
      ],
    });
  }

  initialized = true;
}
