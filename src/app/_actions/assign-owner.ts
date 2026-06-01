"use server"

import { revalidatePath } from "next/cache"
import { db } from "../_lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"

export const assignOwner = async (barbershopId: string, email: string) => {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Sem permissão")
  }

  const user = await db.user.findUnique({ where: { email: email.trim() } })
  if (!user) throw new Error("Usuário com esse e-mail não encontrado")

  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: { role: "OWNER" },
    }),
    db.barbershop.update({
      where: { id: barbershopId },
      data: { ownerId: user.id },
    }),
  ])

  revalidatePath("/admin")
}

export const claimBarbershopOwnership = async (barbershopId: string) => {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Sem permissão")
  }

  await db.barbershop.update({
    where: { id: barbershopId },
    data: { ownerId: session.user.id },
  })

  revalidatePath("/admin")
  revalidatePath("/owner/dashboard")
}

export const removeBarbershopOwner = async (barbershopId: string) => {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Sem permissão")
  }

  const barbershop = await db.barbershop.findUnique({
    where: { id: barbershopId },
    select: { ownerId: true },
  })

  if (barbershop?.ownerId) {
    await db.user.update({
      where: { id: barbershop.ownerId },
      data: { role: "CUSTOMER" },
    })
  }

  await db.barbershop.update({
    where: { id: barbershopId },
    data: { ownerId: null },
  })

  revalidatePath("/admin")
}
