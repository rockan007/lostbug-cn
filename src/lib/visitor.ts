import { headers } from 'next/headers'
import { createHash } from 'crypto'

export async function getVisitorId(): Promise<string> {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
  const ua = headersList.get('user-agent') || ''
  return createHash('sha256').update(`${ip}:${ua}`).digest('hex').slice(0, 32)
}
