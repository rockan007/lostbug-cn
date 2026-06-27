import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getVisitorId } from '@/lib/visitor'
import { Prisma } from '@/generated/prisma'

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

  try {
    const result = await db.$transaction(async (tx) => {
      const website = await tx.website.findUnique({ where: { id: websiteId } })
      if (!website) {
        return { __tag: 'notFound' as const }
      }

      // Idempotent: if visitor already jumped, don't increment
      const existing = await tx.jump.findUnique({
        where: { websiteId_visitorId: { websiteId, visitorId } },
      })

      if (existing) {
        return { __tag: 'ok' as const, jumpCount: website.jumpCount }
      }

      await tx.jump.create({ data: { websiteId, visitorId } })
      const updated = await tx.website.update({
        where: { id: websiteId },
        data: { jumpCount: { increment: 1 } },
      })

      return { __tag: 'ok' as const, jumpCount: updated.jumpCount }
    })

    if (result.__tag === 'notFound') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ jumpCount: result.jumpCount })
  } catch (error) {
    // P2002 = unique constraint violation — a concurrent request beat us to it
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const website = await db.website.findUnique({ where: { id: websiteId } })
      return NextResponse.json({ jumpCount: website?.jumpCount ?? 0 })
    }
    throw error
  }
}
