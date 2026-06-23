'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ReviewActions({ siteId }: { siteId: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleReview(status: 'approved' | 'rejected') {
    if (loading) return
    setLoading(true)
    try {
      await fetch('/api/admin/review', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: siteId, status }),
      })
      router.refresh()
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 shrink-0">
      <button
        onClick={() => handleReview('approved')}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        通过
      </button>
      <button
        onClick={() => handleReview('rejected')}
        disabled={loading}
        className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
      >
        拒绝
      </button>
    </div>
  )
}
