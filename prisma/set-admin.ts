import "dotenv/config"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Set this to your Google account email
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? ""

async function main() {
  if (!ADMIN_EMAIL) {
    console.error("ADMIN_EMAIL env var não definida")
    process.exit(1)
  }

  const user = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } })
  if (!user) {
    console.error(`Usuário com email "${ADMIN_EMAIL}" não encontrado.`)
    console.error("Faça login com Google primeiro, depois rode este script.")
    process.exit(1)
  }

  await prisma.user.update({
    where: { email: ADMIN_EMAIL },
    data: { role: "ADMIN" },
  })

  console.log(`✓ Usuário "${user.name}" (${ADMIN_EMAIL}) agora é ADMIN.`)
  await pool.end()
}

main().catch(console.error)
