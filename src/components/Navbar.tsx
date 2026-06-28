'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

export default function Navbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-full mx-auto px-4 h-14 flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 rounded hover:bg-gray-100 text-gray-600 shrink-0"
          aria-label="打开菜单"
        >
          ☰
        </button>
        <Link href="/" className="font-bold text-lg text-gray-800 shrink-0">
          LostBug
        </Link>

        <form action="/search" className="ml-auto max-w-md relative">
          <input
            ref={inputRef}
            type="text"
            name="q"
            placeholder="搜索网站..."
            className="w-full px-3 py-1.5 pr-12 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 border border-gray-300 rounded px-1.5 py-0.5 pointer-events-none">
            ⌘K
          </kbd>
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
