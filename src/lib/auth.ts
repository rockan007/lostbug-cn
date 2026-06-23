import { cookies } from 'next/headers'
import { createHmac } from 'crypto'

const COOKIE_NAME = 'admin_token'

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
  const secret = getSecret()
  const hmac = createHmac('sha256', secret).update(value).digest('hex')
  return `${value}.${hmac}`
}

function verify(signed: string): boolean {
  const secret = getSecret()
  const [value, hash] = signed.split('.')
  const expected = createHmac('sha256', secret).update(value).digest('hex')
  return hash === expected
}

export async function login(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword || password !== adminPassword) return false

  const token = sign('admin')
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  })
  return true
}

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return false
  return verify(token)
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
