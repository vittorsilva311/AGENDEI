import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { MenuIcon } from "lucide-react"
import { Sheet, SheetTrigger } from "./ui/sheet"
import SidebarSheet from "./sidebar-sheet"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { Avatar, AvatarImage } from "./ui/avatar"
import Logo from "./logo"

const Header = async () => {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string } | undefined)?.role
  const isOwner = role === "OWNER" || role === "ADMIN"
  const isEmployee = role === "EMPLOYEE"

  return (
    <header className="sticky top-0 z-50">
      <Card className="rounded-none border-x-0 border-t-0">
        <CardContent className="mx-auto flex max-w-5xl flex-row items-center justify-between p-5">
          <Link href="/">
            <Logo />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 text-sm lg:flex">
            <Link href="/" className="text-gray-400 transition-colors hover:text-white">
              Início
            </Link>
            {isOwner ? (
              <>
                <Link href="/owner/dashboard" className="text-gray-400 transition-colors hover:text-white">
                  Painel
                </Link>
                <Link href="/owner/bookings" className="text-gray-400 transition-colors hover:text-white">
                  Agendamentos
                </Link>
                <Link href="/owner/employees" className="text-gray-400 transition-colors hover:text-white">
                  Equipe
                </Link>
              </>
            ) : isEmployee ? (
              <>
                <Link href="/employee/schedule" className="text-gray-400 transition-colors hover:text-white">
                  Minha Agenda
                </Link>
              </>
            ) : (
              <>
                <Link href="/barbershops" className="text-gray-400 transition-colors hover:text-white">
                  Barbearias
                </Link>
                <Link href="/bookings" className="text-gray-400 transition-colors hover:text-white">
                  Agendamentos
                </Link>
              </>
            )}
          </nav>

          {/* Avatar + menu */}
          <div className="flex items-center gap-3">
            {session?.user && (
              <Avatar className="hidden h-8 w-8 lg:flex">
                <AvatarImage src={session.user.image ?? ""} />
              </Avatar>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline">
                  <MenuIcon />
                </Button>
              </SheetTrigger>
              <SidebarSheet />
            </Sheet>
          </div>
        </CardContent>
      </Card>
    </header>
  )
}

export default Header
