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

      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4">📂 分类浏览</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

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
