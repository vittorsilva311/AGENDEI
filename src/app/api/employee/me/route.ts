import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import { startOfDay, endOfDay, isBefore } from "date-fns"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const employee = await db.barbershopEmployee.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      specialty: true,
      barbershop: { select: { name: true } },
      bookings: {
        where: {
          date: {
            gte: startOfDay(new Date()),
            lte: endOfDay(new Date()),
          },
        },
        include: { service: { select: { price: true } } },
      },
    },
  })

  if (!employee) return NextResponse.json({ error: "Sem perfil de funcionário vinculado" }, { status: 404 })

  const todayCompleted = employee.bookings.filter((b) => isBefore(b.date, new Date()))
  const todayRevenue = todayCompleted.reduce((s, b) => s + Number(b.service.price), 0)
  const todayTotal = employee.bookings.length
  const todayUpcoming = employee.bookings.filter((b) => b.date > new Date()).length

  return NextResponse.json({
    id: employee.id,
    name: employee.name,
    imageUrl: employee.imageUrl,
    specialty: employee.specialty,
    barbershopName: employee.barbershop.name,
    todayRevenue,
    todayTotal,
    todayUpcoming,
  })
}
