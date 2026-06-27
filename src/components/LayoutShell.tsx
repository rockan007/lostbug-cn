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
      <>
        <Navbar />
        <div className="flex">
          <div className="hidden lg:block w-12 shrink-0 border-r bg-gray-50 min-h-[calc(100vh-3.5rem)]" />
          <main className="flex-1 min-w-0 max-w-6xl mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar onToggleSidebar={toggleSidebar} />
      <div className="flex">
        <Sidebar
          categories={categories}
          open={sidebarOpen}
          onToggle={toggleSidebar}
        />
        <main className="flex-1 min-w-0 max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </>
  )
}
