import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { discoverFavicon } from '@/lib/favicon'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get('status') || 'approved'
  const categoryId = request.nextUrl.searchParams.get('categoryId')
  const sort = request.nextUrl.searchParams.get('sort') || 'jumps'
  const page = parseInt(request.nextUrl.searchParams.get('page') || '1')
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20')

  const where: any = { status }
  if (categoryId) where.categoryId = parseInt(categoryId)

  const orderBy: any = sort === 'newest'
    ? { createdAt: 'desc' as const }
    : { jumpCount: 'desc' as const }

  const [websites, total] = await Promise.all([
    db.website.findMany({
      where,
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.website.count({ where }),
  ])

  return NextResponse.json({ websites, total, page, limit })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, url, description, categoryId, tags, submitterName } = body

  if (!title || !url || !categoryId) {
    return NextResponse.json({ error: 'title, url, categoryId are required' }, { status: 400 })
  }

  const existing = await db.website.findUnique({ where: { url } })
  if (existing) {
    return NextResponse.json({ error: 'This URL already exists' }, { status: 409 })
  }

  const website = await db.website.create({
    data: {
      title,
      url,
      description: description || '',
      categoryId: parseInt(categoryId),
      submitterName: submitterName || '',
      status: 'pending',
      jumpCount: 0,
      favicon: await discoverFavicon(url),
      tags: {
        create: (tags || []).map((tagName: string) => ({
          tag: {
            connectOrCreate: {
              where: { slug: tagName.toLowerCase().replace(/\s+/g, '-') },
              create: { name: tagName, slug: tagName.toLowerCase().replace(/\s+/g, '-') },
            },
          },
        })),
      },
    },
    include: { category: true, tags: { include: { tag: true } } },
  })

  return NextResponse.json(website, { status: 201 })
}
