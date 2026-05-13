# 🖥️ LaptopStore — Full-Stack E-Commerce

متجر لابتوبات متكامل بالعربية والإنجليزية مبني بـ Next.js 14 App Router.

---

## ✨ المميزات / Features

| Feature | Description |
|---------|-------------|
| 🌍 **i18n** | Arabic (RTL) + English (LTR) routing via next-intl |
| 🔐 **Auth** | Email + OTP verification via Brevo SMTP, JWT sessions |
| 📦 **Products** | Full catalog with filters, search, specs, reviews, compare, wishlist |
| 🛒 **Cart & Checkout** | Zustand-powered cart with coupon support |
| 📋 **Orders** | Order placement, tracking, real-time status updates |
| 💰 **Wallet** | Sham Cash / Syriatel Cash top-up with admin approval |
| 💬 **Support Chat** | Real-time support chat between users and admin |
| 🔔 **Notifications** | In-app notification system |
| 🖼️ **Cloudinary** | Image upload for products and receipts |
| 👑 **Admin Panel** | Full CMS — products, orders, users, wallet, messages, banners, settings |

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd laptop
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env
```
Fill in these required values:
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
SMTP_PASSWORD=your-brevo-smtp-password
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup
```bash
# Push schema to database
npm run prisma:push

# Seed with sample data (optional)
npm run prisma:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 🗂️ Project Structure

```
laptop/
├── prisma/
│   ├── schema.prisma      # 20+ models
│   └── seed.ts            # Sample data seeder
├── messages/
│   ├── ar.json            # Arabic translations
│   └── en.json            # English translations
├── src/
│   ├── app/
│   │   ├── [locale]/      # Localized pages (ar/en)
│   │   │   ├── page.tsx   # Homepage
│   │   │   ├── products/  # Product listing + detail
│   │   │   ├── cart/      # Shopping cart
│   │   │   ├── checkout/  # Order placement
│   │   │   ├── orders/    # Order history
│   │   │   ├── wallet/    # Wallet top-up
│   │   │   ├── wishlist/  # Wishlist
│   │   │   ├── compare/   # Product comparison
│   │   │   ├── profile/   # User profile
│   │   │   ├── support/   # Live chat
│   │   │   ├── auth/      # Login, Register, OTP, Reset
│   │   │   └── admin/     # Admin panel (protected)
│   │   └── api/           # REST API routes
│   ├── components/        # React components
│   ├── lib/               # db, auth, mailer, store, utils
│   ├── types/             # TypeScript types
│   ├── context/           # Providers
│   └── i18n/              # next-intl config
├── next.config.js
├── tailwind.config.ts
├── railway.json           # Railway deployment config
└── .env.example
```

---

## 🌐 Routing

| Path | Page |
|------|------|
| `/ar` | Home (Arabic, RTL) |
| `/en` | Home (English, LTR) |
| `/ar/products` | Product listing |
| `/ar/products/[id]` | Product detail |
| `/ar/cart` | Shopping cart |
| `/ar/checkout` | Checkout |
| `/ar/orders` | My orders |
| `/ar/wallet` | Wallet |
| `/ar/wishlist` | Wishlist |
| `/ar/compare` | Product compare |
| `/ar/profile` | User profile |
| `/ar/support` | Live chat support |
| `/ar/auth/login` | Login |
| `/ar/auth/register` | Register (OTP) |
| `/ar/admin` | Admin dashboard |

---

## 🔑 Default Credentials (after seed)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@laptopstore.sy` | `admin123456` |
| Test User | `user@test.com` | `user123456` |

**Coupons:** `WELCOME10` (10% off) | `SAVE500K` (500K SYP off)

---

## 🚂 Railway Deployment

1. Push to GitHub
2. Create Railway project → connect repo
3. Add environment variables (see `.env.example`)
4. Railway auto-detects Next.js, runs `npm run build` + `npm start`
5. Add PostgreSQL plugin in Railway for `DATABASE_URL`
6. Run migrations: `npm run prisma:migrate`
7. Seed: `npm run prisma:seed`

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **i18n:** next-intl v3
- **Auth:** NextAuth v4 (JWT) + OTP via Brevo SMTP
- **Database:** PostgreSQL + Prisma ORM
- **State:** Zustand (cart, wishlist, compare)
- **Styling:** Tailwind CSS + Framer Motion
- **Images:** Cloudinary
- **Email:** Nodemailer + Brevo SMTP
- **Validation:** Zod + React Hook Form
- **Deployment:** Railway

---

## 📱 Payment Methods (Wallet Top-up)

- **Syriatel Cash** — المحفظة الإلكترونية
- **Sham Cash** — شام كاش
- **MTN Cash** — MTN كاش

Admins manually approve top-up requests from the admin panel.

---

© 2024 LaptopStore. All rights reserved.
