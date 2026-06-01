"use server"

import { revalidatePath } from "next/cache"
import { db } from "../_lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"

interface AddEmployeeParams {
  name: string
  specialty?: string
  imageUrl?: string
}

export const addEmployee = async (params: AddEmployeeParams) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Não autenticado")

  const barbershop = await db.barbershop.findFirst({
    where: { ownerId: session.user.id },
  })

  if (!barbershop && session.user.role !== "ADMIN") {
    throw new Error("Barbearia não encontrada")
  }

  const targetBarbershopId = barbershop?.id
  if (!targetBarbershopId) throw new Error("Barbearia não encontrada")

  await db.barbershopEmployee.create({
    data: {
      name: params.name.trim(),
      specialty: params.specialty?.trim() || null,
      imageUrl: params.imageUrl?.trim() || null,
      barbershopId: targetBarbershopId,
    },
  })

  revalidatePath("/owner/employees")
  revalidatePath("/owner/dashboard")
}
