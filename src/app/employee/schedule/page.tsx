"use client"

import { useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/app/_components/ui/card"
import { Badge } from "@/app/_components/ui/badge"
import { Button } from "@/app/_components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar"
import { toast } from "sonner"
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  LockIcon,
  UnlockIcon,
  CheckCircle2Icon,
  TrendingUpIcon,
  ClockIcon,
} from "lucide-react"
import { addDays, format, isToday, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/app/_lib/utils"

interface ScheduleData {
  bookings: Record<string, { clientName: string; serviceName: string }>
  blocked: string[]
}

interface EmployeeInfo {
  id: string
  name: string
  imageUrl: string | null
  specialty: string | null
  barbershopName: string
  todayRevenue: number
  todayTotal: number
  todayUpcoming: number
}

const TIME_LIST = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00",
]

const EmployeeSchedulePage = () => {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo | null>(null)
  const [infoLoading, setInfoLoading] = useState(true)

  const [date, setDate] = useState<Date>(new Date())
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null)
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [togglingSlot, setTogglingSlot] = useState<string | null>(null)

  // Redirect if not employee
  useEffect(() => {
    if (status === "unauthenticated") router.push("/")
    if (status === "authenticated" && session.user.role !== "EMPLOYEE" && session.user.role !== "ADMIN" && session.user.role !== "OWNER") {
      router.push("/")
    }
  }, [status, session, router])

  // Load employee info
  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/employee/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { toast.error(data.error); return }
        setEmployeeInfo(data)
      })
      .catch(() => toast.error("Erro ao carregar perfil"))
      .finally(() => setInfoLoading(false))
  }, [status])

  const fetchSchedule = useCallback(async (empId: string, d: Date) => {
    setScheduleLoading(true)
    setScheduleData(null)
    try {
      const dateStr = format(d, "yyyy-MM-dd")
      const res = await fetch(`/api/owner/employees/${empId}/schedule?date=${dateStr}`)
      const data = await res.json()
      setScheduleData(data)
    } catch {
      toast.error("Erro ao carregar agenda")
    } finally {
      setScheduleLoading(false)
    }
  }, [])

  useEffect(() => {
    if (employeeInfo) fetchSchedule(employeeInfo.id, date)
  }, [employeeInfo, date, fetchSchedule])

  const handleToggleBlock = async (time: string) => {
    if (!employeeInfo || togglingSlot) return
    setTogglingSlot(time)
    try {
      const [h, m] = time.split(":").map(Number)
      const d = new Date(date)
      d.setHours(h, m, 0, 0)
      await fetch(`/api/owner/employees/${employeeInfo.id}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: d.toISOString() }),
      })
      await fetchSchedule(employeeInfo.id, date)
    } catch {
      toast.error("Erro ao atualizar horário")
    } finally {
      setTogglingSlot(null)
    }
  }

  if (status === "loading" || infoLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2Icon size={32} className="animate-spin text-primary" />
      </div>
    )
  }

  if (!employeeInfo) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
        <CalendarIcon size={48} className="text-gray-500" />
        <h1 className="text-xl font-bold">Sem perfil vinculado</h1>
        <p className="text-sm text-gray-400">
          Sua conta ainda não está vinculada a um perfil de funcionário.
          Peça ao proprietário do salão para gerar um link de convite.
        </p>
        <Button variant="outline" onClick={() => router.push("/")}>Ir para início</Button>
      </div>
    )
  }

  const bookedCount = scheduleData ? Object.keys(scheduleData.bookings).length : 0
  const blockedCount = scheduleData ? scheduleData.blocked.length : 0
  const freeCount = TIME_LIST.length - bookedCount - blockedCount

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <Avatar className="h-14 w-14 border-2 border-primary/30">
          <AvatarImage src={employeeInfo.imageUrl ?? ""} className="object-cover" />
          <AvatarFallback className="text-lg font-bold">{employeeInfo.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-bold">{employeeInfo.name}</h1>
          <p className="text-sm text-gray-400">
            {employeeInfo.specialty ? `${employeeInfo.specialty} · ` : ""}
            {employeeInfo.barbershopName}
          </p>
        </div>
      </div>

      {/* Revenue cards */}
      <div className="mb-5 grid grid-cols-3 gap-2">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-3">
            <div className="mb-1 flex items-center gap-1">
              <TrendingUpIcon size={12} className="text-primary" />
              <span className="text-[10px] text-gray-400">Faturado hoje</span>
            </div>
            <p className="text-sm font-bold text-primary">
              {Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(employeeInfo.todayRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="mb-1 flex items-center gap-1">
              <CheckCircle2Icon size={12} className="text-green-400" />
              <span className="text-[10px] text-gray-400">Realizados</span>
            </div>
            <p className="text-sm font-bold">{employeeInfo.todayTotal - employeeInfo.todayUpcoming}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="mb-1 flex items-center gap-1">
              <ClockIcon size={12} className="text-yellow-400" />
              <span className="text-[10px] text-gray-400">Próximos</span>
            </div>
            <p className="text-sm font-bold">{employeeInfo.todayUpcoming}</p>
          </CardContent>
        </Card>
      </div>

      {/* Date navigation */}
      <div className="mb-4 flex items-center justify-between gap-2 rounded-xl border border-secondary bg-secondary/30 px-3 py-2">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDate((d) => subDays(d, 1))}>
          <ChevronLeftIcon size={16} />
        </Button>
        <div className="text-center">
          <p className="text-sm font-semibold capitalize">
            {format(date, "EEEE", { locale: ptBR })}
          </p>
          <p className="text-xs text-gray-400">
            {format(date, "dd 'de' MMMM", { locale: ptBR })}
          </p>
          {isToday(date) && (
            <Badge className="mt-1 text-[10px]">Hoje</Badge>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDate((d) => addDays(d, 1))}>
          <ChevronRightIcon size={16} />
        </Button>
      </div>

      {/* Today shortcut */}
      {!isToday(date) && (
        <Button variant="outline" size="sm" className="mb-4 w-full" onClick={() => setDate(new Date())}>
          <CalendarIcon size={13} className="mr-1" />
          Ir para hoje
        </Button>
      )}

      {/* Summary */}
      {scheduleData && (
        <div className="mb-4 flex gap-2">
          <Badge className="gap-1 bg-primary/10 text-primary">
            <CheckCircle2Icon size={11} />
            {bookedCount} agend.
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <LockIcon size={11} />
            {blockedCount} bloqueado{blockedCount !== 1 ? "s" : ""}
          </Badge>
          <Badge variant="outline" className="gap-1 text-gray-400">
            {freeCount} livre{freeCount !== 1 ? "s" : ""}
          </Badge>
        </div>
      )}

      {/* Slots */}
      {scheduleLoading ? (
        <div className="flex justify-center py-16">
          <Loader2Icon size={28} className="animate-spin text-primary" />
        </div>
      ) : scheduleData ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TIME_LIST.map((time) => {
            const booking = scheduleData.bookings[time]
            const isBlocked = scheduleData.blocked.includes(time)
            const isBusy = !!booking

            return (
              <Card
                key={time}
                className={cn(
                  "transition-all",
                  isBusy ? "border-primary/40 bg-primary/10" : isBlocked ? "border-destructive/30 bg-destructive/10" : "",
                )}
              >
                <CardContent className="p-3">
                  <p className="mb-1 text-sm font-bold">{time}</p>
                  {isBusy ? (
                    <>
                      <p className="truncate text-xs font-medium text-primary">{booking.clientName}</p>
                      <p className="truncate text-xs text-gray-500">{booking.serviceName}</p>
                    </>
                  ) : isBlocked ? (
                    <>
                      <p className="text-xs font-medium text-destructive/80">Bloqueado</p>
                      <button
                        onClick={() => handleToggleBlock(time)}
                        disabled={!!togglingSlot}
                        className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-400 hover:text-foreground"
                      >
                        {togglingSlot === time
                          ? <Loader2Icon size={10} className="animate-spin" />
                          : <UnlockIcon size={10} />}
                        Liberar
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-gray-500">Livre</p>
                      <button
                        onClick={() => handleToggleBlock(time)}
                        disabled={!!togglingSlot}
                        className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-400 hover:text-foreground"
                      >
                        {togglingSlot === time
                          ? <Loader2Icon size={10} className="animate-spin" />
                          : <LockIcon size={10} />}
                        Bloquear
                      </button>
                    </>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export default EmployeeSchedulePage
