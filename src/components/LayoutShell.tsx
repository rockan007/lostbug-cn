'use client'

import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

interface Category {
  name: string
  slug: string
  count: number
}

export default function LayoutShell({
  categories,
  children,
}: {
  categories: Category[]
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-open')
    if (stored !== null) {
      setSidebarOpen(stored === 'true')
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebar-open', String(sidebarOpen))
    }
  }, [sidebarOpen, mounted])

  const toggleSidebar = () => setSidebarOpen((prev) => !prev)

  if (!mounted) {
    // SSR placeholder — no sidebar flash
    return (
      <div className="h-screen overflow-hidden flex flex-col">
        <Navbar onMenuToggle={() => setMobileMenuOpen(prev => !prev)} />
        <div className="flex flex-1 min-h-0">
          <div className="hidden lg:block relative flex-shrink-0 h-full w-12 bg-gray-50 border-r overflow-y-auto" />
          <main className="flex-1 min-w-0 overflow-y-auto">
            <div className="max-w-6xl mx-auto px-4 py-8">
              {children}
            </div>
          </main>
        </div>
        <footer className="shrink-0 bg-white border-t py-2 text-center">
          <a
            href="https://beian.miit.gov.cn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-gray-500"
          >
            鲁ICP备2024092947号-1
          </a>
        </footer>
      </div>
    )
  }

    return (
      <div className="h-screen overflow-hidden flex flex-col">
        <Navbar onMenuToggle={() => setMobileMenuOpen(prev => !prev)} />
        <div className="flex flex-1 min-h-0">
          <Sidebar
            categories={categories}
            open={sidebarOpen}
            onToggle={toggleSidebar}
            mobileOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          />
          <main className="flex-1 min-w-0 overflow-y-auto">
            <div className="max-w-6xl mx-auto px-4 py-8">
              {children}
            </div>
          </main>
        </div>
        <footer className="shrink-0 bg-white border-t py-2 text-center">
          <a
            href="https://beian.miit.gov.cn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-gray-500"
          >
            鲁ICP备2024092947号-1
          </a>
        </footer>
      </div>
    )
}
