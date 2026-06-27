# 左侧分类导航侧边栏 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将分类从首页网格移至可折叠左侧侧边栏，提供持久分类导航。

**Architecture:** Layout 服务端获取分类数据，传给客户端 `LayoutShell` 组件管理侧边栏状态。`LayoutShell` 渲染 Navbar + Sidebar + main。侧边栏使用 `useState` + `localStorage` 管理折叠状态。

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v4, React 19 (useState, useEffect)

## Global Constraints

- Tailwind CSS v4 类名样式
- Next.js 16 App Router，layout 为服务端组件
- 侧边栏 1024px+ 展开，1024px 以下通过 overlay 展示
- 折叠状态持久化到 localStorage，SSR 默认展开
- 移除首页"📂 分类浏览"区域
- 分类页 `/category/[slug]` 不变
- 所有 API 不变

---

### Task 1: 创建 Sidebar 组件

**Files:**
- Create: `src/components/Sidebar.tsx`

**Interfaces:**
- Consumes: 无
- Produces: `Sidebar({ categories, open, onToggle }: { categories: Array<{ name: string; slug: string; count: number }>; open: boolean; onToggle: () => void })` — 客户端组件，根据 `open` 显示展开/折叠状态

- [ ] **Step 1: 编写 Sidebar 组件**

```typescript
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Category {
  name: string
  slug: string
  count: number
}

export default function Sidebar({
  categories,
  open,
  onToggle,
}: {
  categories: Category[]
  open: boolean
  onToggle: () => void
}) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // Avoid hydration mismatch: render collapsed until mounted
  if (!mounted) {
    return (
      <aside className="hidden lg:block w-12 shrink-0 border-r bg-gray-50 min-h-[calc(100vh-3.5rem)]" />
    )
  }

  if (!open) {
    return (
      <aside className="hidden lg:flex flex-col items-center w-12 shrink-0 border-r bg-gray-50 min-h-[calc(100vh-3.5rem)] pt-3">
        <button
          onClick={onToggle}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-500"
          aria-label="展开侧边栏"
        >
          ☰
        </button>
      </aside>
    )
  }

  return (
    <aside className="hidden lg:flex flex-col w-48 shrink-0 border-r bg-gray-50 p-3 gap-0.5 min-h-[calc(100vh-3.5rem)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase">导航</span>
        <button
          onClick={onToggle}
          className="p-1 rounded hover:bg-gray-200 text-gray-400 text-sm"
          aria-label="折叠侧边栏"
        >
          ✕
        </button>
      </div>

      <Link
        href="/"
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
          pathname === '/' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        🔥 热门推荐
      </Link>

      <div className="mt-2 mb-1">
        <span className="text-xs font-semibold text-gray-400 uppercase px-3">分类</span>
      </div>

      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/category/${cat.slug}`}
          className={`flex items-center justify-between px-3 py-1.5 text-sm rounded-md transition-colors ${
            pathname === `/category/${cat.slug}`
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span>{cat.name}</span>
          <span className="text-xs text-gray-400 tabular-nums">{cat.count}</span>
        </Link>
      ))}
    </aside>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/Sidebar.tsx
git commit -m "feat: add Sidebar component with categories and hot link"
```

---

### Task 2: 创建 LayoutShell 客户端组件，修改 Layout

**Files:**
- Create: `src/components/LayoutShell.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: Sidebar 组件 (from Task 1)
- Produces: `LayoutShell({ categories, children }: { categories: SidebarCategory[]; children: React.ReactNode })` — 管理 `sidebarOpen` state，通过 prop 传给 Navbar 和 Sidebar

- [ ] **Step 1: 编写 LayoutShell 组件**

```typescript
'use client'

import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

interface Category {
  name: string
  slug: string
  count: number
}

export default function LayoutShell({
  categories,
  children,
}: {
  categories: Category[]
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-open')
    if (stored !== null) {
      setSidebarOpen(stored === 'true')
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebar-open', String(sidebarOpen))
    }
  }, [sidebarOpen, mounted])

  const toggleSidebar = () => setSidebarOpen((prev) => !prev)

  return (
    <>
      <Navbar onToggleSidebar={toggleSidebar} />
      <div className="flex">
        <Sidebar
          categories={categories}
          open={sidebarOpen}
          onToggle={toggleSidebar}
        />
        <main className="flex-1 min-w-0 max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </>
  )
}
```

- [ ] **Step 2: 修改 Layout.tsx**

将 `src/app/layout.tsx` 改为：

```typescript
import type { Metadata } from 'next'
import './globals.css'
import LayoutShell from '@/components/LayoutShell'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'LostBug - 网站导航',
  description: '收集工作和生活中常用的网站',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await db.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { websites: { where: { status: 'approved' } } } } },
  })

  const sidebarCategories = categories.map((cat) => ({
    name: cat.name,
    slug: cat.slug,
    count: cat._count.websites,
  }))

  return (
    <html lang="zh-CN">
      <body>
        <LayoutShell categories={sidebarCategories}>
          {children}
        </LayoutShell>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/components/LayoutShell.tsx src/app/layout.tsx
git commit -m "feat: add LayoutShell client component with sidebar state management"
```

---

### Task 3: 修改 Navbar — 移除分类下拉，添加折叠按钮

**Files:**
- Modify: `src/components/Navbar.tsx`

**Interfaces:**
- Consumes: 无新增依赖
- Produces: Navbar 接受可选 `onToggleSidebar?: () => void` prop

- [ ] **Step 1: 修改 Navbar**

```typescript
import Link from 'next/link'

export default function Navbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-full mx-auto px-4 h-14 flex items-center gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hidden lg:block"
            aria-label="切换侧边栏"
          >
            ☰
          </button>
        )}

        <Link href="/" className="font-bold text-lg text-gray-800 shrink-0">
          LostBug
        </Link>

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

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "feat: replace category dropdown with sidebar toggle button in Navbar"
```

---

### Task 4: 移除首页分类网格

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: 无新增
- Produces: HomePage 不再查询 categories，不渲染分类网格

- [ ] **Step 1: 修改 HomePage**

`src/app/page.tsx` 修改为：

```typescript
import { db } from '@/lib/db'
import WebsiteCard from '@/components/WebsiteCard'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [hotWebsites, recentWebsites] = await Promise.all([
    db.website.findMany({
      where: { status: 'approved' },
      include: { category: true, tags: { include: { tag: true } } },
      orderBy: [{ upVotes: 'desc' }, { downVotes: 'asc' }],
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

变更点：
- 移除 `CategoryCard` import
- 移除 `categories` 查询
- 移除"📂 分类浏览"section
- `Promise.all` 从 3 项减为 2 项

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "refactor: remove category grid from homepage, now in sidebar"
```

---

### Task 5: 集成验证

**Files:**
- 无新建或修改，浏览器验证整体效果

**Interfaces:**
- 验证全部 4 个组件的集成

- [ ] **Step 1: 启动 dev server 验证**

Run: `npm run dev`
打开 `http://localhost:3000`，验证：
- 左侧侧边栏显示分类列表 + 热门推荐链接
- 侧边栏可折叠/展开，状态刷新后保留
- 首页不再显示分类网格
- 点击分类跳转 `/category/:slug`
- 点击"热门推荐"回到首页
- Navbar 中不再有"分类 ▾"下拉

- [ ] **Step 2: 修复发现的问题（如有）**

- [ ] **Step 3: 提交最终修复**

```bash
git add -A
git commit -m "fix: sidebar integration polish"
```
