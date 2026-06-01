import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }

  const barbershop = await db.barbershop.findFirst({
    where: { ownerId: session.user.id },
  })
  if (!barbershop) return NextResponse.json({ error: "Nenhuma barbearia vinculada" }, { status: 404 })

  return NextResponse.json({
    id: barbershop.id,
    name: barbershop.name,
    address: barbershop.address,
    description: barbershop.description,
    imageUrl: barbershop.imageUrl,
    phones: barbershop.phones,
    openTime: barbershop.openTime,
    closeTime: barbershop.closeTime,
    workingDays: barbershop.workingDays,
  })
}
