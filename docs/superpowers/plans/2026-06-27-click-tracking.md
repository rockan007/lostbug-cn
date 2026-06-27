# Click-Based Ranking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace manual upvote/downvote with automatic click-jump tracking, ranked by per-visitor click count.

**Architecture:** New `Jump` table tracks one click per visitor per website (IP+UA hash dedup, same as old Vote). `sendBeacon` on link click fires a POST API that upserts a Jump row and increments `jumpCount`. Homepage sorts by `jumpCount desc`. Existing upVotes migrate as initial click counts.

**Tech Stack:** Next.js 16 App Router, Prisma 7 with PostgreSQL, React 19, Tailwind CSS v4

## Global Constraints

- Visitor dedup: SHA256(ip:ua) first 32 chars via `getVisitorId()` in `src/lib/visitor.ts`
- Jump count is per-website, per-visitor, lifetime unique (no time window)
- `sendBeacon` for click reporting (graceful degradation — no-JS skips counting)
- Old `upVotes` values become initial `jumpCount` via SQL migration
- Old `Vote` table and `VoteButtons` component removed after migration verified
- No downVotes — pure positive click counting only

---

### Task 1: Database Schema — Jump Model + jumpCount Field

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Produces: `Jump` model (id, websiteId, visitorId, website relation, createdAt), `Website.jumpCount Int @default(0)`, `@@unique([websiteId, visitorId])`, `@@index([jumpCount])`

- [ ] **Step 1: Add Jump model and jumpCount to Website in schema.prisma**

In `prisma/schema.prisma`, add to the `Website` model after `downVotes`:

```prisma
  jumpCount    Int          @default(0) @map("jump_count")
```

Add `Jump` to Website's relations (after `votes`):
```
  jumps        Jump[]
```

After `@@index([upVotes, downVotes])`, add:
```
  @@index([jumpCount])
```

After the `Vote` model block, add:

```prisma
model Jump {
  id        Int      @id @default(autoincrement())
  websiteId Int      @map("website_id")
  visitorId String   @map("visitor_id")
  website   Website  @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now()) @map("created_at")

  @@unique([websiteId, visitorId])
  @@map("jumps")
}
```

- [ ] **Step 2: Run Prisma migrate**

```bash
npx prisma migrate dev --name add_jump_tracking
```

Expected: Creates migration SQL file, applies to dev database. Verify with:
```bash
npx prisma db execute --stdin <<< "SELECT column_name FROM information_schema.columns WHERE table_name='jumps';"
```
Expected output includes: `id`, `website_id`, `visitor_id`, `created_at`

- [ ] **Step 3: Migrate existing upVotes to jumpCount**

```bash
npx prisma db execute --stdin <<< "UPDATE websites SET jump_count = up_votes;"
```

Verify:
```bash
npx prisma db execute --stdin <<< "SELECT id, title, up_votes, jump_count FROM websites WHERE up_votes > 0 LIMIT 5;"
```

Expected: `jump_count` equals `up_votes` for all rows.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add Jump model and jumpCount for click tracking"
```

---

### Task 2: Jump API Route

**Files:**
- Create: `src/app/api/websites/[id]/jump/route.ts`

**Interfaces:**
- Consumes: `db` from `@/lib/db`, `getVisitorId` from `@/lib/visitor`
- Produces: `POST /api/websites/[id]/jump` → `{ jumpCount: number }`

- [ ] **Step 1: Create the jump route file**

Create `src/app/api/websites/[id]/jump/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getVisitorId } from '@/lib/visitor'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const websiteId = parseInt(id)

  if (isNaN(websiteId)) {
    return NextResponse.json({ error: 'Invalid website ID' }, { status: 400 })
  }

  const visitorId = await getVisitorId()

  const website = await db.website.findUnique({ where: { id: websiteId } })
  if (!website) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Idempotent: if visitor already jumped, don't increment
  const existing = await db.jump.findUnique({
    where: { websiteId_visitorId: { websiteId, visitorId } },
  })

  if (existing) {
    return NextResponse.json({ jumpCount: website.jumpCount })
  }

  const updated = await db.$transaction([
    db.jump.create({ data: { websiteId, visitorId } }),
    db.website.update({ where: { id: websiteId }, data: { jumpCount: { increment: 1 } } }),
  ])

  return NextResponse.json({ jumpCount: updated[1].jumpCount })
}
```

- [ ] **Step 2: Build check**

```bash
npx next build 2>&1 | tail -5
```

Expected: No build errors. The route is auto-registered by Next.js App Router file-system routing.

- [ ] **Step 3: Manual test (requires running dev server)**

```bash
# Terminal 1: start dev server
npm run dev

# Terminal 2: test jump API
curl -X POST http://localhost:3000/api/websites/1/jump
```

Expected: `{"jumpCount": <number>}`. Second call returns same count (idempotent).

- [ ] **Step 4: Commit**

```bash
git add src/app/api/websites/
git commit -m "feat: add POST /api/websites/[id]/jump endpoint"
```

---

### Task 3: Frontend — WebsiteCard sendBeacon + jumpCount Display

**Files:**
- Modify: `src/components/WebsiteCard.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `POST /api/websites/[id]/jump` from Task 2, `website.jumpCount` from Task 1
- Produces: Updated `WebsiteCard` props (no `upVotes`/`downVotes`, added `jumpCount`), updated `HomePage` query

- [ ] **Step 1: Update WebsiteCard — remove VoteButtons, add sendBeacon and jumpCount display**

Replace `src/components/WebsiteCard.tsx` entirely:

```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'

interface WebsiteCardProps {
  website: {
    id: number
    title: string
    url: string
    description: string
    favicon: string
    jumpCount: number
    category: { name: string; slug: string }
    tags: { tag: { name: string; slug: string } }[]
  }
}

export default function WebsiteCard({ website }: WebsiteCardProps) {
  const [imgError, setImgError] = useState(false)
  let hostname: string
  try {
    hostname = new URL(website.url).hostname
  } catch {
    hostname = website.url
  }
  const initial = hostname.charAt(0).toUpperCase()

  function handleClick() {
    navigator.sendBeacon?.(`/api/websites/${website.id}/jump`)
  }

  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow bg-white">
      {/* Favicon or letter avatar */}
      <div className="shrink-0 mt-0.5">
        {website.favicon && !imgError ? (
          <img
            src={website.favicon}
            alt=""
            width={32}
            height={32}
            className="w-8 h-8 rounded"
            onError={() => setImgError(true)}
          />
        ) : null}
        <div className={`w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center ${!website.favicon || imgError ? '' : 'hidden'}`}
          style={!website.favicon || imgError ? undefined : { display: 'none' }}>
          {initial}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <a
          href={website.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="text-blue-600 hover:underline font-medium"
        >
          {website.title}
        </a>
        <span className="text-gray-400 text-sm ml-2">{hostname}</span>
        {website.description && (
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{website.description}</p>
        )}
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Link
            href={`/category/${website.category.slug}`}
            className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100"
          >
            {website.category.name}
          </Link>
          {website.tags.map(({ tag }) => (
            <Link
              key={tag.slug}
              href={`/search?tag=${tag.slug}`}
              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      </div>
      {/* Jump count display */}
      <div className="flex items-center gap-1 text-sm text-gray-400 shrink-0">
        <span className="font-medium tabular-nums">{website.jumpCount}</span>
        <span className="text-xs">次访问</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update HomePage — sort by jumpCount and pass jumpCount**

Replace `src/app/page.tsx` entirely:

```typescript
import { db } from '@/lib/db'
import WebsiteCard from '@/components/WebsiteCard'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [hotWebsites, recentWebsites] = await Promise.all([
    db.website.findMany({
      where: { status: 'approved' },
      include: { category: true, tags: { include: { tag: true } } },
      orderBy: { jumpCount: 'desc' },
      take: 10,
    }),
    db.website.findMany({
      where: { status: 'approved' },
      include: { category: true, tags: { include: { tag: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  return (
    <div className="space-y-10">
      {hotWebsites.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4">🔥 热门推荐</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {hotWebsites.map((site) => (
              <WebsiteCard key={site.id} website={site} />
            ))}
          </div>
        </section>
      )}

      {recentWebsites.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4">🆕 最新添加</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {recentWebsites.map((site) => (
              <WebsiteCard key={site.id} website={site} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Build check**

```bash
npx next build 2>&1 | tail -10
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/WebsiteCard.tsx src/app/page.tsx
git commit -m "feat: replace vote buttons with click-jump tracking on cards"
```

---

### Task 4: Cleanup — Remove Vote System

**Files:**
- Delete: `src/components/VoteButtons.tsx`
- Delete: `src/app/api/websites/[id]/vote/route.ts`

**Interfaces:**
- Consumes: Task 3 (frontend no longer imports VoteButtons)
- Produces: Clean filesystem (no dead vote code)

- [ ] **Step 1: Delete VoteButtons and vote API route**

```bash
rm src/components/VoteButtons.tsx
rm -r src/app/api/websites/\[id\]/vote/
```

- [ ] **Step 2: Build check (confirm no dangling imports)**

```bash
npx next build 2>&1 | tail -10
```

Expected: Build succeeds with no "cannot find module" errors.

- [ ] **Step 3: Mark old Vote table as deprecated**

No code change needed — the `Vote` model stays in schema for now. Add a TODO comment above the Vote model in `prisma/schema.prisma`:

```prisma
// @deprecated V1 — replaced by Jump model for click-based ranking. Remove after next migration.
model Vote {
```

- [ ] **Step 4: Commit**

```bash
git add src/components/VoteButtons.tsx src/app/api/websites/[id]/vote/ src/components/WebsiteCard.tsx src/app/page.tsx
git commit -m "chore: remove VoteButtons and vote API, deprecated Vote model"
```

---

### Verification Checklist

After all tasks complete, smoke test:

```bash
# 1. Build
npx next build

# 2. Start dev server, click through sites on homepage
# 3. Verify jumpCount increments in DB
npx prisma db execute --stdin <<< "SELECT title, jump_count FROM websites ORDER BY jump_count DESC LIMIT 5;"

# 4. Verify idempotent: repeat click, jumpCount unchanged for same visitor
# 5. Verify no UI regressions: cards render without vote buttons, jump count displays
```
