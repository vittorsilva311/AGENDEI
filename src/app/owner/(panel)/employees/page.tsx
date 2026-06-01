"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import { Card, CardContent } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar"
import { Badge } from "@/app/_components/ui/badge"
import { addEmployee } from "@/app/_actions/add-employee"
import { removeEmployee } from "@/app/_actions/remove-employee"
import { createEmployeeInvitation } from "@/app/_actions/create-employee-invitation"
import { toast } from "sonner"
import {
  CalendarDaysIcon,
  CheckCircle2Icon,
  CopyIcon,
  CheckIcon,
  Loader2Icon,
  LinkIcon,
  LockIcon,
  PlusIcon,
  Trash2Icon,
  UnlockIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/app/_components/ui/dialog"
import { addDays, format, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/app/_lib/utils"

interface Employee {
  id: string
  name: string
  specialty: string | null
  imageUrl: string | null
}

interface ScheduleData {
  bookings: Record<string, { clientName: string; serviceName: string }>
  blocked: string[]
}

const TIME_LIST = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00",
]

const EmployeesPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({ name: "", specialty: "", imageUrl: "" })
  const [dialogOpen, setDialogOpen] = useState(false)

  // Invite state
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Schedule state
  const [scheduleEmployee, setScheduleEmployee] = useState<Employee | null>(null)
  const [scheduleDate, setScheduleDate] = useState<Date>(new Date())
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null)
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [togglingSlot, setTogglingSlot] = useState<string | null>(null)

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/owner/employees")
      const data = await res.json()
      setEmployees(data)
    } catch {
      toast.error("Erro ao carregar funcionários")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchSchedule = useCallback(async (empId: string, date: Date) => {
    setScheduleLoading(true)
    setScheduleData(null)
    try {
      const dateStr = format(date, "yyyy-MM-dd")
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
    if (scheduleEmployee) {
      fetchSchedule(scheduleEmployee.id, scheduleDate)
    }
  }, [scheduleEmployee, scheduleDate, fetchSchedule])

  const handleToggleBlock = async (time: string) => {
    if (!scheduleEmployee || togglingSlot) return
    setTogglingSlot(time)
    try {
      const [h, m] = time.split(":").map(Number)
      const d = new Date(scheduleDate)
      d.setHours(h, m, 0, 0)
      await fetch(`/api/owner/employees/${scheduleEmployee.id}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: d.toISOString() }),
      })
      await fetchSchedule(scheduleEmployee.id, scheduleDate)
    } catch {
      toast.error("Erro ao atualizar horário")
    } finally {
      setTogglingSlot(null)
    }
  }

  const handleGenerateInvite = async (emp: Employee) => {
    setInviteLink(null)
    setCopied(false)
    setInviteLoading(true)
    try {
      const result = await createEmployeeInvitation(emp.id)
      setInviteLink(result.link)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar convite")
    } finally {
      setInviteLoading(false)
    }
  }

  const handleCopyInvite = () => {
    if (!inviteLink) return
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    toast.success("Link copiado!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAdd = () => {
    if (!form.name.trim()) {
      toast.error("Nome é obrigatório")
      return
    }
    startTransition(async () => {
      try {
        await addEmployee({
          name: form.name,
          specialty: form.specialty || undefined,
          imageUrl: form.imageUrl || undefined,
        })
        setForm({ name: "", specialty: "", imageUrl: "" })
        setDialogOpen(false)
        toast.success("Funcionário adicionado!")
        await fetchEmployees()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao adicionar")
      }
    })
  }

  const handleRemove = (id: string) => {
    startTransition(async () => {
      try {
        await removeEmployee(id)
        toast.success("Funcionário removido")
        await fetchEmployees()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao remover")
      }
    })
  }

  const bookedCount = scheduleData
    ? Object.keys(scheduleData.bookings).length
    : 0
  const blockedCount = scheduleData ? scheduleData.blocked.length : 0
  const freeCount = TIME_LIST.length - bookedCount - blockedCount

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Funcionários</h1>
          <p className="text-sm text-gray-400">Gerencie a equipe da sua barbearia</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusIcon size={14} className="mr-2" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90%] max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Funcionário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {/* Photo preview */}
              <div className="flex flex-col items-center gap-2">
                <Avatar className="h-20 w-20 border-2 border-secondary">
                  <AvatarImage src={form.imageUrl} className="object-cover" />
                  <AvatarFallback className="text-2xl font-bold text-gray-500">
                    {form.name ? form.name[0].toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
                <p className="text-xs text-gray-500">Pré-visualização da foto</p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Nome *</label>
                <Input
                  placeholder="Ex: Carlos Silva"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Especialidade <span className="text-gray-400">(opcional)</span>
                </label>
                <Input
                  placeholder="Ex: Degradê, Barba"
                  value={form.specialty}
                  onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  URL da foto <span className="text-gray-400">(opcional)</span>
                </label>
                <Input
                  placeholder="https://..."
                  value={form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <DialogClose asChild>
                  <Button variant="outline" className="w-full">Cancelar</Button>
                </DialogClose>
                <Button className="w-full" onClick={handleAdd} disabled={isPending}>
                  {isPending ? <Loader2Icon size={16} className="animate-spin" /> : "Salvar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Employee list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="h-10 w-10 animate-pulse rounded-full bg-secondary" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
                  <div className="h-3 w-20 animate-pulse rounded bg-secondary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : employees.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UsersIcon size={36} className="mx-auto mb-3 text-gray-500" />
            <p className="font-semibold">Nenhum funcionário cadastrado</p>
            <p className="mt-1 text-sm text-gray-400">
              Adicione os funcionários da sua barbearia para acompanhar a performance de cada um.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {employees.map((emp) => (
            <Card key={emp.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <Avatar className="h-11 w-11">
                  <AvatarImage src={emp.imageUrl ?? ""} className="object-cover" />
                  <AvatarFallback className="font-bold">{emp.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{emp.name}</p>
                  {emp.specialty && (
                    <p className="text-xs text-gray-400">{emp.specialty}</p>
                  )}
                </div>

                {/* Invite button */}
                <Dialog
                  onOpenChange={(open) => {
                    if (!open) { setInviteLink(null); setCopied(false) }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-gray-400"
                      onClick={() => handleGenerateInvite(emp)}
                      title="Gerar link de acesso para funcionário"
                    >
                      <LinkIcon size={14} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[90%] max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Convite para {emp.name}</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-400">
                      Envie este link para o funcionário. Ele vai criar uma conta e
                      ter acesso à própria agenda no app.
                    </p>
                    {inviteLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2Icon size={20} className="animate-spin text-primary" />
                      </div>
                    ) : inviteLink ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
                          <p className="flex-1 break-all text-xs text-gray-300">{inviteLink}</p>
                          <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0" onClick={handleCopyInvite}>
                            {copied ? <CheckIcon size={14} className="text-green-400" /> : <CopyIcon size={14} />}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          O link expira em <strong>2 meses</strong>.
                        </p>
                        <Button className="w-full" onClick={handleCopyInvite}>
                          {copied ? "Copiado!" : "Copiar link"}
                        </Button>
                      </div>
                    ) : null}
                  </DialogContent>
                </Dialog>

                {/* Schedule button */}
                <Dialog
                  onOpenChange={(open) => {
                    if (open) {
                      setScheduleEmployee(emp)
                      setScheduleDate(new Date())
                    } else {
                      setScheduleEmployee(null)
                      setScheduleData(null)
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <CalendarDaysIcon size={14} />
                      Agenda
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95%] max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={emp.imageUrl ?? ""} className="object-cover" />
                          <AvatarFallback className="text-xs font-bold">{emp.name[0]}</AvatarFallback>
                        </Avatar>
                        {emp.name}
                      </DialogTitle>
                    </DialogHeader>

                    {/* Date navigation */}
                    <div className="flex items-center justify-between gap-2 rounded-xl border border-secondary bg-secondary/30 px-3 py-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setScheduleDate((d) => subDays(d, 1))}
                      >
                        <ChevronLeftIcon size={16} />
                      </Button>
                      <p className="text-sm font-semibold capitalize">
                        {format(scheduleDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setScheduleDate((d) => addDays(d, 1))}
                      >
                        <ChevronRightIcon size={16} />
                      </Button>
                    </div>

                    {/* Summary badges */}
                    {scheduleData && (
                      <div className="flex gap-2">
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

                    {/* Time slots grid */}
                    {scheduleLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2Icon size={24} className="animate-spin text-primary" />
                      </div>
                    ) : scheduleData ? (
                      <div className="max-h-[400px] overflow-y-auto">
                        <div className="grid grid-cols-3 gap-2">
                          {TIME_LIST.map((time) => {
                            const booking = scheduleData.bookings[time]
                            const isBlocked = scheduleData.blocked.includes(time)
                            const isBusy = !!booking

                            return (
                              <div
                                key={time}
                                className={cn(
                                  "rounded-xl border p-2.5 text-xs transition-all",
                                  isBusy
                                    ? "border-primary/40 bg-primary/10"
                                    : isBlocked
                                    ? "border-destructive/30 bg-destructive/10"
                                    : "border-secondary bg-secondary/30",
                                )}
                              >
                                <p className="mb-1 font-bold">{time}</p>
                                {isBusy ? (
                                  <>
                                    <p className="font-medium text-primary truncate">{booking.clientName}</p>
                                    <p className="text-gray-500 truncate">{booking.serviceName}</p>
                                  </>
                                ) : isBlocked ? (
                                  <>
                                    <p className="text-destructive/80 font-medium">Bloqueado</p>
                                    <button
                                      onClick={() => handleToggleBlock(time)}
                                      disabled={togglingSlot === time}
                                      className="mt-1 flex items-center gap-0.5 text-[10px] text-gray-400 hover:text-foreground"
                                    >
                                      {togglingSlot === time ? (
                                        <Loader2Icon size={10} className="animate-spin" />
                                      ) : (
                                        <UnlockIcon size={10} />
                                      )}
                                      Desbloquear
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-gray-500">Livre</p>
                                    <button
                                      onClick={() => handleToggleBlock(time)}
                                      disabled={togglingSlot === time}
                                      className="mt-1 flex items-center gap-0.5 text-[10px] text-gray-400 hover:text-foreground"
                                    >
                                      {togglingSlot === time ? (
                                        <Loader2Icon size={10} className="animate-spin" />
                                      ) : (
                                        <LockIcon size={10} />
                                      )}
                                      Bloquear
                                    </button>
                                  </>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : null}
                  </DialogContent>
                </Dialog>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleRemove(emp.id)}
                  disabled={isPending}
                >
                  <Trash2Icon size={16} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default EmployeesPage
