"use server"

import { revalidatePath } from "next/cache"
import { db } from "../_lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"

export const removeEmployee = async (employeeId: string) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Não autenticado")

  const employee = await db.barbershopEmployee.findUnique({
    where: { id: employeeId },
    include: { barbershop: true },
  })

  if (!employee) throw new Error("Funcionário não encontrado")

  const isOwner = employee.barbershop.ownerId === session.user.id
  const isAdmin = session.user.role === "ADMIN"

  if (!isOwner && !isAdmin) throw new Error("Sem permissão")

  await db.barbershopEmployee.delete({ where: { id: employeeId } })

  revalidatePath("/owner/employees")
  revalidatePath("/owner/dashboard")
}
