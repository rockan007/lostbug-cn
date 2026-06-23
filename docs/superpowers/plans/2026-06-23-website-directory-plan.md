# Website Directory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deployable website directory with category browsing, tag filtering, full-text search, anonymous submission, admin review, and voting.

**Architecture:** Next.js 14 App Router monolith — server components for data fetching, client components for interactivity (voting, forms). API routes under `/api/` handle mutations. Prisma ORM talks to PostgreSQL. Auth uses a single shared password via encrypted cookie.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Prisma, PostgreSQL, pg_trgm + tsvector

---

## File Map

```
src/
├── app/
│   ├── globals.css                  # Tailwind directives + base styles
│   ├── layout.tsx                   # Root layout with Navbar
│   ├── page.tsx                     # Home: hot list + categories + recent
│   ├── category/[slug]/page.tsx     # Category browse + tag filter
│   ├── search/page.tsx              # Search results
│   ├── submit/page.tsx              # Submission form
│   ├── admin/
│   │   ├── layout.tsx               # Admin auth guard layout
│   │   ├── page.tsx                 # Admin dashboard
│   │   ├── login/page.tsx           # Admin login form
│   │   ├── review/page.tsx          # Review pending submissions
│   │   └── sites/page.tsx           # Manage all sites
│   └── api/
│       ├── categories/route.ts      # GET categories
│       ├── websites/
│       │   ├── route.ts             # GET list, POST create submission
│       │   └── [id]/
│       │       ├── route.ts         # GET/PUT/DELETE single website
│       │       └── vote/route.ts    # POST vote
│       ├── search/route.ts          # GET search
│       └── admin/
│           ├── login/route.ts       # POST login
│           └── review/route.ts      # PUT review status
├── lib/
│   ├── db.ts                        # Prisma client singleton
│   ├── auth.ts                      # Password verify + cookie helpers
│   └── visitor.ts                   # Visitor ID from headers
└── components/
    ├── Navbar.tsx                   # Top navigation bar
    ├── WebsiteCard.tsx              # Single website card with votes
    ├── VoteButtons.tsx              # Client-side vote buttons
    ├── CategoryCard.tsx             # Category card for homepage grid
    ├── TagFilter.tsx                # Tag filter bar
    ├── SubmitForm.tsx               # Submission form (client)
    └── AdminGuard.tsx               # Password gate for admin
prisma/
├── schema.prisma                    # Database schema
└── seed.ts                          # Initial seed data
```

---

### Task 1: Project Scaffold

**Files:**
- Create: entire project via `create-next-app`

- [ ] **Step 1: Create Next.js project**

```bash
cd /Users/anqi/projects/lostbug-cn
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

- [ ] **Step 2: Install additional dependencies**

```bash
npm install prisma @prisma/client
```

- [ ] **Step 3: Initialize Prisma and create .env**

```bash
npx prisma init
```

Write `.env.example`:

```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
ADMIN_PASSWORD="your-admin-password"
COOKIE_SECRET="a-random-secret-string"
```

- [ ] **Step 4: Verify scaffold**

```bash
npm run dev
```

Open http://localhost:3000 — should see the default Next.js page.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project with TypeScript, Tailwind, Prisma"
```

---

### Task 2: Database Schema

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/seed.ts`

- [ ] **Step 1: Write Prisma schema**

Replace `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Category {
  id         Int       @id @default(autoincrement())
  name       String    @unique
  slug       String    @unique
  sortOrder  Int       @default(0) @map("sort_order")
  websites   Website[]
  createdAt  DateTime  @default(now()) @map("created_at")
  updatedAt  DateTime  @updatedAt @map("updated_at")

  @@map("categories")
}

model Website {
  id            Int       @id @default(autoincrement())
  title         String
  url           String    @unique
  description   String    @default("")
  favicon       String    @default("")
  status        String    @default("pending") // pending | approved | rejected
  submitterName String    @default("") @map("submitter_name")
  upVotes       Int       @default(0) @map("up_votes")
  downVotes     Int       @default(0) @map("down_votes")
  categoryId    Int       @map("category_id")
  category      Category  @relation(fields: [categoryId], references: [id])
  tags          WebsiteTag[]
  votes         Vote[]
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  @@index([status])
  @@index([categoryId, status])
  @@index([upVotes, downVotes])
  @@map("websites")
}

model Tag {
  id        Int          @id @default(autoincrement())
  name      String       @unique
  slug      String       @unique
  websites  WebsiteTag[]
  createdAt DateTime     @default(now()) @map("created_at")

  @@map("tags")
}

model WebsiteTag {
  websiteId Int     @map("website_id")
  tagId     Int     @map("tag_id")
  website   Website @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([websiteId, tagId])
  @@map("website_tags")
}

model Vote {
  id        Int      @id @default(autoincrement())
  websiteId Int      @map("website_id")
  visitorId String   @map("visitor_id")
  voteType  String   @map("vote_type") // up | down
  website   Website  @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now()) @map("created_at")

  @@unique([websiteId, visitorId])
  @@map("votes")
}
```

- [ ] **Step 2: Run database migration**

```bash
npx prisma migrate dev --name init
```

Expected: Migration creates all 5 tables with indexes and constraints.

- [ ] **Step 3: Write seed script**

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  { name: '设计工具', slug: 'design', sortOrder: 1 },
  { name: '开发资源', slug: 'dev', sortOrder: 2 },
  { name: '效率工具', slug: 'productivity', sortOrder: 3 },
  { name: '学习资源', slug: 'learning', sortOrder: 4 },
  { name: '资讯阅读', slug: 'news', sortOrder: 5 },
  { name: '生活服务', slug: 'life', sortOrder: 6 },
]

async function main() {
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    })
  }
  console.log('Seeded categories')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
```

Add to `package.json`:

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

```bash
npm install -D tsx
npx prisma db seed
```

- [ ] **Step 4: Commit**

```bash
git add prisma/ package.json
git commit -m "feat: add database schema and seed categories"
```

---

### Task 3: Core Libraries

**Files:**
- Create: `src/lib/db.ts`
- Create: `src/lib/visitor.ts`
- Create: `src/lib/auth.ts`

- [ ] **Step 1: Create Prisma client singleton**

`src/lib/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

- [ ] **Step 2: Create visitor ID utility**

`src/lib/visitor.ts`:

```typescript
import { headers } from 'next/headers'
import { createHash } from 'crypto'

export function getVisitorId(): string {
  const headersList = headers()
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
  const ua = headersList.get('user-agent') || ''
  return createHash('sha256').update(`${ip}:${ua}`).digest('hex').slice(0, 32)
}
```

- [ ] **Step 3: Create admin auth utility**

`src/lib/auth.ts`:

```typescript
import { cookies } from 'next/headers'
import { createHmac } from 'crypto'

const COOKIE_NAME = 'admin_token'

function sign(value: string): string {
  const secret = process.env.COOKIE_SECRET || 'dev-secret'
  const hmac = createHmac('sha256', secret).update(value).digest('hex')
  return `${value}.${hmac}`
}

function verify(signed: string): boolean {
  const secret = process.env.COOKIE_SECRET || 'dev-secret'
  const [value, hash] = signed.split('.')
  const expected = createHmac('sha256', secret).update(value).digest('hex')
  return hash === expected
}

export function login(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword || password !== adminPassword) return false

  const token = sign('admin')
  const cookieStore = cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
  return true
}

export function isAdmin(): boolean {
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return false
  return verify(token)
}

export function logout(): void {
  const cookieStore = cookies()
  cookieStore.delete(COOKIE_NAME)
}
```

- [ ] **Step 4: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/
git commit -m "feat: add core libraries - db, visitor, auth"
```

---

### Task 4: API Routes — Categories & Search

**Files:**
- Create: `src/app/api/categories/route.ts`
- Create: `src/app/api/search/route.ts`

- [ ] **Step 1: Create categories API**

`src/app/api/categories/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const categories = await db.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { websites: { where: { status: 'approved' } } } } },
  })
  return NextResponse.json(categories)
}
```

- [ ] **Step 2: Create search API**

`src/app/api/search/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') || ''
  const categoryId = request.nextUrl.searchParams.get('categoryId')
  const tagSlug = request.nextUrl.searchParams.get('tag')

  if (!q && !categoryId && !tagSlug) {
    return NextResponse.json([])
  }

  const where: any = { status: 'approved' }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ]
  }

  if (categoryId) {
    where.categoryId = parseInt(categoryId)
  }

  if (tagSlug) {
    where.tags = { some: { tag: { slug: tagSlug } } }
  }

  const websites = await db.website.findMany({
    where,
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
    orderBy: [{ upVotes: 'desc' }, { downVotes: 'asc' }],
    take: 50,
  })

  return NextResponse.json(websites)
}
```

- [ ] **Step 3: Test API endpoints**

```bash
# Start dev server in background, then test
curl -s http://localhost:3000/api/categories | head -c 200
# Expected: JSON array with 6 categories

curl -s "http://localhost:3000/api/search?q=test" | head -c 100
# Expected: JSON array (empty or results)
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/categories/ src/app/api/search/
git commit -m "feat: add categories and search API routes"
```

---

### Task 5: API Routes — Websites CRUD

**Files:**
- Create: `src/app/api/websites/route.ts`
- Create: `src/app/api/websites/[id]/route.ts`

- [ ] **Step 1: Create websites list & create API**

`src/app/api/websites/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get('status') || 'approved'
  const categoryId = request.nextUrl.searchParams.get('categoryId')
  const sort = request.nextUrl.searchParams.get('sort') || 'votes'
  const page = parseInt(request.nextUrl.searchParams.get('page') || '1')
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20')

  const where: any = { status }
  if (categoryId) where.categoryId = parseInt(categoryId)

  const orderBy: any = sort === 'newest'
    ? { createdAt: 'desc' as const }
    : [{ upVotes: 'desc' as const }, { downVotes: 'asc' as const }]

  const [websites, total] = await Promise.all([
    db.website.findMany({
      where,
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.website.count({ where }),
  ])

  return NextResponse.json({ websites, total, page, limit })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, url, description, categoryId, tags, submitterName } = body

  if (!title || !url || !categoryId) {
    return NextResponse.json({ error: 'title, url, categoryId are required' }, { status: 400 })
  }

  const existing = await db.website.findUnique({ where: { url } })
  if (existing) {
    return NextResponse.json({ error: 'This URL already exists' }, { status: 409 })
  }

  const website = await db.website.create({
    data: {
      title,
      url,
      description: description || '',
      categoryId: parseInt(categoryId),
      submitterName: submitterName || '',
      status: 'pending',
      upVotes: 1,
      tags: {
        create: (tags || []).map((tagName: string) => ({
          tag: {
            connectOrCreate: {
              where: { slug: tagName.toLowerCase().replace(/\s+/g, '-') },
              create: { name: tagName, slug: tagName.toLowerCase().replace(/\s+/g, '-') },
            },
          },
        })),
      },
    },
    include: { category: true, tags: { include: { tag: true } } },
  })

  return NextResponse.json(website, { status: 201 })
}
```

- [ ] **Step 2: Create single website API**

`src/app/api/websites/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const website = await db.website.findUnique({
    where: { id: parseInt(id) },
    include: { category: true, tags: { include: { tag: true } } },
  })
  if (!website) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(website)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { title, url, description, categoryId, tags } = body

  const website = await db.website.update({
    where: { id: parseInt(id) },
    data: {
      ...(title && { title }),
      ...(url && { url }),
      ...(description !== undefined && { description }),
      ...(categoryId && { categoryId: parseInt(categoryId) }),
      ...(tags && {
        tags: {
          deleteMany: {},
          create: tags.map((tagName: string) => ({
            tag: {
              connectOrCreate: {
                where: { slug: tagName.toLowerCase().replace(/\s+/g, '-') },
                create: { name: tagName, slug: tagName.toLowerCase().replace(/\s+/g, '-') },
              },
            },
          })),
        },
      }),
    },
    include: { category: true, tags: { include: { tag: true } } },
  })

  return NextResponse.json(website)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await db.website.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 3: Test with curl**

```bash
# Test creating a submission
curl -s -X POST http://localhost:3000/api/websites \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Site","url":"https://example.com","description":"A test","categoryId":1,"tags":["test"],"submitterName":"Tester"}' | head -c 200

# Expected: JSON with the created website, status "pending"

# Test listing
curl -s http://localhost:3000/api/websites | head -c 200
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/websites/
git commit -m "feat: add websites CRUD API routes"
```

---

### Task 6: API Routes — Vote & Admin

**Files:**
- Create: `src/app/api/websites/[id]/vote/route.ts`
- Create: `src/app/api/admin/login/route.ts`
- Create: `src/app/api/admin/review/route.ts`

- [ ] **Step 1: Create vote API**

`src/app/api/websites/[id]/vote/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getVisitorId } from '@/lib/visitor'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const websiteId = parseInt(id)
  const body = await request.json()
  const { voteType } = body // 'up' or 'down'

  if (!voteType || !['up', 'down'].includes(voteType)) {
    return NextResponse.json({ error: 'voteType must be "up" or "down"' }, { status: 400 })
  }

  const visitorId = getVisitorId()

  const website = await db.website.findUnique({ where: { id: websiteId } })
  if (!website) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const existingVote = await db.vote.findUnique({
    where: { websiteId_visitorId: { websiteId, visitorId } },
  })

  await db.$transaction(async (tx) => {
    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote
        await tx.vote.delete({ where: { id: existingVote.id } })
        if (voteType === 'up') {
          await tx.website.update({ where: { id: websiteId }, data: { upVotes: { decrement: 1 } } })
        } else {
          await tx.website.update({ where: { id: websiteId }, data: { downVotes: { decrement: 1 } } })
        }
      } else {
        // Switch vote
        await tx.vote.update({ where: { id: existingVote.id }, data: { voteType } })
        if (voteType === 'up') {
          await tx.website.update({ where: { id: websiteId }, data: { upVotes: { increment: 1 }, downVotes: { decrement: 1 } } })
        } else {
          await tx.website.update({ where: { id: websiteId }, data: { upVotes: { decrement: 1 }, downVotes: { increment: 1 } } })
        }
      }
    } else {
      await tx.vote.create({ data: { websiteId, visitorId, voteType } })
      if (voteType === 'up') {
        await tx.website.update({ where: { id: websiteId }, data: { upVotes: { increment: 1 } } })
      } else {
        await tx.website.update({ where: { id: websiteId }, data: { downVotes: { increment: 1 } } })
      }
    }
  })

  const updated = await db.website.findUnique({
    where: { id: websiteId },
    select: { upVotes: true, downVotes: true },
  })

  return NextResponse.json(updated)
}
```

- [ ] **Step 2: Create admin login API**

`src/app/api/admin/login/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { login } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { password } = body

  if (!password) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 })
  }

  const success = login(password)
  if (!success) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 3: Create admin review API**

`src/app/api/admin/review/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, status } = body // status: 'approved' | 'rejected'

  if (!id || !status || !['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'id and valid status required' }, { status: 400 })
  }

  const website = await db.website.update({
    where: { id: parseInt(id) },
    data: { status },
  })

  return NextResponse.json(website)
}
```

- [ ] **Step 4: Test vote endpoint**

```bash
# Test voting
curl -s -X POST http://localhost:3000/api/websites/1/vote \
  -H "Content-Type: application/json" \
  -d '{"voteType":"up"}'
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/websites/\[id\]/vote/ src/app/api/admin/
git commit -m "feat: add vote and admin API routes"
```

---

### Task 7: Components — Navbar, WebsiteCard, VoteButtons

**Files:**
- Create: `src/components/Navbar.tsx`
- Create: `src/components/WebsiteCard.tsx`
- Create: `src/components/VoteButtons.tsx`

- [ ] **Step 1: Create VoteButtons (client component)**

`src/components/VoteButtons.tsx`:

```typescript
'use client'

import { useState } from 'react'

interface VoteButtonsProps {
  websiteId: number
  upVotes: number
  downVotes: number
}

export default function VoteButtons({ websiteId, upVotes, downVotes }: VoteButtonsProps) {
  const [votes, setVotes] = useState({ up: upVotes, down: downVotes })
  const [loading, setLoading] = useState(false)

  async function handleVote(voteType: 'up' | 'down') {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/websites/${websiteId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      })
      if (res.ok) {
        const data = await res.json()
        setVotes({ up: data.upVotes, down: data.downVotes })
      }
    } catch (e) {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => handleVote('up')}
        className="px-1.5 py-0.5 rounded hover:bg-green-100 transition-colors"
        aria-label="Upvote"
      >
        ▲
      </button>
      <span className="font-medium min-w-[2ch] text-center">{votes.up - votes.down}</span>
      <button
        onClick={() => handleVote('down')}
        className="px-1.5 py-0.5 rounded hover:bg-red-100 transition-colors"
        aria-label="Downvote"
      >
        ▼
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Create WebsiteCard**

`src/components/WebsiteCard.tsx`:

```typescript
import Link from 'next/link'
import VoteButtons from './VoteButtons'

interface WebsiteCardProps {
  website: {
    id: number
    title: string
    url: string
    description: string
    favicon: string
    upVotes: number
    downVotes: number
    category: { name: string; slug: string }
    tags: { tag: { name: string; slug: string } }[]
  }
}

export default function WebsiteCard({ website }: WebsiteCardProps) {
  const hostname = new URL(website.url).hostname

  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow bg-white">
      <VoteButtons
        websiteId={website.id}
        upVotes={website.upVotes}
        downVotes={website.downVotes}
      />
      <div className="flex-1 min-w-0">
        <a
          href={website.url}
          target="_blank"
          rel="noopener noreferrer"
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
    </div>
  )
}
```

- [ ] **Step 3: Create Navbar (server component with client search)**

`src/components/Navbar.tsx`:

```typescript
import Link from 'next/link'
import { db } from '@/lib/db'

export default async function Navbar() {
  const categories = await db.category.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link href="/" className="font-bold text-lg text-gray-800 shrink-0">
          LostBug
        </Link>

        {/* Category dropdown */}
        <div className="relative group">
          <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
            分类 ▾
          </button>
          <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all min-w-[160px]">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Search form */}
        <form action="/search" className="flex-1 max-w-md">
          <input
            type="text"
            name="q"
            placeholder="搜索网站..."
            className="w-full px-3 py-1.5 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
          />
        </form>

        <Link
          href="/submit"
          className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shrink-0"
        >
          + 推荐网站
        </Link>
      </div>
    </nav>
  )
}
```

- [ ] **Step 4: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/components/Navbar.tsx src/components/WebsiteCard.tsx src/components/VoteButtons.tsx
git commit -m "feat: add Navbar, WebsiteCard, and VoteButtons components"
```

---

### Task 8: Components — CategoryCard, TagFilter, SubmitForm, AdminGuard

**Files:**
- Create: `src/components/CategoryCard.tsx`
- Create: `src/components/TagFilter.tsx`
- Create: `src/components/SubmitForm.tsx`
- Create: `src/components/AdminGuard.tsx`

- [ ] **Step 1: Create CategoryCard**

`src/components/CategoryCard.tsx`:

```typescript
import Link from 'next/link'

interface CategoryCardProps {
  category: {
    name: string
    slug: string
    _count: { websites: number }
  }
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="block p-6 border rounded-xl hover:shadow-md hover:border-blue-300 transition-all bg-white"
    >
      <h3 className="font-semibold text-gray-800">{category.name}</h3>
      <p className="text-sm text-gray-400 mt-1">{category._count.websites} 个网站</p>
    </Link>
  )
}
```

- [ ] **Step 2: Create TagFilter**

`src/components/TagFilter.tsx`:

```typescript
'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface TagFilterProps {
  tags: { name: string; slug: string }[]
  activeTag: string
}

export default function TagFilter({ tags, activeTag }: TagFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleTagClick(slug: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (params.get('tag') === slug) {
      params.delete('tag')
    } else {
      params.set('tag', slug)
    }
    router.push(`?${params.toString()}`)
  }

  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <button
          key={tag.slug}
          onClick={() => handleTagClick(tag.slug)}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            tag.slug === activeTag
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {tag.name}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create SubmitForm**

`src/components/SubmitForm.tsx`:

```typescript
'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

interface Category {
  id: number
  name: string
  slug: string
}

export default function SubmitForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const formData = new FormData(form)
    const data = {
      title: formData.get('title'),
      url: formData.get('url'),
      description: formData.get('description'),
      categoryId: formData.get('categoryId'),
      tags: (formData.get('tags') as string).split(',').map((t) => t.trim()).filter(Boolean),
      submitterName: formData.get('submitterName'),
    }

    try {
      const res = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || '提交失败')
      } else {
        setSuccess(true)
        form.reset()
        setTimeout(() => router.push('/'), 2000)
      }
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <p className="text-green-600 text-lg">提交成功！等待管理员审核。</p>
        <p className="text-gray-400 text-sm mt-2">即将返回首页...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">网站名称 *</label>
        <input name="title" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none" placeholder="例如：Figma" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">网址 *</label>
        <input name="url" type="url" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none" placeholder="https://" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">分类 *</label>
        <select name="categoryId" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none bg-white">
          <option value="">选择分类</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
        <input name="tags" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none" placeholder="多个标签用逗号分隔，例如：UI, 原型" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
        <textarea name="description" rows={2} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none" placeholder="一句话描述这个网站" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">你的名字（可选）</label>
        <input name="submitterName" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none" placeholder="匿名" />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
      >
        {loading ? '提交中...' : '提交审核'}
      </button>
    </form>
  )
}
```

- [ ] **Step 4: Create AdminGuard**

`src/components/AdminGuard.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        setAuthed(true)
      } else {
        setError('密码错误')
      }
    } catch {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto py-20">
        <h1 className="text-xl font-bold text-center mb-6">管理员登录</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="输入管理密码"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-colors"
          >
            {loading ? '验证中...' : '登录'}
          </button>
        </form>
      </div>
    )
  }

  return <>{children}</>
}
```

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add src/components/CategoryCard.tsx src/components/TagFilter.tsx src/components/SubmitForm.tsx src/components/AdminGuard.tsx
git commit -m "feat: add CategoryCard, TagFilter, SubmitForm, AdminGuard components"
```

---

### Task 9: Pages — Root Layout & Home

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Update global styles**

Replace `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-50 text-gray-900 antialiased;
}
```

- [ ] **Step 2: Create root layout**

Replace `src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'LostBug - 网站导航',
  description: '收集工作和生活中常用的网站',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Create home page**

Replace `src/app/page.tsx`:

```typescript
import Link from 'next/link'
import { db } from '@/lib/db'
import WebsiteCard from '@/components/WebsiteCard'
import CategoryCard from '@/components/CategoryCard'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [hotWebsites, categories, recentWebsites] = await Promise.all([
    db.website.findMany({
      where: { status: 'approved' },
      include: { category: true, tags: { include: { tag: true } } },
      orderBy: [{ upVotes: 'desc' }, { downVotes: 'asc' }],
      take: 10,
    }),
    db.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { websites: { where: { status: 'approved' } } } } },
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
      {/* Hot websites */}
      {hotWebsites.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4">🔥 热门推荐</h2>
          <div className="space-y-3">
            {hotWebsites.map((site) => (
              <WebsiteCard key={site.id} website={site} />
            ))}
          </div>
        </section>
      )}

      {/* Category grid */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4">📂 分类浏览</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* Recent additions */}
      {recentWebsites.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4">🆕 最新添加</h2>
          <div className="space-y-3">
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

- [ ] **Step 4: Verify page renders**

```bash
npm run dev
# Open http://localhost:3000 — should see Navbar, categories, empty hot/recent sections
```

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx src/app/page.tsx
git commit -m "feat: add root layout and home page"
```

---

### Task 10: Pages — Category & Search & Submit

**Files:**
- Create: `src/app/category/[slug]/page.tsx`
- Create: `src/app/search/page.tsx`
- Create: `src/app/submit/page.tsx`

- [ ] **Step 1: Create category page**

`src/app/category/[slug]/page.tsx`:

```typescript
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import WebsiteCard from '@/components/WebsiteCard'
import TagFilter from '@/components/TagFilter'

export const dynamic = 'force-dynamic'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tag?: string }>
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const { tag: activeTag } = await searchParams

  const category = await db.category.findUnique({
    where: { slug },
    include: {
      websites: {
        where: { status: 'approved' },
        include: { tags: { include: { tag: true } } },
        orderBy: [{ upVotes: 'desc' }, { downVotes: 'asc' }],
      },
    },
  })

  if (!category) notFound()

  // Filter websites by tag if active
  let websites = category.websites
  if (activeTag) {
    websites = websites.filter((w) =>
      w.tags.some(({ tag }) => tag.slug === activeTag)
    )
  }

  // Collect all unique tags from websites in this category
  const tagMap = new Map<string, string>()
  for (const w of category.websites) {
    for (const { tag } of w.tags) {
      tagMap.set(tag.slug, tag.name)
    }
  }
  const tags = Array.from(tagMap.entries()).map(([slug, name]) => ({ slug, name }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{category.name}</h1>
        <p className="text-gray-400 text-sm mt-1">{websites.length} 个网站</p>
      </div>

      {tags.length > 0 && (
        <TagFilter tags={tags} activeTag={activeTag || ''} />
      )}

      <div className="space-y-3">
        {websites.map((site) => (
          <WebsiteCard
            key={site.id}
            website={{ ...site, category: { name: category.name, slug: category.slug } }}
          />
        ))}
        {websites.length === 0 && (
          <p className="text-gray-400 text-center py-12">暂无网站</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create search page**

`src/app/search/page.tsx`:

```typescript
import { db } from '@/lib/db'
import WebsiteCard from '@/components/WebsiteCard'

export const dynamic = 'force-dynamic'

interface SearchPageProps {
  searchParams: Promise<{ q?: string; tag?: string; categoryId?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, tag, categoryId } = await searchParams

  const where: any = { status: 'approved' }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' as const } },
      { description: { contains: q, mode: 'insensitive' as const } },
    ]
  }

  if (tag) {
    where.tags = { some: { tag: { slug: tag } } }
  }

  if (categoryId) {
    where.categoryId = parseInt(categoryId)
  }

  const websites = await db.website.findMany({
    where,
    include: { category: true, tags: { include: { tag: true } } },
    orderBy: [{ upVotes: 'desc' }, { downVotes: 'asc' }],
    take: 50,
  })

  const label = [q && `"${q}"`, tag && `标签: ${tag}`].filter(Boolean).join(' + ')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {label ? `搜索: ${label}` : '搜索'}
        </h1>
        <p className="text-gray-400 text-sm mt-1">{websites.length} 个结果</p>
      </div>

      <div className="space-y-3">
        {websites.map((site) => (
          <WebsiteCard key={site.id} website={site} />
        ))}
        {websites.length === 0 && (
          <p className="text-gray-400 text-center py-12">没有找到相关网站</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create submit page**

`src/app/submit/page.tsx`:

```typescript
import { db } from '@/lib/db'
import SubmitForm from '@/components/SubmitForm'

export const dynamic = 'force-dynamic'

export default async function SubmitPage() {
  const categories = await db.category.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">推荐网站</h1>
      <p className="text-gray-500 text-sm mb-8">
        提交后需要管理员审核才会展示。请确保网站真实有效。
      </p>
      <SubmitForm categories={categories} />
    </div>
  )
}
```

- [ ] **Step 4: Test all pages**

```bash
# Start dev server and browse:
# http://localhost:3000/category/design
# http://localhost:3000/search?q=test
# http://localhost:3000/submit
```

- [ ] **Step 5: Commit**

```bash
git add src/app/category/ src/app/search/ src/app/submit/
git commit -m "feat: add category, search, and submit pages"
```

---

### Task 11: Admin Pages

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/review/page.tsx`
- Create: `src/app/admin/sites/page.tsx`

- [ ] **Step 1: Create admin layout with auth guard**

`src/app/admin/layout.tsx`:

```typescript
import { isAdmin } from '@/lib/auth'
import AdminLoginForm from './AdminLoginForm'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = isAdmin()

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto py-20">
        <h1 className="text-xl font-bold text-center mb-6">管理员登录</h1>
        <AdminLoginForm />
      </div>
    )
  }

  return <>{children}</>
}
```

Create `src/app/admin/AdminLoginForm.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        setError('密码错误')
      }
    } catch {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="输入管理密码"
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
        autoFocus
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-colors"
      >
        {loading ? '验证中...' : '登录'}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Create admin dashboard**

`src/app/admin/page.tsx`:

```typescript
import Link from 'next/link'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
    db.website.count({ where: { status: 'pending' } }),
    db.website.count({ where: { status: 'approved' } }),
    db.website.count({ where: { status: 'rejected' } }),
  ])

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">管理后台</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-700">{pendingCount}</div>
          <div className="text-sm text-yellow-600 mt-1">待审核</div>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-700">{approvedCount}</div>
          <div className="text-sm text-green-600 mt-1">已通过</div>
        </div>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-600">{rejectedCount}</div>
          <div className="text-sm text-gray-500 mt-1">已拒绝</div>
        </div>
      </div>

      <div className="space-y-3">
        <Link
          href="/admin/review"
          className="block p-4 border rounded-lg hover:border-blue-300 hover:shadow transition-all"
        >
          <span className="font-medium">📋 审核提交</span>
          {pendingCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
              {pendingCount} 待处理
            </span>
          )}
        </Link>
        <Link
          href="/admin/sites"
          className="block p-4 border rounded-lg hover:border-blue-300 hover:shadow transition-all"
        >
          <span className="font-medium">📝 管理网站</span>
          <span className="text-gray-400 text-sm ml-2">编辑 / 删除</span>
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create admin review page**

`src/app/admin/review/page.tsx`:

```typescript
import { db } from '@/lib/db'
import ReviewActions from './ReviewActions'

export const dynamic = 'force-dynamic'

export default async function AdminReviewPage() {
  const pending = await db.website.findMany({
    where: { status: 'pending' },
    include: { category: true, tags: { include: { tag: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">审核提交</h1>

      {pending.length === 0 ? (
        <p className="text-gray-400 text-center py-12">没有待审核的提交</p>
      ) : (
        <div className="space-y-4">
          {pending.map((site) => (
            <div key={site.id} className="p-4 border rounded-lg bg-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800">{site.title}</h3>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm break-all"
                  >
                    {site.url}
                  </a>
                  {site.description && (
                    <p className="text-gray-500 text-sm mt-1">{site.description}</p>
                  )}
                  <div className="flex gap-2 mt-2 text-xs text-gray-400">
                    <span>分类: {site.category.name}</span>
                    {site.submitterName && <span>提交者: {site.submitterName}</span>}
                    <span>{new Date(site.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                  {site.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {site.tags.map(({ tag }) => (
                        <span key={tag.slug} className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <ReviewActions siteId={site.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

Create `src/app/admin/review/ReviewActions.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ReviewActions({ siteId }: { siteId: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleReview(status: 'approved' | 'rejected') {
    if (loading) return
    setLoading(true)
    try {
      await fetch('/api/admin/review', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: siteId, status }),
      })
      router.refresh()
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 shrink-0">
      <button
        onClick={() => handleReview('approved')}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        通过
      </button>
      <button
        onClick={() => handleReview('rejected')}
        disabled={loading}
        className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
      >
        拒绝
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Create admin sites management page**

`src/app/admin/sites/page.tsx`:

```typescript
import Link from 'next/link'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function AdminSitesPage() {
  const websites = await db.website.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const statusLabel: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
  }

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">管理网站</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-400">
              <th className="pb-2 font-medium">网站</th>
              <th className="pb-2 font-medium">分类</th>
              <th className="pb-2 font-medium">状态</th>
              <th className="pb-2 font-medium">投票</th>
              <th className="pb-2 font-medium">时间</th>
            </tr>
          </thead>
          <tbody>
            {websites.map((site) => (
              <tr key={site.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-3">
                  <div className="font-medium text-gray-800">{site.title}</div>
                  <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs">
                    {new URL(site.url).hostname}
                  </a>
                </td>
                <td className="py-3 text-gray-600">{site.category.name}</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor[site.status]}`}>
                    {statusLabel[site.status]}
                  </span>
                </td>
                <td className="py-3 text-gray-600">
                  ▲{site.upVotes} ▼{site.downVotes}
                </td>
                <td className="py-3 text-gray-400 text-xs">
                  {new Date(site.createdAt).toLocaleDateString('zh-CN')}
                </td>
              </tr>
            ))}
            {websites.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400">暂无网站</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Test admin flow**

```bash
# Visit http://localhost:3000/admin
# Enter admin password, verify dashboard loads
# Go to /admin/review, verify review actions work
# Go to /admin/sites, verify site list shows
```

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/
git commit -m "feat: add admin pages - dashboard, review, sites management"
```

---

### Task 12: Final Polish & Seed

**Files:**
- Modify: `prisma/seed.ts` (add sample websites)

- [ ] **Step 1: Update seed script with sample data**

Add to `prisma/seed.ts` after category seeding:

```typescript
const sampleSites = [
  { title: 'Figma', url: 'https://www.figma.com', description: '协作式界面设计工具', category: 'design', tags: ['UI', '原型'] },
  { title: 'GitHub', url: 'https://github.com', description: '代码托管与协作平台', category: 'dev', tags: ['代码', '协作'] },
  { title: 'Notion', url: 'https://www.notion.so', description: '多功能笔记与知识管理', category: 'productivity', tags: ['笔记', '协作'] },
]

for (const site of sampleSites) {
  const category = await prisma.category.findUnique({ where: { slug: site.category } })
  if (!category) continue
  await prisma.website.upsert({
    where: { url: site.url },
    update: {},
    create: {
      title: site.title,
      url: site.url,
      description: site.description,
      categoryId: category.id,
      status: 'approved',
      upVotes: Math.floor(Math.random() * 20) + 1,
      tags: {
        create: site.tags.map(tagName => ({
          tag: {
            connectOrCreate: {
              where: { slug: tagName.toLowerCase() },
              create: { name: tagName, slug: tagName.toLowerCase() },
            },
          },
        })),
      },
    },
  })
}
console.log('Seeded sample websites')
```

- [ ] **Step 2: Run seed**

```bash
npx prisma db seed
```

- [ ] **Step 3: Full smoke test**

```bash
npm run build
# Should build without errors

npm run dev
# Test all routes:
# / — home page with seeded data
# /category/design — category page
# /search?q=Figma — search
# /submit — submission form
# /admin — admin login and dashboard
```

- [ ] **Step 4: Verify .gitignore covers everything**

Ensure `.gitignore` includes:
```
.env
.env.local
node_modules/
.next/
.superpowers/
```

- [ ] **Step 5: Final commit**

```bash
git add prisma/seed.ts .gitignore
git commit -m "feat: update seed data and finalize project"
```

---

## Post-Implementation: Deployment

After all tasks are complete, deployment steps:

1. Set up PostgreSQL on cloud provider (阿里云 RDS or 腾讯云)
2. Create轻量应用服务器, install Node.js 20+
3. Clone repo, copy `.env` with real credentials
4. Run `npm install && npx prisma migrate deploy && npx prisma db seed && npm run build`
5. Configure Nginx reverse proxy to `localhost:3000`
6. Set up PM2: `pm2 start npm --name "lostbug" -- start && pm2 save`
7. Set up SSL certificate (Let's Encrypt or cloud provider)
8. Bind domain (requires ICP备案)
