"use server"

import { revalidatePath } from "next/cache"
import { db } from "../_lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { randomBytes } from "crypto"

interface CreateInvitationParams {
  ownerName: string
  email: string
  barbershopId: string
}

export const createInvitation = async (params: CreateInvitationParams) => {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Sem permissão")
  }

  const token = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days (~2 months)

  await db.invitation.create({
    data: {
      email: params.email.trim().toLowerCase(),
      ownerName: params.ownerName.trim(),
      token,
      barbershopId: params.barbershopId,
      expiresAt,
    },
  })

  revalidatePath("/admin")

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  return { link: `${baseUrl}/invite/${token}` }
}
