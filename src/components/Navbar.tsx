import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-full mx-auto px-4 h-14 flex items-center gap-4">
        <Link href="/" className="font-bold text-lg text-gray-800 shrink-0">
          LostBug
        </Link>

        <form action="/search" className="ml-auto max-w-md">
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
