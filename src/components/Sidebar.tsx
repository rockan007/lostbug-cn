'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Category {
  name: string
  slug: string
  count: number
}

export default function Sidebar({
  categories,
  open,
  onToggle,
}: {
  categories: Category[]
  open: boolean
  onToggle: () => void
}) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // Avoid hydration mismatch: render collapsed placeholder until mounted
  if (!mounted) {
    return (
      <aside className="hidden lg:block w-12 shrink-0 border-r bg-gray-50 overflow-y-auto" />
    )
  }

  if (!open) {
    return (
      <aside className="hidden lg:flex flex-col items-center w-12 shrink-0 border-r bg-gray-50 overflow-y-auto pt-3">
        <button
          onClick={onToggle}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-500"
          aria-label="展开侧边栏"
        >
          ☰
        </button>
      </aside>
    )
  }

  return (
    <aside className="hidden lg:flex flex-col w-48 shrink-0 border-r bg-gray-50 p-3 gap-0.5 overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase">导航</span>
        <button
          onClick={onToggle}
          className="p-1 rounded hover:bg-gray-200 text-gray-400 text-sm"
          aria-label="折叠侧边栏"
        >
          ✕
        </button>
      </div>

      <Link
        href="/"
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
          pathname === '/' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        🔥 热门推荐
      </Link>

      <div className="mt-2 mb-1">
        <span className="text-xs font-semibold text-gray-400 uppercase px-3">分类</span>
      </div>

      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/category/${cat.slug}`}
          className={`flex items-center justify-between px-3 py-1.5 text-sm rounded-md transition-colors ${
            pathname === `/category/${cat.slug}`
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span>{cat.name}</span>
          <span className="text-xs text-gray-400 tabular-nums">{cat.count}</span>
        </Link>
      ))}
    </aside>
  )
}
