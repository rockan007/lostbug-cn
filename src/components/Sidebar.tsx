'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Category {
  name: string
  slug: string
  count: number
}

const ICONS: Record<string, string> = {
  design: '🎨',
  dev: '💻',
  productivity: '⚡',
  learning: '📚',
  news: '📰',
  life: '🏠',
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

  if (!mounted) {
    return (
      <div className="hidden lg:block absolute left-0 top-0 h-full w-12 bg-gray-50 border-r overflow-y-auto z-30" />
    )
  }

  // Collapsed: icon strip along the left edge
  if (!open) {
    return (
      <aside className="hidden lg:flex flex-col items-center absolute left-0 top-0 h-full w-12 bg-gray-50 border-r overflow-y-auto z-30 pt-2 gap-1">
        <button
          onClick={onToggle}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-500 mb-1"
          aria-label="展开侧边栏"
        >
          ☰
        </button>
        <Link
          href="/"
          className={`p-1.5 rounded text-sm ${
            pathname === '/' ? 'bg-blue-50' : 'hover:bg-gray-100'
          }`}
          title="热门推荐"
        >
          🔥
        </Link>
        <div className="w-6 border-t border-gray-200 my-1" />
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className={`p-1.5 rounded text-sm ${
              pathname === `/category/${cat.slug}` ? 'bg-blue-50' : 'hover:bg-gray-100'
            }`}
            title={cat.name}
          >
            {ICONS[cat.slug] ?? '📌'}
          </Link>
        ))}
      </aside>
    )
  }

  // Expanded: overlay panel with collapse button at top right
  return (
    <aside className="hidden lg:flex flex-col absolute left-0 top-0 h-full w-48 bg-gray-50 border-r shadow-lg overflow-y-auto z-30 p-3 gap-0.5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase">导航</span>
        <button
          onClick={onToggle}
          className="p-1 rounded hover:bg-gray-200 text-gray-400 text-sm"
          aria-label="折叠侧边栏"
        >
          ☰
        </button>
      </div>

      <Link
        href="/"
        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
          pathname === '/' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <span>🔥</span>
        <span>热门推荐</span>
      </Link>

      <div className="mt-2 mb-1">
        <span className="text-xs font-semibold text-gray-400 uppercase px-3">分类</span>
      </div>

      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/category/${cat.slug}`}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
            pathname === `/category/${cat.slug}`
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span>{ICONS[cat.slug] ?? '📌'}</span>
          <span className="flex-1">{cat.name}</span>
          <span className="text-xs text-gray-400 tabular-nums">{cat.count}</span>
        </Link>
      ))}
    </aside>
  )
}
