"use server"

import { randomBytes } from "crypto"
import { db } from "../_lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"

const TWO_MONTHS_MS = 60 * 24 * 60 * 60 * 1000

export const createEmployeeInvitation = async (employeeId: string) => {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user.role !== "OWNER" && session.user.role !== "ADMIN")) {
    throw new Error("Sem permissão")
  }

  const employee = await db.barbershopEmployee.findUnique({
    where: { id: employeeId },
    select: { inviteToken: true, inviteTokenExpiry: true },
  })
  if (!employee) throw new Error("Funcionário não encontrado")

  const isExpired =
    !employee.inviteToken ||
    !employee.inviteTokenExpiry ||
    employee.inviteTokenExpiry < new Date()

  let token = employee.inviteToken
  if (isExpired) {
    token = randomBytes(32).toString("hex")
    await db.barbershopEmployee.update({
      where: { id: employeeId },
      data: {
        inviteToken: token,
        inviteTokenExpiry: new Date(Date.now() + TWO_MONTHS_MS),
      },
    })
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  return { link: `${baseUrl}/employee/join/${token}` }
}
