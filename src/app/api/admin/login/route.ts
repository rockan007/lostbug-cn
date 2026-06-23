import { NextRequest, NextResponse } from 'next/server'
import { login } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { password } = body

  if (!password) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 })
  }

  const success = await login(password)
  if (!success) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  return NextResponse.json({ success: true })
}
