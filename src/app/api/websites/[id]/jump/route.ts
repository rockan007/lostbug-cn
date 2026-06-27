import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getVisitorId } from '@/lib/visitor'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const websiteId = parseInt(id)

  if (isNaN(websiteId)) {
    return NextResponse.json({ error: 'Invalid website ID' }, { status: 400 })
  }

  const visitorId = await getVisitorId()

  const website = await db.website.findUnique({ where: { id: websiteId } })
  if (!website) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Idempotent: if visitor already jumped, don't increment
  const existing = await db.jump.findUnique({
    where: { websiteId_visitorId: { websiteId, visitorId } },
  })

  if (existing) {
    return NextResponse.json({ jumpCount: website.jumpCount })
  }

  const updated = await db.$transaction([
    db.jump.create({ data: { websiteId, visitorId } }),
    db.website.update({
      where: { id: websiteId },
      data: { jumpCount: { increment: 1 } },
    }),
  ])

  return NextResponse.json({ jumpCount: updated[1].jumpCount })
}
