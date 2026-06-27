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
