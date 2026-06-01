"use server"

import { revalidatePath } from "next/cache"
import { db } from "../_lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import bcrypt from "bcryptjs"

interface CreateOwnerAccountParams {
  name: string
  email: string
  password: string
  barbershopId: string
}

export const createOwnerAccount = async (
  params: CreateOwnerAccountParams,
) => {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Sem permissão")
  }

  if (params.password.length < 6) {
    throw new Error("A senha deve ter no mínimo 6 caracteres")
  }

  const existing = await db.user.findUnique({
    where: { email: params.email.trim().toLowerCase() },
  })

  if (existing) {
    // Update existing user to owner
    await db.$transaction([
      db.user.update({
        where: { id: existing.id },
        data: {
          role: "OWNER",
          password: await bcrypt.hash(params.password, 10),
          name: params.name.trim() || existing.name,
        },
      }),
      db.barbershop.update({
        where: { id: params.barbershopId },
        data: { ownerId: existing.id },
      }),
    ])
  } else {
    // Create new user + link to barbershop
    const newUser = await db.user.create({
      data: {
        name: params.name.trim(),
        email: params.email.trim().toLowerCase(),
        role: "OWNER",
        password: await bcrypt.hash(params.password, 10),
      },
    })
    await db.barbershop.update({
      where: { id: params.barbershopId },
      data: { ownerId: newUser.id },
    })
  }

  revalidatePath("/admin")
}
