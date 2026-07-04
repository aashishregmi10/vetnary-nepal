# PawMart

Nepal's online pet shop — MERN stack. Express + Mongoose API (`/backend`), Next.js 16 + React 19 + Tailwind 4 storefront and admin portal (`/frontend`).

## Stack

- **Backend**: Express 5, Mongoose, JWT auth (access + rotating refresh tokens), Cloudinary image uploads, COD-only orders.
- **Frontend**: Next.js App Router, Zustand state, Tailwind 4 (`@theme` design tokens), server-rendered SEO (JSON-LD, sitemap, robots.txt).

## Structure

- `/backend/src` — `config`, `controllers`, `middlewares`, `models`, `routes`, `utils`
- `/frontend/src/app` — public storefront routes, `/account` (customer portal), `/admin/(dash)` (admin portal)

## Getting started

```bash
# backend
cd backend
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, CLOUDINARY_* etc.
npm install
npm run dev             # or: node src/server.js

# frontend
cd frontend
npm install
npm run dev
```

## Notes

- Cash on delivery only — `Order.paymentMethod` enum is `['cod']`.
- Admin access requires `isAdmin: true` on the user document (see `backend/scripts/makeAdmin.js`).
