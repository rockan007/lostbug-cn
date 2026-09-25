import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'crypto'

const COOKIE_NAME = 'midautumn_ride_token'
const TOKEN_VALUE = 'midautumn-2026'
const DEFAULT_ACCESS_PASSWORD = '0815'

function getSecret(): string {
  const secret = process.env.COOKIE_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('COOKIE_SECRET environment variable is required in production')
    }
    return 'dev-secret'
  }
  return secret
}

function sign(value: string): string {
  const hash = createHmac('sha256', getSecret()).update(value).digest('hex')
  return `${value}.${hash}`
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

function verify(token: string): boolean {
  const separator = token.lastIndexOf('.')
  if (separator <= 0) return false

  const value = token.slice(0, separator)
  const signature = token.slice(separator + 1)
  return value === TOKEN_VALUE && safeEqual(signature, sign(value).slice(separator + 1))
}

export async function loginMidautumnRide(password: string): Promise<boolean> {
  const accessPassword = process.env.MIDAUTUMN_RIDE_PASSWORD ?? DEFAULT_ACCESS_PASSWORD
  if (!safeEqual(password, accessPassword)) return false

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, sign(TOKEN_VALUE), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 12,
    path: '/travel/midautumn-2026',
  })
  return true
}

export async function isMidautumnRideAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  return Boolean(token && verify(token))
}
