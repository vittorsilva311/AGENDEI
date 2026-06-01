"use server"

import { revalidatePath } from "next/cache"
import { db } from "../_lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { isFuture } from "date-fns"

export const createReview = async (data: {
  bookingId: string
  rating: number
  comment?: string
}) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Não autenticado")

  if (data.rating < 1 || data.rating > 5) throw new Error("Avaliação inválida")

  const booking = await db.booking.findUnique({
    where: { id: data.bookingId, userId: session.user.id },
    include: { service: { select: { barbershopId: true } }, review: true },
  })
  if (!booking) throw new Error("Agendamento não encontrado")
  if (isFuture(booking.date)) throw new Error("Só é possível avaliar após o atendimento")
  if (booking.review) throw new Error("Você já avaliou este atendimento")

  await db.review.create({
    data: {
      bookingId: data.bookingId,
      userId: session.user.id,
      barbershopId: booking.service.barbershopId,
      rating: data.rating,
      comment: data.comment?.trim() || null,
    },
  })

  revalidatePath("/bookings")
  revalidatePath(`/barbershops/${booking.service.barbershopId}`)
}
