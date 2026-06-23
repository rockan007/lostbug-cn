import Link from 'next/link'
import { db } from '@/lib/db'

export default async function Navbar() {
  const categories = await db.category.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link href="/" className="font-bold text-lg text-gray-800 shrink-0">
          LostBug
        </Link>

        <div className="relative group">
          <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
            分类 ▾
          </button>
          <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all min-w-[160px]">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

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
