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
