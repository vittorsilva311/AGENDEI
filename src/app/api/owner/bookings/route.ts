import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }

  const barbershop = await db.barbershop.findFirst({
    where: { ownerId: session.user.id },
  })
  if (!barbershop) return NextResponse.json({ error: "Sem barbearia" }, { status: 404 })

  const { searchParams } = req.nextUrl
  const period = searchParams.get("period") ?? "today"
  const employeeId = searchParams.get("employee") ?? ""
  const status = searchParams.get("status") ?? "all"

  const now = new Date()
  let dateFilter: { gte: Date; lte: Date } | undefined
  if (period === "today") {
    dateFilter = { gte: startOfDay(now), lte: endOfDay(now) }
  } else if (period === "week") {
    dateFilter = { gte: startOfWeek(now, { weekStartsOn: 0 }), lte: endOfWeek(now, { weekStartsOn: 0 }) }
  } else if (period === "month") {
    dateFilter = { gte: startOfMonth(now), lte: endOfMonth(now) }
  }

  const bookings = await db.booking.findMany({
    where: {
      service: { barbershopId: barbershop.id },
      ...(dateFilter ? { date: dateFilter } : {}),
      ...(employeeId ? { employeeId } : {}),
      ...(status === "upcoming" ? { date: { gt: now } } : {}),
      ...(status === "completed" ? { date: { lte: now } } : {}),
    },
    include: {
      user: { select: { name: true, email: true, image: true } },
      service: { select: { name: true, price: true } },
      employee: { select: { name: true } },
    },
    orderBy: { date: "asc" },
  })

  const employees = await db.barbershopEmployee.findMany({
    where: { barbershopId: barbershop.id },
    select: { id: true, name: true },
  })

  return NextResponse.json({ bookings, employees })
}
