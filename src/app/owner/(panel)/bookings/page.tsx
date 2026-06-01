"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import { Badge } from "@/app/_components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar"
import { toast } from "sonner"
import { format, isFuture } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  CalendarIcon,
  ScissorsIcon,
  UsersIcon,
  SettingsIcon,
  Loader2Icon,
  FilterIcon,
  CreditCardIcon,
  SmartphoneIcon,
  BanknoteIcon,
  Trash2Icon,
} from "lucide-react"
import Link from "next/link"
import { cancelBookingAsOwner } from "@/app/_actions/cancel-booking-owner"

interface Booking {
  id: string
  date: string
  paymentMethod: string | null
  user: { name: string | null; email: string | null; image: string | null }
  service: { name: string; price: number }
  employee: { name: string } | null
}

interface Employee {
  id: string
  name: string
}

const formatCurrency = (v: number) =>
  Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

const paymentLabel = (m: string | null) =>
  m === "CARD" ? "Cartão" : m === "PIX" ? "PIX" : m === "CASH" ? "Dinheiro" : "—"

const paymentIcon = (m: string | null) => {
  if (m === "CARD") return <CreditCardIcon size={12} className="text-blue-400" />
  if (m === "PIX") return <SmartphoneIcon size={12} className="text-emerald-400" />
  if (m === "CASH") return <BanknoteIcon size={12} className="text-yellow-400" />
  return null
}

const OwnerBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("today")
  const [employeeFilter, setEmployeeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [cancelingId, setCancelingId] = useState<string | null>(null)

  const fetchBookings = () => {
    setLoading(true)
    const params = new URLSearchParams({ period, status: statusFilter })
    if (employeeFilter) params.set("employee", employeeFilter)

    fetch(`/api/owner/bookings?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { toast.error(data.error); return }
        setBookings(data.bookings)
        setEmployees(data.employees)
      })
      .catch(() => toast.error("Erro ao carregar agendamentos"))
      .finally(() => setLoading(false))
  }

  const handleCancelBooking = async (id: string) => {
    if (!confirm("Cancelar este agendamento? Essa ação não pode ser desfeita.")) return
    setCancelingId(id)
    try {
      await cancelBookingAsOwner(id)
      toast.success("Agendamento cancelado")
      fetchBookings()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao cancelar")
    } finally {
      setCancelingId(null)
    }
  }

  useEffect(() => { fetchBookings() }, [period, employeeFilter, statusFilter]) // eslint-disable-line

  const totalRevenue = bookings
    .filter((b) => !isFuture(new Date(b.date)))
    .reduce((s, b) => s + Number(b.service.price), 0)

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      {/* Header + Nav */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Agendamentos</h1>
        <p className="text-sm text-gray-400">Acompanhe e gerencie todos os agendamentos</p>
      </div>

      <div className="mb-8 flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
        <Button asChild size="sm" variant="outline">
          <Link href="/owner/dashboard"><CalendarIcon size={14} className="mr-1" />Painel</Link>
        </Button>
        <Button asChild size="sm" variant="default">
          <Link href="/owner/bookings"><CalendarIcon size={14} className="mr-1" />Agendamentos</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/owner/services"><ScissorsIcon size={14} className="mr-1" />Serviços</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/owner/employees"><UsersIcon size={14} className="mr-1" />Equipe</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/owner/settings"><SettingsIcon size={14} className="mr-1" />Configurações</Link>
        </Button>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-3">
        {/* Período */}
        <div className="flex items-center gap-1 rounded-lg border border-secondary bg-secondary/30 p-1">
          <FilterIcon size={12} className="ml-2 text-gray-400" />
          {[
            { label: "Hoje", value: "today" },
            { label: "Semana", value: "week" },
            { label: "Mês", value: "month" },
            { label: "Todos", value: "all" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                period === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-400 hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Status */}
        <div className="flex items-center gap-1 rounded-lg border border-secondary bg-secondary/30 p-1">
          {[
            { label: "Todos", value: "all" },
            { label: "Próximos", value: "upcoming" },
            { label: "Realizados", value: "completed" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                statusFilter === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-400 hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Profissional */}
        {employees.length > 0 && (
          <div className="flex items-center gap-1 rounded-lg border border-secondary bg-secondary/30 p-1">
            <button
              onClick={() => setEmployeeFilter("")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                !employeeFilter
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-400 hover:text-foreground"
              }`}
            >
              Todos
            </button>
            {employees.map((emp) => (
              <button
                key={emp.id}
                onClick={() => setEmployeeFilter(emp.id)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  employeeFilter === emp.id
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-400 hover:text-foreground"
                }`}
              >
                {emp.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Resumo */}
      {!loading && bookings.length > 0 && (
        <div className="mb-6 flex gap-3">
          <Card className="flex-1">
            <CardContent className="p-4">
              <p className="text-xs text-gray-400">Total de agendamentos</p>
              <p className="text-xl font-bold">{bookings.length}</p>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="p-4">
              <p className="text-xs text-gray-400">Receita realizada</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(totalRevenue)}</p>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="p-4">
              <p className="text-xs text-gray-400">Próximos</p>
              <p className="text-xl font-bold">
                {bookings.filter((b) => isFuture(new Date(b.date))).length}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2Icon size={32} className="animate-spin text-primary" />
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <CalendarIcon size={32} className="text-gray-500" />
            <p className="text-sm text-gray-400">Nenhum agendamento encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {bookings.map((booking) => {
            const date = new Date(booking.date)
            const upcoming = isFuture(date)
            return (
              <Card key={booking.id} className={!upcoming ? "opacity-70" : ""}>
                <CardContent className="flex items-center gap-4 p-4">
                  {/* Horário */}
                  <div className="flex w-14 flex-shrink-0 flex-col items-center rounded-lg border border-secondary bg-secondary/30 py-2">
                    <p className="text-xs text-gray-400">
                      {format(date, "dd MMM", { locale: ptBR })}
                    </p>
                    <p className="text-lg font-bold">{format(date, "HH:mm")}</p>
                  </div>

                  {/* Cliente */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-9 w-9 flex-shrink-0">
                      <AvatarImage src={booking.user.image ?? ""} />
                      <AvatarFallback>{booking.user.name?.[0] ?? "?"}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{booking.user.name}</p>
                      <p className="truncate text-xs text-gray-400">{booking.service.name}</p>
                    </div>
                  </div>

                  {/* Profissional */}
                  {booking.employee && (
                    <div className="hidden sm:block">
                      <p className="text-xs text-gray-500">Profissional</p>
                      <p className="text-xs font-medium">{booking.employee.name}</p>
                    </div>
                  )}

                  {/* Pagamento */}
                  <div className="hidden sm:flex flex-col items-end gap-1">
                    <p className="text-sm font-bold text-primary">
                      {formatCurrency(Number(booking.service.price))}
                    </p>
                    <div className="flex items-center gap-1">
                      {paymentIcon(booking.paymentMethod)}
                      <span className="text-xs text-gray-400">
                        {paymentLabel(booking.paymentMethod)}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <Badge variant={upcoming ? "default" : "secondary"} className="flex-shrink-0 text-xs">
                    {upcoming ? "Próximo" : "Realizado"}
                  </Badge>

                  {/* Cancel */}
                  {upcoming && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={cancelingId === booking.id}
                      className="flex-shrink-0 text-destructive hover:text-destructive/80 disabled:opacity-50"
                      title="Cancelar agendamento"
                    >
                      {cancelingId === booking.id
                        ? <Loader2Icon size={14} className="animate-spin" />
                        : <Trash2Icon size={14} />}
                    </button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default OwnerBookingsPage
