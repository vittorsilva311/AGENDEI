import type { Metadata } from "next"
import PhoneItem from "@/app/_components/phone-item"
import ServiceItem from "@/app/_components/service-item"
import SidebarSheet from "@/app/_components/sidebar-sheet"
import { Button } from "@/app/_components/ui/button"
import { Sheet, SheetTrigger } from "@/app/_components/ui/sheet"
import { db } from "@/app/_lib/prisma"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar"
import { Badge } from "@/app/_components/ui/badge"
import {
  ChevronLeftIcon,
  MapPinIcon,
  MenuIcon,
  StarIcon,
  ClockIcon,
  UsersIcon,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

interface BarbershopPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: BarbershopPageProps): Promise<Metadata> {
  const barbershop = await db.barbershop.findUnique({ where: { id: params.id } })
  if (!barbershop) return {}
  return {
    title: `${barbershop.name} — Agendei`,
    description: barbershop.description,
    openGraph: {
      title: `${barbershop.name} — Agendei`,
      description: barbershop.description,
      images: [barbershop.imageUrl],
    },
  }
}

const BarbershopPage = async ({ params }: BarbershopPageProps) => {
  const barbershop = await db.barbershop.findUnique({
    where: { id: params.id },
    include: {
      services: { where: { active: true } },
      employees: { orderBy: { name: "asc" } },
      reviews: { select: { rating: true } },
    },
  })

  if (!barbershop) return notFound()

  const avgRating =
    barbershop.reviews.length > 0
      ? (barbershop.reviews.reduce((s, r) => s + r.rating, 0) / barbershop.reviews.length).toFixed(1)
      : null

  const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
  const workingDayNames = barbershop.workingDays.map((d) => DAY_LABELS[d]).join(", ")

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[260px] w-full lg:h-[420px]">
        <Image alt={barbershop.name} src={barbershop.imageUrl} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />

        <Button size="icon" variant="secondary" className="absolute left-4 top-4 z-10" asChild>
          <Link href="/"><ChevronLeftIcon /></Link>
        </Button>

        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="absolute right-4 top-4 z-10">
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SidebarSheet />
        </Sheet>

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="mx-auto max-w-5xl">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">{barbershop.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                <MapPinIcon className="text-primary" size={14} />
                <p className="text-sm text-gray-200">{barbershop.address}</p>
              </div>
              <Badge className="gap-1 border-0 bg-primary/80 backdrop-blur-sm">
                <StarIcon size={10} className="fill-white text-white" />
                <span className="text-xs font-bold">
                  {avgRating ?? "—"}{barbershop.reviews.length > 0 && ` (${barbershop.reviews.length})`}
                </span>
              </Badge>
              {barbershop.employees.length > 0 && (
                <Badge variant="secondary" className="gap-1 bg-black/50 backdrop-blur-sm">
                  <UsersIcon size={10} />
                  <span className="text-xs">{barbershop.employees.length} profissional{barbershop.employees.length > 1 ? "is" : ""}</span>
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="mx-auto max-w-5xl">
        {/* Sobre nós */}
        <div className="space-y-2 border-b border-solid p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Sobre nós</h2>
          <p className="text-sm leading-relaxed text-gray-300">{barbershop.description}</p>
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <div className="flex items-center gap-1">
              <ClockIcon size={13} className="text-primary" />
              <span className="text-xs text-gray-400">
                {barbershop.openTime}–{barbershop.closeTime}
              </span>
            </div>
            {workingDayNames && (
              <span className="text-xs text-gray-400">{workingDayNames}</span>
            )}
          </div>
        </div>

        {/* Equipe */}
        {barbershop.employees.length > 0 && (
          <div className="border-b border-solid p-5">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Nossa Equipe</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
              {barbershop.employees.map((emp) => (
                <div key={emp.id} className="flex flex-shrink-0 flex-col items-center gap-2">
                  <div className="relative">
                    <Avatar className="h-16 w-16 border-2 border-primary/30">
                      <AvatarImage src={emp.imageUrl ?? ""} className="object-cover" />
                      <AvatarFallback className="text-lg font-bold">{emp.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background bg-green-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold">{emp.name}</p>
                    {emp.specialty && <p className="text-xs text-gray-500">{emp.specialty}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Layout desktop: serviços + contato */}
        <div className="lg:flex lg:gap-8 lg:p-5">
          <div className="flex-1 border-b border-solid p-5 lg:border-b-0 lg:p-0">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Serviços</h2>
            <div className="space-y-3">
              {barbershop.services.map((service) => (
                <ServiceItem
                  key={service.id}
                  barbershop={JSON.parse(JSON.stringify(barbershop))}
                  service={JSON.parse(JSON.stringify(service))}
                  employees={JSON.parse(JSON.stringify(barbershop.employees))}
                />
              ))}
              {barbershop.services.length === 0 && (
                <p className="py-6 text-center text-sm text-gray-400">
                  Nenhum serviço disponível no momento.
                </p>
              )}
            </div>
          </div>

          <div className="p-5 lg:w-[260px] lg:p-0">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Contato</h2>
            {barbershop.phones.length > 0 ? (
              <div className="space-y-3">
                {barbershop.phones.map((phone) => <PhoneItem key={phone} phone={phone} />)}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Sem telefone cadastrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BarbershopPage
