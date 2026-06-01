import { getServerSession } from "next-auth"
import { authOptions } from "../../_lib/auth"
import { redirect } from "next/navigation"
import Header from "../../_components/header"

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/owner/login")
  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    redirect("/")
  }
  return (
    <>
      <Header />
      {children}
    </>
  )
}
