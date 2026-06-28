'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const router = useRouter()

  // Desktop ⌘K shortcut — focus inline search
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

  // Mobile search modal — auto focus + Esc to close
  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus()
      function handleKeyDown(e: KeyboardEvent) {
        if (e.key === 'Escape') setSearchOpen(false)
      }
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [searchOpen])

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = searchInputRef.current?.value.trim()
    if (q) {
      setSearchOpen(false)
      router.push(`/search?q=${encodeURIComponent(q)}`)
    }
  }

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

        {/* Desktop search */}
        <form action="/search" className="ml-auto max-w-md relative hidden lg:block">
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

        {/* Mobile search icon */}
        <button
          onClick={() => setSearchOpen(true)}
          className="ml-auto lg:hidden p-1.5 rounded hover:bg-gray-100 text-gray-600 shrink-0"
          aria-label="搜索"
        >
          🔍
        </button>

        <Link
          href="/submit"
          className="px-3 lg:px-4 py-1.5 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shrink-0"
        >
          +<span className="hidden lg:inline"> 推荐网站</span>
        </Link>
      </div>

      {/* Mobile search modal */}
      {searchOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setSearchOpen(false)}
          />
          <div className="fixed inset-x-0 top-24 z-50 flex justify-center">
            <div className="bg-white rounded-xl shadow-2xl w-[90vw] max-w-md p-4">
              <form onSubmit={handleSearchSubmit}>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="搜索网站..."
                  className="w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                />
              </form>
              <p className="text-xs text-gray-400 mt-2 text-center">
                输入关键词搜索网站
              </p>
            </div>
          </div>
        </>
      )}
    </nav>
  )
}
