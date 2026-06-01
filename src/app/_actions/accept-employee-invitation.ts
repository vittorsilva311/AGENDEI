"use server"

import { db } from "../_lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"

export const acceptEmployeeInvitation = async (token: string) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Faça login primeiro")

  const employee = await db.barbershopEmployee.findUnique({
    where: { inviteToken: token },
    select: { id: true, userId: true, inviteTokenExpiry: true },
  })

  if (!employee) throw new Error("Convite inválido")
  if (employee.inviteTokenExpiry && employee.inviteTokenExpiry < new Date()) throw new Error("Este convite expirou")
  if (employee.userId) throw new Error("Este funcionário já possui uma conta vinculada")

  await db.$transaction([
    db.user.update({
      where: { id: session.user.id },
      data: { role: "EMPLOYEE" },
    }),
    db.barbershopEmployee.update({
      where: { id: employee.id },
      data: { userId: session.user.id },
    }),
  ])
}
