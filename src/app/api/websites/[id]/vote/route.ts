import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getVisitorId } from '@/lib/visitor'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const websiteId = parseInt(id)
  const body = await request.json()
  const { voteType } = body

  if (!voteType || !['up', 'down'].includes(voteType)) {
    return NextResponse.json({ error: 'voteType must be "up" or "down"' }, { status: 400 })
  }

  const visitorId = await getVisitorId()

  const website = await db.website.findUnique({ where: { id: websiteId } })
  if (!website) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const existingVote = await db.vote.findUnique({
    where: { websiteId_visitorId: { websiteId, visitorId } },
  })

  await db.$transaction(async (tx) => {
    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote
        await tx.vote.delete({ where: { id: existingVote.id } })
        if (voteType === 'up') {
          await tx.website.update({ where: { id: websiteId }, data: { upVotes: { decrement: 1 } } })
        } else {
          await tx.website.update({ where: { id: websiteId }, data: { downVotes: { decrement: 1 } } })
        }
      } else {
        // Switch vote
        await tx.vote.update({ where: { id: existingVote.id }, data: { voteType } })
        if (voteType === 'up') {
          await tx.website.update({ where: { id: websiteId }, data: { upVotes: { increment: 1 }, downVotes: { decrement: 1 } } })
        } else {
          await tx.website.update({ where: { id: websiteId }, data: { upVotes: { decrement: 1 }, downVotes: { increment: 1 } } })
        }
      }
    } else {
      await tx.vote.create({ data: { websiteId, visitorId, voteType } })
      if (voteType === 'up') {
        await tx.website.update({ where: { id: websiteId }, data: { upVotes: { increment: 1 } } })
      } else {
        await tx.website.update({ where: { id: websiteId }, data: { downVotes: { increment: 1 } } })
      }
    }
  })

  const updated = await db.website.findUnique({
    where: { id: websiteId },
    select: { upVotes: true, downVotes: true },
  })

  return NextResponse.json(updated)
}
