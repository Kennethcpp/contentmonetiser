-- ContentMonetizer standalone MySQL schema
-- Compatible with MySQL 8.0+ and MariaDB 10.6+ (XAMPP/phpMyAdmin).
-- This file creates structure only. It does not insert demo or seed data.

CREATE DATABASE IF NOT EXISTS contentmonetiser
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE contentmonetiser;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS support_tickets;
DROP TABLE IF EXISTS withdrawals;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS promotions;
DROP TABLE IF EXISTS ads;
DROP TABLE IF EXISTS auth_tokens;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id VARCHAR(100) NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(254) NOT NULL,
  emailVerified TINYINT(1) NOT NULL DEFAULT 0,
  phone VARCHAR(30) NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADVERTISER', 'CREATOR', 'ADMIN') NOT NULL,
  status VARCHAR(40) NOT NULL,
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  facebookPageName VARCHAR(255) NULL,
  facebookPageUrl VARCHAR(500) NULL,
  facebookFollowers INT UNSIGNED NOT NULL DEFAULT 0,
  categories JSON NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role_status (role, status),
  KEY idx_users_created_at (createdAt)
) ENGINE=InnoDB;

CREATE TABLE auth_tokens (
  id VARCHAR(100) NOT NULL,
  userId VARCHAR(100) NOT NULL,
  tokenHash CHAR(64) NOT NULL,
  type ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET') NOT NULL,
  expiresAt DATETIME(3) NOT NULL,
  usedAt DATETIME(3) NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_auth_tokens_hash (tokenHash),
  KEY idx_auth_tokens_lookup (userId, type, expiresAt, usedAt),
  CONSTRAINT fk_auth_tokens_user
    FOREIGN KEY (userId) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE ads (
  id VARCHAR(100) NOT NULL,
  advertiserId VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  expectedViews INT UNSIGNED NOT NULL,
  cost DECIMAL(15, 2) NOT NULL,
  placements JSON NOT NULL,
  ctaType VARCHAR(30) NOT NULL,
  ctaValue VARCHAR(500) NOT NULL,
  flyerUrl VARCHAR(1000) NULL,
  status VARCHAR(40) NOT NULL,
  viewsDelivered INT UNSIGNED NOT NULL DEFAULT 0,
  paid TINYINT(1) NOT NULL DEFAULT 1,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_ads_advertiser (advertiserId, createdAt),
  KEY idx_ads_status (status, createdAt),
  CONSTRAINT fk_ads_advertiser
    FOREIGN KEY (advertiserId) REFERENCES users (id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE promotions (
  id VARCHAR(100) NOT NULL,
  creatorId VARCHAR(100) NOT NULL,
  advertId VARCHAR(100) NOT NULL,
  status VARCHAR(40) NOT NULL,
  postUrl VARCHAR(1000) NULL,
  viewsContributed INT UNSIGNED NOT NULL DEFAULT 0,
  earnings DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  startedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  completedAt DATETIME(3) NULL,
  PRIMARY KEY (id),
  KEY idx_promotions_creator_status (creatorId, status),
  KEY idx_promotions_advert (advertId),
  CONSTRAINT fk_promotions_creator
    FOREIGN KEY (creatorId) REFERENCES users (id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_promotions_ad
    FOREIGN KEY (advertId) REFERENCES ads (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE transactions (
  id VARCHAR(100) NOT NULL,
  userId VARCHAR(100) NOT NULL,
  type VARCHAR(40) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  reference VARCHAR(150) NOT NULL,
  status VARCHAR(40) NOT NULL,
  description VARCHAR(500) NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_transactions_reference (reference),
  KEY idx_transactions_user_created (userId, createdAt),
  CONSTRAINT fk_transactions_user
    FOREIGN KEY (userId) REFERENCES users (id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE withdrawals (
  id VARCHAR(100) NOT NULL,
  creatorId VARCHAR(100) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  bankName VARCHAR(150) NOT NULL,
  accountNumber VARCHAR(30) NOT NULL,
  accountName VARCHAR(150) NOT NULL,
  status VARCHAR(40) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  processedAt DATETIME(3) NULL,
  PRIMARY KEY (id),
  KEY idx_withdrawals_creator_status (creatorId, status, createdAt),
  CONSTRAINT fk_withdrawals_creator
    FOREIGN KEY (creatorId) REFERENCES users (id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE support_tickets (
  id VARCHAR(100) NOT NULL,
  userId VARCHAR(100) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(40) NOT NULL,
  reply TEXT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_support_tickets_user_status (userId, status, createdAt),
  CONSTRAINT fk_support_tickets_user
    FOREIGN KEY (userId) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
