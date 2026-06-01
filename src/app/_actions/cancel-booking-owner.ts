"use server"

import { revalidatePath } from "next/cache"
import { db } from "../_lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"

export const cancelBookingAsOwner = async (bookingId: string) => {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user.role !== "OWNER" && session.user.role !== "ADMIN")) {
    throw new Error("Sem permissão")
  }

  const barbershop = await db.barbershop.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true },
  })
  if (!barbershop) throw new Error("Sem barbearia vinculada")

  await db.booking.delete({
    where: {
      id: bookingId,
      service: { barbershopId: barbershop.id },
    },
  })

  revalidatePath("/owner/bookings")
  revalidatePath("/owner/dashboard")
}
