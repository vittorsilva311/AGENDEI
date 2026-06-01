"use server"

import { db } from "../_lib/prisma"
import bcrypt from "bcryptjs"

interface AcceptInvitationParams {
  token: string
  password: string
}

export const getInvitation = async (token: string) => {
  const invitation = await db.invitation.findUnique({
    where: { token },
    include: { barbershop: true },
  })

  if (!invitation) return { error: "Convite não encontrado" }
  if (invitation.usedAt) return { error: "Este convite já foi utilizado" }
  if (invitation.expiresAt < new Date())
    return { error: "Este convite expirou" }

  return { invitation }
}

export const acceptInvitation = async (params: AcceptInvitationParams) => {
  const { token, password } = params

  if (password.length < 6) {
    throw new Error("A senha deve ter no mínimo 6 caracteres")
  }

  const invitation = await db.invitation.findUnique({
    where: { token },
    include: { barbershop: true },
  })

  if (!invitation) throw new Error("Convite não encontrado")
  if (invitation.usedAt) throw new Error("Este convite já foi utilizado")
  if (invitation.expiresAt < new Date()) throw new Error("Este convite expirou")

  const hashedPassword = await bcrypt.hash(password, 10)

  const existing = await db.user.findUnique({
    where: { email: invitation.email },
  })

  await db.$transaction(async (tx) => {
    let userId: string

    if (existing) {
      await tx.user.update({
        where: { id: existing.id },
        data: {
          name: invitation.ownerName,
          role: "OWNER",
          password: hashedPassword,
        },
      })
      userId = existing.id
    } else {
      const newUser = await tx.user.create({
        data: {
          name: invitation.ownerName,
          email: invitation.email,
          role: "OWNER",
          password: hashedPassword,
        },
      })
      userId = newUser.id
    }

    await tx.barbershop.update({
      where: { id: invitation.barbershopId },
      data: { ownerId: userId },
    })

    await tx.invitation.update({
      where: { id: invitation.id },
      data: { usedAt: new Date() },
    })
  })
}
