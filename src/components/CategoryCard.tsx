import Link from 'next/link'

interface CategoryCardProps {
  category: {
    name: string
    slug: string
    _count: { websites: number }
  }
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="block p-6 border rounded-xl hover:shadow-md hover:border-blue-300 transition-all bg-white"
    >
      <h3 className="font-semibold text-gray-800">{category.name}</h3>
      <p className="text-sm text-gray-400 mt-1">{category._count.websites} 个网站</p>
    </Link>
  )
}
