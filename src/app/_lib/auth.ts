import { PrismaAdapter } from "@auth/prisma-adapter"
import { AuthOptions } from "next-auth"
import { db } from "./prisma"
import { Adapter } from "next-auth/adapters"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email.trim().toLowerCase() },
        })

        if (!user?.password) return null

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        )
        if (!isValid) return null

        if (user.role !== "OWNER" && user.role !== "ADMIN") return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      const userId = (token.id ?? token.sub) as string | undefined
      if (userId) {
        const dbUser = await db.user.findUnique({
          where: { id: userId },
          select: { role: true },
        })
        if (dbUser) {
          token.id = userId
          token.role = dbUser.role
        }
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.role =
        (token.role as "ADMIN" | "OWNER" | "CUSTOMER") ?? "CUSTOMER"
      return session
    },
  },
  logger: {
    error(code, metadata) {
      console.error("[NextAuth]", code, metadata)
    },
    warn(code) {
      console.warn("[NextAuth]", code)
    },
  },
  pages: {
    error: "/auth/error",
  },
}
