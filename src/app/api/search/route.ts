import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') || ''
  const categoryId = request.nextUrl.searchParams.get('categoryId')
  const tagSlug = request.nextUrl.searchParams.get('tag')

  if (!q && !categoryId && !tagSlug) {
    return NextResponse.json([])
  }

  const where: any = { status: 'approved' }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ]
  }

  if (categoryId) {
    where.categoryId = parseInt(categoryId)
  }

  if (tagSlug) {
    where.tags = { some: { tag: { slug: tagSlug } } }
  }

  const websites = await db.website.findMany({
    where,
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
    orderBy: [{ upVotes: 'desc' }, { downVotes: 'asc' }],
    take: 50,
  })

  return NextResponse.json(websites)
}
