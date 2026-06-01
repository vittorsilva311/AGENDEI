"use client"

import { Button } from "./ui/button"
import {
  CalendarIcon,
  HomeIcon,
  LogInIcon,
  LogOutIcon,
  LayoutDashboardIcon,
  ShieldIcon,
  ScissorsIcon,
  SettingsIcon,
  UsersIcon,
  ClipboardListIcon,
  CalendarDaysIcon,
  UserIcon,
  StoreIcon,
} from "lucide-react"
import { SheetClose, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet"
import { quickSearchOptions } from "../_constants/search"
import Link from "next/link"
import Image from "next/image"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { signOut, useSession } from "next-auth/react"
import { Avatar, AvatarImage } from "./ui/avatar"
import SignInDialog from "./sign-in-dialog"

const SidebarSheet = () => {
  const { data } = useSession()
  const role = (data?.user as { role?: string } | undefined)?.role

  return (
    <SheetContent className="overflow-y-auto">
      <SheetHeader>
        <SheetTitle className="text-left">Menu</SheetTitle>
      </SheetHeader>

      <div className="flex items-center justify-between gap-3 border-b border-solid py-5">
        {data?.user ? (
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={data.user.image ?? ""} />
            </Avatar>
            <div>
              <p className="font-bold">{data.user.name}</p>
              <p className="text-xs text-gray-400">{data.user.email}</p>
            </div>
          </div>
        ) : (
          <>
            <h2 className="font-bold">Olá, faça seu login!</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="icon">
                  <LogInIcon />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90%]">
                <SignInDialog />
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2 border-b border-solid py-5">
        <SheetClose asChild>
          <Button className="justify-start gap-2" variant="ghost" asChild>
            <Link href="/">
              <HomeIcon size={18} />
              Início
            </Link>
          </Button>
        </SheetClose>
        <SheetClose asChild>
          <Button className="justify-start gap-2" variant="ghost" asChild>
            <Link href="/bookings">
              <CalendarIcon size={18} />
              Agendamentos
            </Link>
          </Button>
        </SheetClose>
        {data?.user && (
          <SheetClose asChild>
            <Button className="justify-start gap-2" variant="ghost" asChild>
              <Link href="/profile">
                <UserIcon size={18} />
                Meu Perfil
              </Link>
            </Button>
          </SheetClose>
        )}

        {/* Owner links */}
        {(role === "OWNER" || role === "ADMIN") && (
          <>
            <SheetClose asChild>
              <Button className="justify-start gap-2" variant="ghost" asChild>
                <Link href="/owner/dashboard">
                  <LayoutDashboardIcon size={18} />
                  Painel da Barbearia
                </Link>
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button className="justify-start gap-2" variant="ghost" asChild>
                <Link href="/owner/bookings">
                  <ClipboardListIcon size={18} />
                  Agendamentos
                </Link>
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button className="justify-start gap-2" variant="ghost" asChild>
                <Link href="/owner/services">
                  <ScissorsIcon size={18} />
                  Serviços
                </Link>
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button className="justify-start gap-2" variant="ghost" asChild>
                <Link href="/owner/employees">
                  <UsersIcon size={18} />
                  Equipe
                </Link>
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button className="justify-start gap-2" variant="ghost" asChild>
                <Link href="/owner/settings">
                  <SettingsIcon size={18} />
                  Configurações
                </Link>
              </Button>
            </SheetClose>
          </>
        )}

        {/* Employee link */}
        {role === "EMPLOYEE" && (
          <SheetClose asChild>
            <Button className="justify-start gap-2" variant="ghost" asChild>
              <Link href="/employee/schedule">
                <CalendarDaysIcon size={18} />
                Minha Agenda
              </Link>
            </Button>
          </SheetClose>
        )}

        {/* Admin link */}
        {role === "ADMIN" && (
          <SheetClose asChild>
            <Button
              className="justify-start gap-2 text-primary"
              variant="ghost"
              asChild
            >
              <Link href="/admin">
                <ShieldIcon size={18} />
                Administração
              </Link>
            </Button>
          </SheetClose>
        )}
      </div>

      <div className="flex flex-col gap-2 border-b border-solid py-5">
        {quickSearchOptions.map((option) => (
          <SheetClose key={option.title} asChild>
            <Button className="justify-start gap-2" variant="ghost" asChild>
              <Link href={`/barbershops?service=${option.title}`}>
                <Image
                  alt={option.title}
                  src={option.imageUrl}
                  height={18}
                  width={18}
                />
                {option.title}
              </Link>
            </Button>
          </SheetClose>
        ))}
      </div>

      {!data?.user && (
        <div className="flex flex-col gap-2 border-t border-solid pt-5 pb-2">
          <SheetClose asChild>
            <Button className="justify-start gap-2 text-gray-400" variant="ghost" asChild>
              <Link href="/owner/login">
                <StoreIcon size={18} />
                Acesso do Proprietário
              </Link>
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button className="justify-start gap-2 text-gray-400" variant="ghost" asChild>
              <Link href="/admin">
                <ShieldIcon size={18} />
                Acesso do Admin
              </Link>
            </Button>
          </SheetClose>
        </div>
      )}

      {data?.user && (
        <div className="flex flex-col gap-2 py-5">
          <Button
            variant="ghost"
            className="justify-start gap-2"
            onClick={() => signOut()}
          >
            <LogOutIcon size={18} />
            Sair da conta
          </Button>
        </div>
      )}
    </SheetContent>
  )
}

export default SidebarSheet
