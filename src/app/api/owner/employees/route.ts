import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const barbershop = await db.barbershop.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true },
  })

  if (!barbershop) {
    return NextResponse.json([])
  }

  const employees = await db.barbershopEmployee.findMany({
    where: { barbershopId: barbershop.id },
    select: { id: true, name: true, specialty: true, imageUrl: true },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(employees)
}
