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
        <Navbar />
        <div className="flex flex-1 min-h-0 relative">
          <div className="hidden lg:block absolute left-0 top-0 h-full w-12 bg-gray-50 border-r overflow-y-auto z-30" />
          <main className="flex-1 min-w-0 overflow-y-auto">
            <div className="max-w-6xl mx-auto px-4 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    )
  }

    return (
      <div className="h-screen overflow-hidden flex flex-col">
        <Navbar onToggleSidebar={toggleSidebar} />
        <div className="flex flex-1 min-h-0 relative">
          <Sidebar
            categories={categories}
            open={sidebarOpen}
            onToggle={toggleSidebar}
          />
          <main className="flex-1 min-w-0 overflow-y-auto">
            <div className="max-w-6xl mx-auto px-4 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    )
}
