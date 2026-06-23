import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const website = await db.website.findUnique({
    where: { id: parseInt(id) },
    include: { category: true, tags: { include: { tag: true } } },
  })
  if (!website) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(website)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { title, url, description, categoryId, tags } = body

  const website = await db.website.update({
    where: { id: parseInt(id) },
    data: {
      ...(title && { title }),
      ...(url && { url }),
      ...(description !== undefined && { description }),
      ...(categoryId && { categoryId: parseInt(categoryId) }),
      ...(tags && {
        tags: {
          deleteMany: {},
          create: tags.map((tagName: string) => ({
            tag: {
              connectOrCreate: {
                where: { slug: tagName.toLowerCase().replace(/\s+/g, '-') },
                create: { name: tagName, slug: tagName.toLowerCase().replace(/\s+/g, '-') },
              },
            },
          })),
        },
      }),
    },
    include: { category: true, tags: { include: { tag: true } } },
  })

  return NextResponse.json(website)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await db.website.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true })
}
