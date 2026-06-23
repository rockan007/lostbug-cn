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
