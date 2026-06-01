"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"
import { revalidatePath } from "next/cache"
import { geocodeAddress } from "../_lib/geocode"

export const updateBarbershopSettings = async (data: {
  name: string
  address: string
  description: string
  imageUrl: string
  phones: string[]
  openTime: string
  closeTime: string
  workingDays: number[]
}) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Não autenticado")
  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    throw new Error("Sem permissão")
  }

  const barbershop = await db.barbershop.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true, address: true },
  })
  if (!barbershop) throw new Error("Nenhuma barbearia vinculada")

  const addressChanged = data.address.trim() !== barbershop.address
  const coords = addressChanged ? await geocodeAddress(data.address.trim()) : null

  await db.barbershop.update({
    where: { id: barbershop.id },
    data: {
      name: data.name.trim(),
      address: data.address.trim(),
      description: data.description.trim(),
      imageUrl: data.imageUrl.trim(),
      phones: data.phones.map((p) => p.trim()).filter(Boolean),
      openTime: data.openTime,
      closeTime: data.closeTime,
      workingDays: data.workingDays,
      ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
    },
  })

  revalidatePath("/owner/settings")
  revalidatePath("/owner/dashboard")
  revalidatePath(`/barbershops/${barbershop.id}`)
}
