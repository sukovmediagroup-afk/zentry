import { PrismaClient } from '@prisma/client'

// ARENA USA — Prisma client singleton.
//
// On Vercel: DATABASE_URL is injected via env vars (set in Vercel project settings).
// On local dev: DATABASE_URL is loaded from .env.local by Next.js, OR
//   passed explicitly via shell: `DATABASE_URL=... bun run dev`
//   (Neon CLI writes it to .env.local — but Next.js dev sometimes needs a
//   shell env var too. See README for details.)
//
// SECURITY: never log SQL queries in production — they can contain
// bind parameters with sensitive data (password hashes, session tokens).

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
