import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest) {
  const admin = await isAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, status } = body

  if (!id || !status || !['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'id and valid status required' }, { status: 400 })
  }

  const website = await db.website.update({
    where: { id: parseInt(id) },
    data: { status },
  })

  return NextResponse.json(website)
}
