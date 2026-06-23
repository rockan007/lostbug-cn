'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface TagFilterProps {
  tags: { name: string; slug: string }[]
  activeTag: string
}

export default function TagFilter({ tags, activeTag }: TagFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleTagClick(slug: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (params.get('tag') === slug) {
      params.delete('tag')
    } else {
      params.set('tag', slug)
    }
    router.push(`?${params.toString()}`)
  }

  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <button
          key={tag.slug}
          onClick={() => handleTagClick(tag.slug)}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            tag.slug === activeTag
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {tag.name}
        </button>
      ))}
    </div>
  )
}
