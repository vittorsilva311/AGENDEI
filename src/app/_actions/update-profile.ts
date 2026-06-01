"use server"

import { revalidatePath } from "next/cache"
import { db } from "../_lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"

export const updateProfile = async (name: string) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Não autenticado")

  const trimmed = name.trim()
  if (!trimmed || trimmed.length < 2) throw new Error("Nome inválido")

  await db.user.update({
    where: { id: session.user.id },
    data: { name: trimmed },
  })

  revalidatePath("/profile")
}
