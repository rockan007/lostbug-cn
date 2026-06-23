'use client'

import { useState } from 'react'

interface VoteButtonsProps {
  websiteId: number
  upVotes: number
  downVotes: number
}

export default function VoteButtons({ websiteId, upVotes, downVotes }: VoteButtonsProps) {
  const [votes, setVotes] = useState({ up: upVotes, down: downVotes })
  const [loading, setLoading] = useState(false)

  async function handleVote(voteType: 'up' | 'down') {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/websites/${websiteId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      })
      if (res.ok) {
        const data = await res.json()
        setVotes({ up: data.upVotes, down: data.downVotes })
      }
    } catch (e) {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => handleVote('up')}
        className="px-1.5 py-0.5 rounded hover:bg-green-100 transition-colors"
        aria-label="Upvote"
      >
        ▲
      </button>
      <span className="font-medium min-w-[2ch] text-center">{votes.up - votes.down}</span>
      <button
        onClick={() => handleVote('down')}
        className="px-1.5 py-0.5 rounded hover:bg-red-100 transition-colors"
        aria-label="Downvote"
      >
        ▼
      </button>
    </div>
  )
}
