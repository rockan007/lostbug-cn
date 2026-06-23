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
