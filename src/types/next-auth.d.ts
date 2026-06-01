import { DefaultSession } from "next-auth"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT } from "next-auth/jwt"

export type UserRole = "ADMIN" | "OWNER" | "EMPLOYEE" | "CUSTOMER"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession["user"]
  }

  interface User {
    role?: UserRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: string
  }
}
