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
