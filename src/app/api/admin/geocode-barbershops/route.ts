import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import { geocodeAddress } from "@/app/_lib/geocode"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }

  const barbershops = await db.barbershop.findMany({
    where: { OR: [{ lat: null }, { lng: null }] },
    select: { id: true, address: true },
  })

  let updated = 0
  let failed = 0

  for (const shop of barbershops) {
    await new Promise((r) => setTimeout(r, 1100))
    const coords = await geocodeAddress(shop.address)
    if (coords) {
      await db.barbershop.update({
        where: { id: shop.id },
        data: { lat: coords.lat, lng: coords.lng },
      })
      updated++
    } else {
      failed++
    }
  }

  return NextResponse.json({ total: barbershops.length, updated, failed })
}
