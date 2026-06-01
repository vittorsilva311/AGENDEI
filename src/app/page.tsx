import type { Metadata } from "next"
import Header from "./_components/header"
import { Button } from "./_components/ui/button"
import Image from "next/image"
import { db } from "./_lib/prisma"
import GeoBarbershopGrid from "./_components/geo-barbershop-grid"
import { quickSearchOptions } from "./_constants/search"
import BookingItem from "./_components/booking-item"
import DragScrollContainer from "./_components/drag-scroll-container"
import Search from "./_components/search"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "./_lib/auth"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { getConfirmedBookings } from "./_data/get-confirmed-bookings"
import { CalendarIcon, ScissorsIcon } from "lucide-react"

export const metadata: Metadata = {
  title: "Agendei — Agende nos melhores salões e barbearias",
  description: "Encontre e agende serviços nos melhores salões e barbearias perto de você. Rápido, fácil e sem complicação.",
  openGraph: {
    title: "Agendei — Agende nos melhores salões e barbearias",
    description: "Encontre e agende serviços nos melhores salões e barbearias perto de você.",
    type: "website",
  },
}

const Home = async () => {
  const session = await getServerSession(authOptions)
  const barbershops = await db.barbershop.findMany({
    take: 8,
    include: { reviews: { select: { rating: true } } },
  })
  const popularBarbershops = await db.barbershop.findMany({
    orderBy: { name: "desc" },
    take: 8,
    include: { reviews: { select: { rating: true } } },
  })
  const confirmedBookings = await getConfirmedBookings()

  return (
    <div>
      <Header />

      <div className="mx-auto max-w-5xl px-5 py-5 lg:py-10">
        {/* Boas-vindas */}
        <div className="mb-6">
          <h2 className="text-xl font-bold">
            Olá,{" "}
            <span className="text-primary">
              {session?.user ? session.user.name?.split(" ")[0] : "visitante"}
            </span>
            ! 👋
          </h2>
          <p className="text-sm capitalize text-gray-400">
            {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", {
              locale: ptBR,
            })}
          </p>
        </div>

        {/* Busca */}
        <Search />

        {/* Busca rápida */}
        <div className="mt-6 flex gap-3 overflow-x-scroll pb-1 [&::-webkit-scrollbar]:hidden">
          {quickSearchOptions.map((option) => (
            <Button
              className="flex-shrink-0 gap-2"
              variant="secondary"
              key={option.title}
              asChild
            >
              <Link href={`/barbershops?service=${option.title}`}>
                <Image
                  src={option.imageUrl}
                  width={16}
                  height={16}
                  alt={option.title}
                />
                {option.title}
              </Link>
            </Button>
          ))}
        </div>

        {/* Banner */}
        <div className="relative mt-6 h-[160px] w-full overflow-hidden rounded-xl lg:h-[280px]">
          <Image
            alt="Agende nos melhores com Agendei"
            src="/banner-01.png"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Agendamentos confirmados */}
        {confirmedBookings.length > 0 ? (
          <section className="mt-8">
            <div className="mb-3 flex items-center gap-2">
              <CalendarIcon size={14} className="text-primary" />
              <h2 className="text-xs font-bold uppercase text-gray-400">
                Agendamentos
              </h2>
            </div>
            <DragScrollContainer className="gap-3">
              {confirmedBookings.map((booking) => (
                <BookingItem
                  key={booking.id}
                  booking={JSON.parse(JSON.stringify(booking))}
                />
              ))}
            </DragScrollContainer>
          </section>
        ) : (
          session?.user && (
            <div className="mt-8 flex items-center gap-3 rounded-xl border border-dashed border-secondary p-4">
              <CalendarIcon size={20} className="text-gray-400" />
              <p className="text-sm text-gray-400">
                Você não tem agendamentos.{" "}
                <Link
                  href="/barbershops"
                  className="text-primary underline underline-offset-2"
                >
                  Agende agora
                </Link>
              </p>
            </div>
          )
        )}

        {/* Recomendados */}
        <section className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <ScissorsIcon size={14} className="text-primary" />
            <h2 className="text-xs font-bold uppercase text-gray-400">
              Recomendados
            </h2>
          </div>
          <GeoBarbershopGrid barbershops={barbershops} />
        </section>

        {/* Populares */}
        <section className="mt-8 pb-6">
          <div className="mb-3 flex items-center gap-2">
            <ScissorsIcon size={14} className="text-primary" />
            <h2 className="text-xs font-bold uppercase text-gray-400">
              Populares
            </h2>
          </div>
          <GeoBarbershopGrid barbershops={popularBarbershops} />
        </section>
      </div>
    </div>
  )
}

export default Home
