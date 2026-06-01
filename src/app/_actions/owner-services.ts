"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"
import { revalidatePath } from "next/cache"

async function getOwnerBarbershop() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Não autenticado")
  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    throw new Error("Sem permissão")
  }
  const barbershop = await db.barbershop.findFirst({
    where: { ownerId: session.user.id },
  })
  if (!barbershop) throw new Error("Nenhuma barbearia vinculada")
  return barbershop
}

export const createService = async (data: {
  name: string
  description: string
  price: number
  imageUrl: string
  durationMinutes: number
}) => {
  const barbershop = await getOwnerBarbershop()
  await db.service.create({
    data: {
      name: data.name.trim(),
      description: data.description.trim(),
      price: data.price,
      imageUrl: data.imageUrl.trim(),
      durationMinutes: data.durationMinutes,
      barbershopId: barbershop.id,
    },
  })
  revalidatePath("/owner/services")
}

export const updateService = async (
  serviceId: string,
  data: { name: string; description: string; price: number; imageUrl: string; durationMinutes: number },
) => {
  const barbershop = await getOwnerBarbershop()
  const service = await db.service.findUnique({ where: { id: serviceId } })
  if (!service || service.barbershopId !== barbershop.id) {
    throw new Error("Serviço não encontrado")
  }
  await db.service.update({
    where: { id: serviceId },
    data: {
      name: data.name.trim(),
      description: data.description.trim(),
      price: data.price,
      imageUrl: data.imageUrl.trim(),
      durationMinutes: data.durationMinutes,
    },
  })
  revalidatePath("/owner/services")
}

export const toggleServiceActive = async (serviceId: string) => {
  const barbershop = await getOwnerBarbershop()
  const service = await db.service.findUnique({ where: { id: serviceId } })
  if (!service || service.barbershopId !== barbershop.id) {
    throw new Error("Serviço não encontrado")
  }
  await db.service.update({
    where: { id: serviceId },
    data: { active: !service.active },
  })
  revalidatePath("/owner/services")
}

export const deleteService = async (serviceId: string) => {
  const barbershop = await getOwnerBarbershop()
  const service = await db.service.findUnique({ where: { id: serviceId } })
  if (!service || service.barbershopId !== barbershop.id) {
    throw new Error("Serviço não encontrado")
  }
  await db.service.delete({ where: { id: serviceId } })
  revalidatePath("/owner/services")
}
