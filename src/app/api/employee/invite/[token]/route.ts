import { NextRequest, NextResponse } from "next/server"
import { db } from "@/app/_lib/prisma"

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const employee = await db.barbershopEmployee.findUnique({
    where: { inviteToken: params.token },
    select: {
      name: true,
      specialty: true,
      imageUrl: true,
      userId: true,
      inviteTokenExpiry: true,
      barbershop: { select: { name: true } },
    },
  })

  if (!employee) {
    return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 })
  }

  if (employee.inviteTokenExpiry && employee.inviteTokenExpiry < new Date()) {
    return NextResponse.json({ error: "Convite expirado" }, { status: 410 })
  }

  return NextResponse.json({
    alreadyLinked: !!employee.userId,
    employee: {
      name: employee.name,
      specialty: employee.specialty,
      imageUrl: employee.imageUrl,
      barbershopName: employee.barbershop.name,
    },
  })
}
