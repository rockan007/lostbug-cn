# Website Favicon Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add favicon icons to website cards — auto-discover favicon on submission, show icon or fallback letter avatar in the card.

**Architecture:** New `src/lib/favicon.ts` discovers favicon URLs (HEAD /favicon.ico → parse HTML `<link rel="icon">`). `POST /api/websites` calls it during submission with a 5-second timeout. `WebsiteCard` renders `<img>` if favicon exists, otherwise shows a domain-initial letter avatar.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS v4 (no new dependencies needed).

## Global Constraints

- Favicon discovery must timeout at 5 seconds, never block or fail the submission
- Display: 32x32px favicon image, or domain-initial letter avatar as fallback
- No new npm dependencies

---

### Task 1: Favicon Discovery Library

**Files:**
- Create: `src/lib/favicon.ts`

**Interfaces:**
- Produces: `async function discoverFavicon(url: string): Promise<string>` — takes a website URL, returns a favicon URL string (or empty string if not found).

- [ ] **Step 1: Create `src/lib/favicon.ts`**

```typescript
export async function discoverFavicon(websiteUrl: string): Promise<string> {
  try {
    const parsed = new URL(websiteUrl)
    const baseUrl = `${parsed.protocol}//${parsed.hostname}`

    // Step 1: Try HEAD /favicon.ico with 5s timeout
    const faviconUrl = `${baseUrl}/favicon.ico`
    const headOk = await headRequest(faviconUrl, 5000)
    if (headOk) return faviconUrl

    // Step 2: Fetch homepage HTML and parse <link rel="icon">
    const html = await fetchHtml(baseUrl, 5000)
    if (!html) return ''

    const iconHref = parseIconLink(html, baseUrl)
    if (iconHref) {
      // Verify the parsed icon URL is reachable
      const iconOk = await headRequest(iconHref, 3000)
      if (iconOk) return iconHref
    }

    return ''
  } catch {
    return ''
  }
}

async function headRequest(url: string, timeoutMs: number): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal })
    clearTimeout(timer)
    return res.ok
  } catch {
    return false
  }
}

async function fetchHtml(url: string, timeoutMs: number): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

function parseIconLink(html: string, baseUrl: string): string | null {
  // Match <link rel="icon" href="..."> or <link rel="shortcut icon" href="...">
  const regex = /<link[^>]*\brel=["'](?:shortcut\s+)?icon["'][^>]*\bhref=["']([^"']+)["']/i
  const match = html.match(regex)
  if (!match) return null

  const href = match[1]
  // Resolve relative URLs
  try {
    return new URL(href, baseUrl).href
  } catch {
    return null
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/anqi/projects/lostbug-cn && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/favicon.ts
git commit -m "feat: add favicon discovery library"
```

---

### Task 2: Integrate Favicon into Submission and Display

**Files:**
- Modify: `src/app/api/websites/route.ts` — POST handler
- Modify: `src/components/WebsiteCard.tsx` — add favicon/avatar rendering

**Interfaces:**
- Consumes: `discoverFavicon(url: string): Promise<string>` from Task 1
- Produces: `Website.favicon` field populated on submission; `WebsiteCard` renders icon

- [ ] **Step 1: Update POST /api/websites to discover favicon**

Edit `src/app/api/websites/route.ts` — add import at line 2:

```typescript
import { discoverFavicon } from '@/lib/favicon'
```

After line 58 (`upVotes: 1,`), add the favicon field. The create data block should include:

```typescript
      favicon: await discoverFavicon(url),
```

Insert at line 58, right after `upVotes: 1,`:

The full create object becomes:
```typescript
      upVotes: 1,
      favicon: await discoverFavicon(url),
```

- [ ] **Step 2: Update WebsiteCard to render favicon or letter avatar**

Replace `src/components/WebsiteCard.tsx`:

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
  const initial = hostname.charAt(0).toUpperCase()

  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow bg-white">
      <VoteButtons
        websiteId={website.id}
        upVotes={website.upVotes}
        downVotes={website.downVotes}
      />
      {/* Favicon or letter avatar */}
      <div className="shrink-0 mt-0.5">
        {website.favicon ? (
          <img
            src={website.favicon}
            alt=""
            width={32}
            height={32}
            className="w-8 h-8 rounded"
            onError={(e) => {
              // Hide broken img so letter avatar takes over via CSS sibling
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : null}
        <div className={`w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center ${website.favicon ? 'hidden' : ''}`}
          style={website.favicon ? { display: 'none' } : undefined}>
          {initial}
        </div>
      </div>
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

Key changes:
- Added a 32x32 icon slot between VoteButtons and content
- If `favicon` is a URL, shows `<img>` with `onError` handler
- If `favicon` is empty or img fails, shows a blue circle with the domain's first letter
- The letter avatar starts hidden when favicon is present; `onError` hides the broken img, revealing the avatar behind it

- [ ] **Step 3: Verify TypeScript and build**

```bash
cd /Users/anqi/projects/lostbug-cn && npx tsc --noEmit && npm run build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/websites/route.ts src/components/WebsiteCard.tsx
git commit -m "feat: auto-discover favicon on submit, render icon in website cards"
```

---

### Task 3: Update Seed Data and Verify End-to-End

**Files:**
- Modify: `prisma/seed.ts`

**Interfaces:**
- Consumes: `Website.favicon` field (already exists in schema)

- [ ] **Step 1: Add favicon URLs to seed data**

Edit `prisma/seed.ts` — each sample site object gets a `favicon` field:

```typescript
const sampleSites = [
  { title: 'Figma', url: 'https://www.figma.com', description: '协作式界面设计工具', category: 'design', tags: ['UI', '原型'], favicon: 'https://www.figma.com/favicon.ico' },
  { title: 'GitHub', url: 'https://github.com', description: '代码托管与协作平台', category: 'dev', tags: ['代码', '协作'], favicon: 'https://github.com/favicon.ico' },
  { title: 'Notion', url: 'https://www.notion.so', description: '多功能笔记与知识管理', category: 'productivity', tags: ['笔记', '协作'], favicon: 'https://www.notion.so/favicon.ico' },
  { title: 'Canva', url: 'https://www.canva.com', description: '在线平面设计工具', category: 'design', tags: ['设计', '模板'], favicon: 'https://www.canva.com/favicon.ico' },
  { title: 'MDN', url: 'https://developer.mozilla.org', description: 'Web 开发技术文档', category: 'dev', tags: ['文档', '前端'], favicon: 'https://developer.mozilla.org/favicon.ico' },
  { title: '掘金', url: 'https://juejin.cn', description: '开发者技术社区', category: 'dev', tags: ['社区', '文章'], favicon: 'https://juejin.cn/favicon.ico' },
  { title: 'InfoQ', url: 'https://www.infoq.cn', description: '技术资讯与行业动态', category: 'news', tags: ['技术', '资讯'], favicon: 'https://www.infoq.cn/favicon.ico' },
  { title: '豆瓣', url: 'https://www.douban.com', description: '图书电影音乐社区', category: 'life', tags: ['书籍', '电影'], favicon: 'https://www.douban.com/favicon.ico' },
]
```

Update the create object in the `upsert` call to include `favicon`:

At line 42, add inside `create: {`:
```typescript
        favicon: site.favicon,
```

- [ ] **Step 2: Re-seed the database**

```bash
cd /Users/anqi/projects/lostbug-cn && npx prisma db seed
```

Expected: "Seeded sample websites" and "Seeded categories" printed.

- [ ] **Step 3: Manual verification**

```bash
npm run dev
```

Browse to http://localhost:3000 and verify:
- Each website card shows either a favicon image or a blue letter avatar
- Figma, GitHub, Notion etc. should show their actual favicons
- The fallback letter avatar appears for sites without favicon

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat: add favicon URLs to seed data"
```
