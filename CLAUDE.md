# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev        # Start dev server on localhost:3000
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint
npx prisma db seed # Seed database (runs tsx prisma/seed.ts)
```

## Architecture

LostBug is a **website directory/navigation site** (网站导航) built with **Next.js 16 App Router**, **Prisma 7 + PostgreSQL**, **React 19**, and **Tailwind CSS v4**.

All pages use `export const dynamic = 'force-dynamic'` — no static generation, every request hits the database.

### Project structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout: fetches categories, renders LayoutShell + children
│   ├── page.tsx            # Home: "热门推荐" (top 10 by jumpCount) + "最新添加" (latest 10)
│   ├── category/[slug]/    # Category page with optional tag filter
│   ├── search/             # Search by q, tag, or categoryId
│   ├── submit/             # User submission form (creates pending websites)
│   ├── admin/              # Admin login, review queue, site management
│   └── api/
│       ├── websites/              # GET (list), POST (submit)
│       ├── websites/[id]/jump/    # POST: record a click (visitor-deduped)
│       ├── categories/            # GET: list categories
│       ├── search/                # GET: search
│       └── admin/                 # login + review routes
├── components/
│   ├── LayoutShell.tsx      # Client component: sidebar state + localStorage persistence
│   ├── Sidebar.tsx          # Collapsible sidebar with category icons (emojis)
│   ├── Navbar.tsx           # Top bar with ⌘K search shortcut
│   ├── WebsiteCard.tsx      # Card with favicon, link, tags, jump count
│   ├── SubmitForm.tsx       # Client form → POST /api/websites
│   ├── CategoryCard.tsx     # Category display card
│   └── TagFilter.tsx        # Tag filter buttons
└── lib/
    ├── db.ts               # Lazy PrismaClient proxy (avoids build-time instantiation)
    ├── auth.ts             # HMAC-signed cookie admin auth (login/isAdmin/logout)
    ├── visitor.ts          # Hash (IP + User-Agent) for unique visitor ID
    └── favicon.ts          # 3-step favicon discovery: HTML → /favicon.ico → Google service
```

### Key design decisions

- **Jump tracking is idempotent**: one unique visitor = one count per website. Uses `visitorId` (SHA256 of IP+UA) + Prisma unique constraint to deduplicate. Concurrent writes handle P2002 gracefully.
- **Optimistic UI**: `WebsiteCard` increments a local `useState` on click and fires `sendBeacon()` — the UI updates before the server responds.
- **Favicon `<img>` uses `referrerPolicy="no-referrer"`**: some CDNs (e.g. B站) block requests based on Referer header. Do NOT add `crossOrigin="anonymous"` — it breaks CDNs without CORS headers.
- **Favicon discovery** has a 3-step fallback: parse HTML `<link rel="icon">` → try `/favicon.ico` → Google `s2/favicons` service. It temporarily clears proxy env vars during fetch because Node.js undici can't handle local proxies.
- **Cookie-based admin auth**: password checked against `ADMIN_PASSWORD` env var, HMAC-signed token stored in httpOnly cookie. Dev uses `'dev-secret'` fallback.
- **Seed script** uses `upsert` with conditional update (`favicon ? { favicon } : {}`) — never overwrites manually-set favicons with empty strings.
- **Prisma generated files** live at `src/generated/prisma` (configured via `prisma.config.ts`).
- **Categories** are ordered by `sortOrder: 'asc'`. AI (sortOrder 0) comes first.

### Env vars

- `DATABASE_URL` — PostgreSQL connection string (required)
- `ADMIN_PASSWORD` — admin login password (required in production)
- `COOKIE_SECRET` — HMAC signing key for admin cookie (required in production)
