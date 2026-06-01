import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import { NextResponse } from "next/server"
import { startOfMonth, endOfMonth } from "date-fns"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const [barbershops, totalCustomers, allCompletedBookings] = await Promise.all(
    [
      db.barbershop.findMany({
        include: {
          owner: { select: { name: true, email: true, image: true } },
        },
        orderBy: { name: "asc" },
      }),
      db.user.count({ where: { role: "CUSTOMER" } }),
      db.booking.findMany({
        where: { date: { lt: now } },
        include: { service: { select: { price: true, barbershopId: true } } },
      }),
    ],
  )

  const totalRevenue = allCompletedBookings.reduce(
    (sum, b) => sum + Number(b.service.price),
    0,
  )

  const barbershopsWithStats = barbershops.map((b) => {
    const bBookings = allCompletedBookings.filter(
      (bk) => bk.service.barbershopId === b.id,
    )
    const bMonthBookings = bBookings.filter(
      (bk) => bk.date >= monthStart && bk.date <= monthEnd,
    )
    return {
      id: b.id,
      name: b.name,
      address: b.address,
      imageUrl: b.imageUrl,
      owner: b.owner,
      monthRevenue: bMonthBookings.reduce(
        (sum, bk) => sum + Number(bk.service.price),
        0,
      ),
      monthBookings: bMonthBookings.length,
      totalBookings: bBookings.length,
    }
  })

  return NextResponse.json({
    totalRevenue,
    totalBarbershops: barbershops.length,
    totalCustomers,
    barbershops: barbershopsWithStats,
  })
}
