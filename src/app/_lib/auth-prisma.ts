import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"

// Separate Prisma instance for NextAuth adapter operations
// Uses a fresh pool to avoid shared state issues during OAuth callbacks
const createAuthPrismaClient = () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

declare global {
  // eslint-disable-next-line no-var
  var authPrismaClient: PrismaClient | undefined
}

export const authDb =
  global.authPrismaClient ?? (global.authPrismaClient = createAuthPrismaClient())
