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

  let websites = category.websites
  if (activeTag) {
    websites = websites.filter((w) =>
      w.tags.some(({ tag }) => tag.slug === activeTag)
    )
  }

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
