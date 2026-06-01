"use server"

import { endOfDay, startOfDay } from "date-fns"
import { db } from "../_lib/prisma"

interface GetBookingsProps {
  serviceId: string
  date: Date
}

export const getBookings = async ({ date, serviceId }: GetBookingsProps) => {
  const service = await db.service.findUnique({
    where: { id: serviceId },
    select: { barbershopId: true },
  })
  if (!service) return []

  return db.booking.findMany({
    where: {
      service: { barbershopId: service.barbershopId },
      date: {
        gte: startOfDay(date),
        lte: endOfDay(date),
      },
    },
  })
}
