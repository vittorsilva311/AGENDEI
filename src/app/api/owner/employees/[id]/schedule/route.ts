import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import { startOfDay, endOfDay, format, parseISO } from "date-fns"

interface RouteParams {
  params: { id: string }
}

async function authorizeAccess(userId: string, role: string, employeeId: string) {
  if (role === "EMPLOYEE") {
    const emp = await db.barbershopEmployee.findUnique({
      where: { userId },
      select: { id: true },
    })
    return emp?.id === employeeId ? { ok: true } : { ok: false, error: "Sem permissão" }
  }
  if (role === "OWNER" || role === "ADMIN") {
    return { ok: true }
  }
  return { ok: false, error: "Sem permissão" }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const auth = await authorizeAccess(session.user.id, session.user.role, params.id)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 403 })

  const dateParam = req.nextUrl.searchParams.get("date")
  if (!dateParam) return NextResponse.json({ error: "Data inválida" }, { status: 400 })

  const day = parseISO(dateParam)
  const dayStart = startOfDay(day)
  const dayEnd = endOfDay(day)

  const [bookings, blockedSlots] = await Promise.all([
    db.booking.findMany({
      where: {
        employeeId: params.id,
        date: { gte: dayStart, lte: dayEnd },
      },
      include: {
        user: { select: { name: true } },
        service: { select: { name: true } },
      },
      orderBy: { date: "asc" },
    }),
    db.employeeBlockedSlot.findMany({
      where: {
        employeeId: params.id,
        date: { gte: dayStart, lte: dayEnd },
      },
    }),
  ])

  const bookingsMap: Record<string, { clientName: string; serviceName: string }> = {}
  for (const b of bookings) {
    const time = format(b.date, "HH:mm")
    bookingsMap[time] = {
      clientName: b.user.name ?? "Cliente",
      serviceName: b.service.name,
    }
  }

  const blocked = blockedSlots.map((s) => format(s.date, "HH:mm"))

  return NextResponse.json({ bookings: bookingsMap, blocked })
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const auth = await authorizeAccess(session.user.id, session.user.role, params.id)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 403 })

  const { date } = await req.json()
  const slotDate = new Date(date)

  const existing = await db.employeeBlockedSlot.findUnique({
    where: { employeeId_date: { employeeId: params.id, date: slotDate } },
  })

  if (existing) {
    await db.employeeBlockedSlot.delete({ where: { id: existing.id } })
  } else {
    await db.employeeBlockedSlot.create({
      data: { employeeId: params.id, date: slotDate },
    })
  }

  return NextResponse.json({ ok: true })
}
