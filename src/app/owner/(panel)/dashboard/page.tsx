import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/app/_lib/prisma"
import {
  startOfMonth,
  startOfDay,
  endOfDay,
  isBefore,
  format,
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent } from "@/app/_components/ui/card"
import { Badge } from "@/app/_components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar"
import { Button } from "@/app/_components/ui/button"
import Link from "next/link"
import {
  TrendingUpIcon,
  CalendarIcon,
  UsersIcon,
  ClockIcon,
  CreditCardIcon,
  BanknoteIcon,
  SmartphoneIcon,
  ScissorsIcon,
  SettingsIcon,
  TrophyIcon,
  StarIcon,
} from "lucide-react"

const formatCurrency = (value: number) =>
  Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

const OwnerDashboard = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/")

  const barbershop = await db.barbershop.findFirst({
    where: { ownerId: session.user.id },
  })

  if (!barbershop) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-5 text-center">
        <div className="rounded-full bg-secondary p-6">
          <ScissorsIcon size={32} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Nenhum salão vinculado</h1>
          <p className="mt-1 text-sm text-gray-400">
            Entre em contato com o administrador para vincular seu salão.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">Voltar ao início</Link>
        </Button>
      </div>
    )
  }

  const now = new Date()
  const monthStart = startOfMonth(now)
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)

  const [allBookings, employees] = await Promise.all([
    db.booking.findMany({
      where: { service: { barbershopId: barbershop.id } },
      include: { service: true, user: true, employee: true },
      orderBy: { date: "asc" },
    }),
    db.barbershopEmployee.findMany({
      where: { barbershopId: barbershop.id },
    }),
  ])

  const completedBookings = allBookings.filter((b) => isBefore(b.date, now))
  const totalRevenue = completedBookings.reduce(
    (sum, b) => sum + Number(b.service.price), 0,
  )

  const monthCompleted = completedBookings.filter((b) => b.date >= monthStart)
  const monthRevenue = monthCompleted.reduce(
    (sum, b) => sum + Number(b.service.price), 0,
  )

  const todayBookings = allBookings.filter(
    (b) => b.date >= todayStart && b.date <= todayEnd,
  )
  const todayCompleted = todayBookings.filter((b) => isBefore(b.date, now))
  const todayRevenue = todayCompleted.reduce(
    (sum, b) => sum + Number(b.service.price), 0,
  )
  const upcomingToday = todayBookings.filter((b) => b.date > now)
  const upcomingCount = allBookings.filter((b) => b.date > now).length

  // Payment breakdown (total)
  const cardRevenue = completedBookings
    .filter((b) => b.paymentMethod === "CARD")
    .reduce((sum, b) => sum + Number(b.service.price), 0)
  const pixRevenue = completedBookings
    .filter((b) => b.paymentMethod === "PIX")
    .reduce((sum, b) => sum + Number(b.service.price), 0)
  const cashRevenue = completedBookings
    .filter((b) => b.paymentMethod === "CASH")
    .reduce((sum, b) => sum + Number(b.service.price), 0)

  // Employee stats with today highlight
  const employeeStats = employees
    .map((emp) => {
      const empCompleted = completedBookings.filter((b) => b.employeeId === emp.id)
      const empMonth = empCompleted.filter((b) => b.date >= monthStart)
      const empToday = todayCompleted.filter((b) => b.employeeId === emp.id)
      return {
        ...emp,
        totalBookings: empCompleted.length,
        monthBookings: empMonth.length,
        monthRevenue: empMonth.reduce((s, b) => s + Number(b.service.price), 0),
        todayBookings: empToday.length,
        todayRevenue: empToday.reduce((s, b) => s + Number(b.service.price), 0),
      }
    })
    .sort((a, b) => b.todayBookings - a.todayBookings)

  const topToday = employeeStats.slice(0, 3)

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{barbershop.name}</h1>
          <p className="text-sm capitalize text-gray-400">
            {format(now, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <Badge
          variant="secondary"
          className="mt-1 gap-1 text-xs"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
          Online
        </Badge>
      </div>

      {/* Owner Nav */}
      <div className="mb-8 flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
        <Button asChild size="sm" variant="default">
          <Link href="/owner/dashboard">
            <CalendarIcon size={14} className="mr-1" />
            Painel
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/owner/services">
            <ScissorsIcon size={14} className="mr-1" />
            Serviços
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/owner/employees">
            <UsersIcon size={14} className="mr-1" />
            Equipe
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/owner/settings">
            <SettingsIcon size={14} className="mr-1" />
            Configurações
          </Link>
        </Button>
      </div>

      {/* Destaque do dia */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="col-span-2 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent lg:col-span-1">
          <CardContent className="p-5">
            <div className="mb-2 flex items-center gap-2">
              <TrendingUpIcon size={16} className="text-primary" />
              <span className="text-xs text-gray-400">Receita de Hoje</span>
            </div>
            <p className="text-2xl font-bold text-primary">{formatCurrency(todayRevenue)}</p>
            <p className="mt-1 text-xs text-gray-500">
              {todayCompleted.length} atend. realizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="mb-2 flex items-center gap-2">
              <ClockIcon size={16} className="text-yellow-500" />
              <span className="text-xs text-gray-400">Próximos Hoje</span>
            </div>
            <p className="text-xl font-bold">{upcomingToday.length}</p>
            <p className="mt-1 text-xs text-gray-500">agendamentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="mb-2 flex items-center gap-2">
              <TrendingUpIcon size={16} className="text-green-500" />
              <span className="text-xs text-gray-400">Este Mês</span>
            </div>
            <p className="text-xl font-bold text-green-400">{formatCurrency(monthRevenue)}</p>
            <p className="mt-1 text-xs text-gray-500">{monthCompleted.length} atend.</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="mb-2 flex items-center gap-2">
              <CalendarIcon size={16} className="text-primary" />
              <span className="text-xs text-gray-400">Total Geral</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(totalRevenue)}</p>
            <p className="mt-1 text-xs text-gray-500">{completedBookings.length} atend.</p>
          </CardContent>
        </Card>
      </div>

      {/* Formas de pagamento */}
      <div className="mb-8 grid grid-cols-3 gap-3">
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-4">
            <div className="mb-1.5 flex items-center gap-2">
              <CreditCardIcon size={14} className="text-blue-400" />
              <span className="text-xs text-gray-400">Cartão</span>
            </div>
            <p className="font-bold">{formatCurrency(cardRevenue)}</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4">
            <div className="mb-1.5 flex items-center gap-2">
              <SmartphoneIcon size={14} className="text-emerald-400" />
              <span className="text-xs text-gray-400">PIX</span>
            </div>
            <p className="font-bold">{formatCurrency(pixRevenue)}</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="p-4">
            <div className="mb-1.5 flex items-center gap-2">
              <BanknoteIcon size={14} className="text-yellow-400" />
              <span className="text-xs text-gray-400">Dinheiro</span>
            </div>
            <p className="font-bold">{formatCurrency(cashRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Agenda de hoje */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <CalendarIcon size={16} className="text-primary" />
            <h2 className="font-bold">Agenda de Hoje</h2>
            <Badge variant="secondary" className="text-xs">{todayBookings.length}</Badge>
          </div>

          {todayBookings.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <CalendarIcon size={28} className="mx-auto mb-2 text-gray-500" />
                <p className="text-sm text-gray-400">Sem agendamentos para hoje.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {todayBookings.map((booking) => {
                const done = isBefore(booking.date, now)
                return (
                  <Card key={booking.id} className={done ? "opacity-50" : ""}>
                    <CardContent className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={booking.user.image ?? ""} />
                          <AvatarFallback>{booking.user.name?.[0] ?? "?"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold">{booking.user.name}</p>
                          <p className="text-xs text-gray-400">
                            {booking.service.name} · {formatCurrency(Number(booking.service.price))}
                          </p>
                          {booking.employee && (
                            <p className="text-xs text-primary">{booking.employee.name}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={done ? "secondary" : "default"} className="text-xs">
                          {format(booking.date, "HH:mm")}
                        </Badge>
                        {booking.paymentMethod && (
                          <span className="text-xs text-gray-500">
                            {booking.paymentMethod === "CARD" ? "Cartão"
                              : booking.paymentMethod === "PIX" ? "PIX" : "Dinheiro"}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Melhores do dia */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrophyIcon size={16} className="text-yellow-500" />
              <h2 className="font-bold">Melhores do Dia</h2>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link href="/owner/employees">Ver equipe</Link>
            </Button>
          </div>

          {topToday.length === 0 || topToday.every((e) => e.todayBookings === 0) ? (
            <Card>
              <CardContent className="py-10 text-center">
                <UsersIcon size={28} className="mx-auto mb-2 text-gray-500" />
                <p className="text-sm text-gray-400">Nenhum atendimento hoje ainda.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {topToday.filter((e) => e.todayBookings > 0).map((emp, i) => (
                <Card
                  key={emp.id}
                  className={
                    i === 0
                      ? "border-yellow-500/30 bg-yellow-500/5"
                      : i === 1
                        ? "border-gray-400/30 bg-gray-400/5"
                        : "border-orange-400/20 bg-orange-400/5"
                  }
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-bold text-sm"
                      style={{
                        background: i === 0 ? "rgba(234,179,8,0.2)" : i === 1 ? "rgba(156,163,175,0.2)" : "rgba(251,146,60,0.2)",
                        color: i === 0 ? "#eab308" : i === 1 ? "#9ca3af" : "#fb923c",
                      }}
                    >
                      {i === 0 ? <StarIcon size={14} /> : `${i + 1}º`}
                    </div>
                    <Avatar>
                      <AvatarImage src={emp.imageUrl ?? ""} />
                      <AvatarFallback>{emp.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{emp.name}</p>
                      {emp.specialty && (
                        <p className="text-xs text-gray-400">{emp.specialty}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{formatCurrency(emp.todayRevenue)}</p>
                      <p className="text-xs text-gray-400">{emp.todayBookings} atend. hoje</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Próximos agendamentos do dia */}
          {upcomingToday.length > 0 && (
            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2">
                <ClockIcon size={14} className="text-yellow-500" />
                <h3 className="text-sm font-bold">Próximos agendamentos</h3>
              </div>
              <div className="space-y-2">
                {upcomingToday.slice(0, 4).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between rounded-lg border border-secondary/50 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={booking.user.image ?? ""} />
                        <AvatarFallback className="text-xs">{booking.user.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-medium">{booking.user.name}</p>
                        <p className="text-xs text-gray-500">{booking.service.name}</p>
                      </div>
                    </div>
                    <Badge className="text-xs">{format(booking.date, "HH:mm")}</Badge>
                  </div>
                ))}
                {upcomingToday.length > 4 && (
                  <p className="text-center text-xs text-gray-500">
                    +{upcomingToday.length - 4} agendamentos
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ranking mensal da equipe */}
      {employeeStats.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UsersIcon size={16} className="text-primary" />
              <h2 className="font-bold">Desempenho da Equipe — Mês</h2>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/owner/employees">Gerenciar equipe</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {employeeStats.map((emp) => (
              <Card key={emp.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar>
                    <AvatarImage src={emp.imageUrl ?? ""} />
                    <AvatarFallback>{emp.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{emp.name}</p>
                    {emp.specialty && (
                      <p className="text-xs text-gray-400">{emp.specialty}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{formatCurrency(emp.monthRevenue)}</p>
                    <p className="text-xs text-gray-400">{emp.monthBookings} atend. este mês</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Próximos (todos) */}
      {upcomingCount > upcomingToday.length && (
        <p className="mt-6 text-center text-xs text-gray-500">
          {upcomingCount} agendamentos futuros no total
        </p>
      )}
    </div>
  )
}

export default OwnerDashboard
