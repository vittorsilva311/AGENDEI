"use server"

import { revalidatePath } from "next/cache"
import { db } from "../_lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { PaymentMethod } from "@prisma/client"
import { sendBookingConfirmation, sendNewBookingAlert } from "../_lib/email"

interface CreateBookingParams {
  serviceId: string
  date: Date
  paymentMethod?: PaymentMethod
  employeeId?: string
}

export const createBooking = async (params: CreateBookingParams) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Usuário não autenticado")

  const booking = await db.booking.create({
    data: {
      serviceId: params.serviceId,
      date: new Date(params.date),
      userId: session.user.id,
      paymentMethod: params.paymentMethod ?? null,
      employeeId: params.employeeId ?? null,
    },
    include: {
      service: {
        include: {
          barbershop: { include: { owner: { select: { email: true } } } },
        },
      },
      user: { select: { email: true, name: true } },
      employee: { select: { name: true } },
    },
  })

  if (booking.user.email) {
    sendBookingConfirmation({
      to: booking.user.email,
      clientName: booking.user.name ?? "Cliente",
      serviceName: booking.service.name,
      barbershopName: booking.service.barbershop.name,
      barbershopAddress: booking.service.barbershop.address,
      date: booking.date,
      employeeName: booking.employee?.name,
      paymentMethod: booking.paymentMethod,
      price: Number(booking.service.price),
    }).catch(() => {})
  }

  const ownerEmail = booking.service.barbershop.owner?.email
  if (ownerEmail) {
    sendNewBookingAlert({
      to: ownerEmail,
      clientName: booking.user.name ?? "Cliente",
      serviceName: booking.service.name,
      date: booking.date,
      employeeName: booking.employee?.name,
      paymentMethod: booking.paymentMethod,
      price: Number(booking.service.price),
    }).catch(() => {})
  }

  revalidatePath("/barbershops/[id]")
  revalidatePath("/bookings")
}
