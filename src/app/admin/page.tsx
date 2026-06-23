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
