import { getServerSession } from "next-auth"
import Header from "../_components/header"
import { authOptions } from "../_lib/auth"
import { redirect } from "next/navigation"
import BookingItem from "../_components/booking-item"
import { getConfirmedBookings } from "../_data/get-confirmed-bookings"
import { getConcludedBookings } from "../_data/get-concluded-bookings"
import { CalendarIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "../_components/ui/button"

const Bookings = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/")

  const confirmedBookings = await getConfirmedBookings()
  const concludedBookings = await getConcludedBookings()
  const hasNoBookings =
    confirmedBookings.length === 0 && concludedBookings.length === 0

  return (
    <>
      <Header />

      <div className="mx-auto max-w-5xl px-5 py-5">
        <h1 className="mb-6 text-xl font-bold">Agendamentos</h1>

        {hasNoBookings && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="rounded-full bg-secondary p-6">
              <CalendarIcon size={32} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold">Nenhum agendamento encontrado</p>
              <p className="mt-1 text-sm text-gray-400">
                Você ainda não fez nenhuma reserva.
              </p>
            </div>
            <Button asChild>
              <Link href="/barbershops">Explorar barbearias</Link>
            </Button>
          </div>
        )}

        {confirmedBookings.length > 0 && (
          <section className="mb-6">
            <h2 className="mb-3 text-xs font-bold uppercase text-gray-400">
              Confirmados
            </h2>
            <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
              {confirmedBookings.map((booking) => (
                <BookingItem
                  key={booking.id}
                  booking={JSON.parse(JSON.stringify(booking))}
                />
              ))}
            </div>
          </section>
        )}

        {concludedBookings.length > 0 && (
          <section>
            <h2 className="mb-3 text-xs font-bold uppercase text-gray-400">
              Finalizados
            </h2>
            <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
              {concludedBookings.map((booking) => (
                <BookingItem
                  key={booking.id}
                  booking={JSON.parse(JSON.stringify(booking))}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}

export default Bookings
