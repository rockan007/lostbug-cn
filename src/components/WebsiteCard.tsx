import Link from 'next/link'
import VoteButtons from './VoteButtons'

interface WebsiteCardProps {
  website: {
    id: number
    title: string
    url: string
    description: string
    favicon: string
    upVotes: number
    downVotes: number
    category: { name: string; slug: string }
    tags: { tag: { name: string; slug: string } }[]
  }
}

export default function WebsiteCard({ website }: WebsiteCardProps) {
  const hostname = new URL(website.url).hostname

  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow bg-white">
      <VoteButtons
        websiteId={website.id}
        upVotes={website.upVotes}
        downVotes={website.downVotes}
      />
      <div className="flex-1 min-w-0">
        <a
          href={website.url}
          target="_blank"
          rel="noopener noreferrer"
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
    </div>
  )
}
