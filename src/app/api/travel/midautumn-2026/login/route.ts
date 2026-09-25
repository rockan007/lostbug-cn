import { NextRequest, NextResponse } from 'next/server'
import { loginMidautumnRide } from '@/lib/midautumn-ride-auth'

export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null)
  const password = typeof body === 'object' && body !== null && 'password' in body
    ? (body as { password?: unknown }).password
    : undefined

  if (typeof password !== 'string' || password.length === 0) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 })
  }

  const success = await loginMidautumnRide(password)
  if (!success) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  return NextResponse.json({ success: true })
}
