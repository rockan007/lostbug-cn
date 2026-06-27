'use client'

import { useState } from 'react'
import Link from 'next/link'

interface WebsiteCardProps {
  website: {
    id: number
    title: string
    url: string
    description: string
    favicon: string
    jumpCount: number
    category: { name: string; slug: string }
    tags: { tag: { name: string; slug: string } }[]
  }
}

export default function WebsiteCard({ website }: WebsiteCardProps) {
  const [imgError, setImgError] = useState(false)
  let hostname: string
  try {
    hostname = new URL(website.url).hostname
  } catch {
    hostname = website.url
  }
  const initial = hostname.charAt(0).toUpperCase()

  function handleClick() {
    navigator.sendBeacon?.(`/api/websites/${website.id}/jump`)
  }

  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow bg-white">
      {/* Favicon or letter avatar */}
      <div className="shrink-0 mt-0.5">
        {website.favicon && !imgError ? (
          <img
            src={website.favicon}
            alt=""
            width={32}
            height={32}
            className="w-8 h-8 rounded"
            onError={() => setImgError(true)}
          />
        ) : null}
        <div className={`w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center ${!website.favicon || imgError ? '' : 'hidden'}`}
          style={!website.favicon || imgError ? undefined : { display: 'none' }}>
          {initial}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <a
          href={website.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="text-blue-600 hover:underline font-medium"
        >
          {website.title}
        </a>
        <span className="text-gray-400 text-sm ml-2">{hostname}</span>
        {website.description && (
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{website.description}</p>
        )}
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Link
            href={`/category/${website.category.slug}`}
            className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100"
          >
            {website.category.name}
          </Link>
          {website.tags.map(({ tag }) => (
            <Link
              key={tag.slug}
              href={`/search?tag=${tag.slug}`}
              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      </div>
      {/* Jump count display */}
      <div className="flex items-center gap-1 text-sm text-gray-400 shrink-0">
        <span className="font-medium tabular-nums">{website.jumpCount}</span>
        <span className="text-xs">次访问</span>
      </div>
    </div>
  )
}
