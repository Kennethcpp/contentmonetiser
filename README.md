# ContentMonetizer.io — Two-Sided Marketplace

> **Tagline:** *Create • Promote • Earn.*  
> **Brand Direction:** Modern SaaS + Creator Economy + Advertising Marketplace.

---

## 🚀 Overview

**ContentMonetizer** is Nigeria's premier two-sided content monetization marketplace connecting:
1. **Advertisers:** Businesses and individuals who want affordable advertising and access to larger audiences at a guaranteed transparent rate of **₦5 per 1,000 views**.
2. **Content Creators:** Facebook page owners with at least **5,000 verified followers** who earn money by promoting approved advertisements.
3. **Administrators:** The management team responsible for vetting creators, approving ad briefs and flyers, processing bank withdrawals, and overseeing platform operations.

---

## 🎨 Visual Identity & Brand System

- **Primary Colors:**
  - **Lilac / Lavender:** `#F0D8FF`
  - **Coral Orange:** `#FF6C4C`
  - **Warm Cream Background:** `#EFEEE3`
- **Supporting Contrast / Typography:**
  - **Deep Purple:** `#20043B`
- **Design Philosophy:** Minimal button clutter, performance goal-oriented, marketing-centric, transparent pricing calculator, and tailored responsive desktop/mobile experiences.

---

## ⚙️ Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS with custom brand theme tokens
- **Database:** LibSQL / SQLite (production-ready SQL engine configurable via `DATABASE_URL`)
- **Authentication:** Zero-dependency HMAC-SHA256 signed session tokens with `bcryptjs` password hashing
- **Assets:** Official logo concepts, favicon app icons, website banners, promo panels, and dashboard mockups included in `/public/images`

---

## 🔑 Core Features & Architectural Workflows

### 1. For Advertisers
- **Interactive Price Calculator:** Real-time automatic cost computation based on the fixed rate: **₦5 per 1,000 views** (`Cost = (Views / 1000) * 5`).
- **"Place Advert" Wizard:**
  - Target views input.
  - Detailed brief & campaign expectation description.
  - Video placement selection (Starting, Middle, Ending of content — multiple supported).
  - Call to Action (CTA) selection: Phone number (WhatsApp), Website URL, Business address, or Custom.
  - Flyer / photo creative upload preview.
  - Intelligent automatic category detection based on brief keywords.
  - Payment checkout modal with instant debit or wallet deduction.
  - Moves ad to `PENDING_APPROVAL` status before publishing to creators.
- **Advertiser Dashboard:**
  - Available balance & live deduction tracking.
  - Views delivered vs. expected views progress.
  - Interactive SVG performance chart matching brand design mockups.
  - Controls to **Pause**, **Resume**, **Stop**, and **Delete** campaigns.
  - **Deposit-only** wallet functionality.
  - Profile settings, password change, and support ticket submission.

### 2. For Content Creators
- **Facebook Page Automatic Verification:**
  - Checks page existence and enforces the minimum requirement of **5,000 active followers**.
  - Fetches page report, category, follower count, and eligibility status.
- **Creator Onboarding & Approval:**
  - Multi-category niche selection (matching advertiser categories).
  - Account initially placed in `WAITING_APPROVAL` status with a progress notification.
- **Creator Marketplace & Single-Ad Rule:**
  - **Strict Platform Rule:** *Creators can only promote ONE active advert at a time.* Existing promotion must be completed or ended before starting a new one.
  - Post proof submission (Facebook post URL).
  - Performance tracking (views delivered, CPM earnings rate).
- **Earnings & Direct Bank Withdrawals:**
  - Creator receives **90% revenue share** (₦4.50 per 1,000 views).
  - Direct payout requests to Nigerian commercial and digital banks (GTBank, Access, Zenith, Kuda, OPay, Palmpay, etc.).

### 3. For Administrators
- Dedicated admin portal at `/admin`.
- Review pending creator applications with Facebook page metrics.
- Review and approve/reject advertisements before they become visible to creators.
- Process and mark creator withdrawal requests as paid or rejected with balance refund.
- High-level platform statistics: total users, ad spend, impressions delivered, and payout ledger.

---

## 🛠️ Local Development & Setup

### 1. Install dependencies
```bash
npm install
```

### Email configuration

Registration and password recovery require SMTP configuration:

```text
APP_URL=http://localhost:3000
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=...
SMTP_PASSWORD=...
EMAIL_FROM="ContentMonetizer <no-reply@example.com>"
```

New accounts must verify their email before signing in. Password reset links expire after one hour.

### 2. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for production
```bash
npm run build
npm run start
```

---

## 📦 Project Structure

```text
├── public/
│   └── images/               # Extracted logo, mockup, and banner assets
├── src/
│   ├── app/
│   │   ├── admin/            # Administrator management portal
│   │   ├── advertiser/       # Advertiser dashboard & ad placement wizard
│   │   ├── creator/          # Creator dashboard & single-ad promotion tracker
│   │   ├── login/            # Email/password authentication
│   │   ├── register/         # Registration + email verification
│   │   ├── forgot-password/  # Password reset request
│   │   ├── reset-password/   # Password reset completion
│   │   ├── verify-email/     # Email verification
│   │   ├── api/
│   │   │   ├── admin/        # Admin approval & overview endpoints
│   │   │   ├── ads/          # Ad creation, listing & status actions
│   │   │   ├── auth/         # Register, login, logout, me, profile
│   │   │   ├── promotions/   # Creator promotion assignment & proof check
│   │   │   ├── verify-facebook/ # Automatic Facebook page follower checker
│   │   │   └── wallet/       # Deposits & creator bank withdrawals
│   │   ├── globals.css       # Tailwind v4 configuration & brand color tokens
│   │   ├── layout.tsx        # Root layout with fonts & metadata
│   │   └── page.tsx          # Public marketing landing page
│   ├── components/
│   │   ├── Navbar.tsx        # Responsive navigation
│   │   ├── Footer.tsx        # Brand footer with "Create. Promote. Earn."
│   │   ├── PricingCalculator.tsx # Dynamic ₦5/1k views ROI calculator
│   │   └── icons/            # Brand SVG icons
│   └── lib/
│       ├── auth.ts           # HMAC session security
│       ├── categories.ts     # Category list & auto-detection keyword engine
│       ├── db.ts             # LibSQL SQL schema
│       ├── email.ts          # SMTP verification and reset email delivery
│       ├── auth-tokens.ts    # Hashed, expiring authentication tokens
│       └── facebook.ts       # Facebook page follower threshold validator
└── contentmonetiser.db       # Local SQL file database (auto-generated)
```

---

## 📄 License
Private & Proprietary — ContentMonetizer.io.
