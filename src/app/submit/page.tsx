import { db } from '@/lib/db'
import SubmitForm from '@/components/SubmitForm'

export const dynamic = 'force-dynamic'

export default async function SubmitPage() {
  const categories = await db.category.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">推荐网站</h1>
      <p className="text-gray-500 text-sm mb-8">
        提交后需要管理员审核才会展示。请确保网站真实有效。
      </p>
      <SubmitForm categories={categories} />
    </div>
  )
}
