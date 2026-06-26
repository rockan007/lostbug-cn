import { PrismaClient } from '@/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

let _prisma: PrismaClient | undefined

function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = globalForPrisma.prisma ?? new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
    })
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = _prisma
    }
  }
  return _prisma
}

// Lazy proxy: defer PrismaClient construction until first property access,
// which avoids build-time instantiation when no database is available.
export const db = new Proxy({} as PrismaClient, {
  get(_target, key: string | symbol) {
    const client = getPrisma()
    const value = (client as unknown as Record<string | symbol, unknown>)[key]
    if (typeof value === 'function') {
      return (value as Function).bind(client)
    }
    return value
  },
})
