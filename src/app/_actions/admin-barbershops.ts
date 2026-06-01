"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"
import { revalidatePath } from "next/cache"

async function assertAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Sem permissão")
  }
}

export const createBarbershop = async (data: {
  name: string
  address: string
  description: string
  imageUrl: string
  phones: string[]
}) => {
  await assertAdmin()
  await db.barbershop.create({
    data: {
      name: data.name.trim(),
      address: data.address.trim(),
      description: data.description.trim(),
      imageUrl: data.imageUrl.trim(),
      phones: data.phones.map((p) => p.trim()).filter(Boolean),
    },
  })
  revalidatePath("/admin")
}

export const deleteBarbershop = async (id: string) => {
  await assertAdmin()
  await db.barbershop.delete({ where: { id } })
  revalidatePath("/admin")
}

export const updateBarbershopAsAdmin = async (
  id: string,
  data: {
    name: string
    address: string
    description: string
    imageUrl: string
    phones: string[]
  },
) => {
  await assertAdmin()
  await db.barbershop.update({
    where: { id },
    data: {
      name: data.name.trim(),
      address: data.address.trim(),
      description: data.description.trim(),
      imageUrl: data.imageUrl.trim(),
      phones: data.phones.map((p) => p.trim()).filter(Boolean),
    },
  })
  revalidatePath("/admin")
}
