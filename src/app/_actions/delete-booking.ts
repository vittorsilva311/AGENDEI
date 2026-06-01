"use server"

import { revalidatePath } from "next/cache"
import { db } from "../_lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { sendBookingCancellation } from "../_lib/email"

export const deleteBooking = async (bookingId: string) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error("Usuário não autenticado")
  }

  const booking = await db.booking.findUnique({
    where: { id: bookingId, userId: session.user.id },
    include: {
      service: { include: { barbershop: true } },
      user: { select: { email: true, name: true } },
    },
  })

  if (!booking) throw new Error("Agendamento não encontrado")

  await db.booking.delete({ where: { id: bookingId } })

  if (booking.user.email) {
    sendBookingCancellation({
      to: booking.user.email,
      clientName: booking.user.name ?? "Cliente",
      serviceName: booking.service.name,
      barbershopName: booking.service.barbershop.name,
      date: booking.date,
    }).catch(() => {})
  }

  revalidatePath("/bookings")
}
