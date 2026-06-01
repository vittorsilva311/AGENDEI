"use client"

import { Barbershop, BarbershopEmployee, Booking, Service } from "@prisma/client"
import Image from "next/image"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet"
import { Calendar } from "./ui/calendar"
import { ptBR } from "date-fns/locale"
import { useEffect, useMemo, useRef, useState } from "react"
import { isPast, isToday, set } from "date-fns"
import { createBooking } from "../_actions/create-booking"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { getBookings } from "../_actions/get-bookings"
import { Dialog, DialogContent } from "./ui/dialog"
import SignInDialog from "./sign-in-dialog"
import BookingSummary from "./booking-summary"
import { useRouter } from "next/navigation"
import { PaymentMethod } from "@prisma/client"
import {
  BanknoteIcon,
  ClockIcon,
  CreditCardIcon,
  Loader2Icon,
  SmartphoneIcon,
  UserIcon,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { cn } from "../_lib/utils"

interface ServiceItemProps {
  service: Service
  barbershop: Pick<Barbershop, "name" | "id" | "openTime" | "closeTime" | "workingDays">
  employees: Pick<BarbershopEmployee, "id" | "name" | "imageUrl" | "specialty">[]
}

const generateTimeList = (openTime: string, closeTime: string): string[] => {
  const times: string[] = []
  const [openH, openM] = openTime.split(":").map(Number)
  const [closeH, closeM] = closeTime.split(":").map(Number)
  let h = openH, m = openM
  while (h < closeH || (h === closeH && m < closeM)) {
    times.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
    m += 30
    if (m >= 60) { m -= 60; h++ }
  }
  return times
}

const getTimeList = ({
  bookings,
  selectedDay,
  durationMinutes,
  timeList,
}: {
  bookings: Booking[]
  selectedDay: Date
  durationMinutes: number
  timeList: string[]
}) => {
  const slotsNeeded = Math.ceil(durationMinutes / 30)

  return timeList.filter((time, index) => {
    const [h, m] = time.split(":").map(Number)
    if (isPast(set(new Date(), { hours: h, minutes: m })) && isToday(selectedDay)) return false

    for (let i = 0; i < slotsNeeded; i++) {
      const checkIndex = index + i
      if (checkIndex >= timeList.length) return false
      const [ch, cm] = timeList[checkIndex].split(":").map(Number)
      if (bookings.some((b) => b.date.getHours() === ch && b.date.getMinutes() === cm)) return false
    }
    return true
  })
}

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: "CARD", label: "Cartão", icon: <CreditCardIcon size={18} /> },
  { value: "PIX", label: "PIX", icon: <SmartphoneIcon size={18} /> },
  { value: "CASH", label: "Dinheiro", icon: <BanknoteIcon size={18} /> },
]

const formatDuration = (min: number) => {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

const ServiceItem = ({ service, barbershop, employees }: ServiceItemProps) => {
  const { data } = useSession()
  const router = useRouter()
  const [signInDialogIsOpen, setSignInDialogIsOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined)
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | undefined>(undefined)
  const [dayBookings, setDayBookings] = useState<Booking[]>([])
  const [bookingSheetIsOpen, setBookingSheetIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const employeeRef = useRef<HTMLDivElement>(null)
  const paymentRef = useRef<HTMLDivElement>(null)

  const timeList = useMemo(
    () => generateTimeList(barbershop.openTime, barbershop.closeTime),
    [barbershop.openTime, barbershop.closeTime],
  )

  const closedDays = useMemo(
    () => [0, 1, 2, 3, 4, 5, 6].filter((d) => !barbershop.workingDays.includes(d)),
    [barbershop.workingDays],
  )

  useEffect(() => {
    const fetch = async () => {
      if (!selectedDay) return
      const bookings = await getBookings({ date: selectedDay, serviceId: service.id })
      setDayBookings(bookings)
    }
    fetch()
  }, [selectedDay, service.id])

  useEffect(() => {
    if (selectedTime && employeeRef.current) {
      setTimeout(() => employeeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100)
    }
  }, [selectedTime])

  useEffect(() => {
    if (selectedEmployee !== undefined && selectedTime && paymentRef.current) {
      setTimeout(() => paymentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100)
    }
  }, [selectedEmployee, selectedTime])

  const selectedDate = useMemo(() => {
    if (!selectedDay || !selectedTime) return undefined
    return set(selectedDay, {
      hours: Number(selectedTime.split(":")[0]),
      minutes: Number(selectedTime.split(":")[1]),
    })
  }, [selectedDay, selectedTime])

  const handleBookingClick = () => {
    if (data?.user) return setBookingSheetIsOpen(true)
    return setSignInDialogIsOpen(true)
  }

  const handleBookingSheetOpenChange = () => {
    setSelectedDay(undefined)
    setSelectedTime(undefined)
    setSelectedEmployee(null)
    setSelectedPayment(undefined)
    setDayBookings([])
    setBookingSheetIsOpen(false)
  }

  const handleCreateBooking = async () => {
    try {
      if (!selectedDate) return
      setIsSubmitting(true)
      await createBooking({
        serviceId: service.id,
        date: selectedDate,
        paymentMethod: selectedPayment,
        employeeId: selectedEmployee ?? undefined,
      })
      handleBookingSheetOpenChange()
      toast.success("Agendamento confirmado!", {
        description: "Você receberá uma confirmação por e-mail.",
        action: {
          label: "Ver agendamentos",
          onClick: () => router.push("/bookings"),
        },
      })
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Erro ao confirmar agendamento.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableTimes = useMemo(() => {
    if (!selectedDay) return []
    return getTimeList({ bookings: dayBookings, selectedDay, durationMinutes: service.durationMinutes, timeList })
  }, [dayBookings, selectedDay, service.durationMinutes, timeList])

  const employeeChosen = selectedTime !== undefined && selectedEmployee !== undefined

  return (
    <>
      <Card className="transition-all hover:border-primary/40">
        <CardContent className="flex items-center gap-3 p-3">
          <div className="relative h-[110px] w-[110px] flex-shrink-0 overflow-hidden rounded-lg">
            <Image alt={service.name} src={service.imageUrl} fill className="object-cover" />
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <h3 className="font-semibold">{service.name}</h3>
            <p className="line-clamp-2 text-sm text-gray-400">{service.description}</p>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary">
                  {Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(service.price))}
                </p>
                <p className="flex items-center gap-1 text-xs text-gray-500">
                  <ClockIcon size={11} />{formatDuration(service.durationMinutes)}
                </p>
              </div>

              <Sheet open={bookingSheetIsOpen} onOpenChange={handleBookingSheetOpenChange}>
                <Button variant="secondary" size="sm" onClick={handleBookingClick}>
                  Agendar
                </Button>

                <SheetContent className="flex flex-col px-0">
                  <SheetHeader className="px-5">
                    <SheetTitle>Novo Agendamento</SheetTitle>
                  </SheetHeader>

                  {/* Steps indicator */}
                  <div className="flex items-center gap-1 px-5 pb-1">
                    {[
                      { label: "Data", done: !!selectedDay },
                      { label: "Hora", done: !!selectedTime },
                      { label: "Profissional", done: employeeChosen },
                      { label: "Pagamento", done: !!selectedPayment },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <div className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                          step.done ? "bg-primary text-primary-foreground" : "bg-secondary text-gray-400")}>
                          {step.done ? "✓" : i + 1}
                        </div>
                        <span className={cn("text-[10px]", step.done ? "text-primary" : "text-gray-500")}>{step.label}</span>
                        {i < 3 && <div className="h-px w-3 bg-secondary" />}
                      </div>
                    ))}
                  </div>

                  {/* Scrollable content */}
                  <div className="flex-1 overflow-y-auto">
                    {/* 1. Calendário */}
                    <div className="border-b border-solid py-5">
                      <Calendar
                        mode="single"
                        locale={ptBR}
                        selected={selectedDay}
                        onSelect={(day) => {
                          setSelectedDay(day)
                          setSelectedTime(undefined)
                          setSelectedEmployee(null)
                          setSelectedPayment(undefined)
                        }}
                        startMonth={new Date()}
                        disabled={[{ before: new Date() }, ...(closedDays.length > 0 ? [{ dayOfWeek: closedDays as [0,1,2,3,4,5,6] }] : [])]}
                        styles={{
                          weekday: { width: "100%", textTransform: "capitalize" },
                          day: { width: "100%" },
                          day_button: { width: "100%" },
                          button_previous: { width: "32px", height: "32px" },
                          button_next: { width: "32px", height: "32px" },
                          month_caption: { textTransform: "capitalize" },
                        }}
                      />
                    </div>

                    {/* 2. Horários */}
                    {selectedDay && (
                      <div className="border-b border-solid p-5">
                        <p className="mb-3 text-xs font-bold uppercase text-gray-400">Horários disponíveis</p>
                        {availableTimes.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {availableTimes.map((time) => (
                              <Button key={time} variant={selectedTime === time ? "default" : "outline"}
                                className="rounded-full"
                                onClick={() => { setSelectedTime(time); setSelectedEmployee(null); setSelectedPayment(undefined) }}>
                                {time}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-sm text-gray-400">Sem horários disponíveis para este dia.</p>
                        )}
                      </div>
                    )}

                    {/* 3. Profissional */}
                    {selectedTime && (
                      <div ref={employeeRef} className="border-b border-solid p-5">
                        <p className="mb-3 text-xs font-bold uppercase text-gray-400">Escolha o profissional</p>
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => setSelectedEmployee(null)}
                            className={cn("flex flex-col items-center gap-2 rounded-xl border p-3 transition-all",
                              selectedEmployee === null && employeeChosen
                                ? "border-primary bg-primary/10" : "border-secondary bg-secondary/30 hover:border-primary/40")}>
                            <div className={cn("flex h-12 w-12 items-center justify-center rounded-full",
                              selectedEmployee === null && employeeChosen ? "bg-primary/20" : "bg-secondary")}>
                              <UserIcon size={20} className={selectedEmployee === null && employeeChosen ? "text-primary" : "text-gray-400"} />
                            </div>
                            <div className="text-center">
                              <p className={cn("text-xs font-semibold", selectedEmployee === null && employeeChosen ? "text-primary" : "")}>Sem preferência</p>
                              <p className="text-[10px] text-gray-500">Qualquer um</p>
                            </div>
                          </button>

                          {employees.map((emp) => (
                            <button key={emp.id} onClick={() => setSelectedEmployee(emp.id)}
                              className={cn("flex flex-col items-center gap-2 rounded-xl border p-3 transition-all",
                                selectedEmployee === emp.id ? "border-primary bg-primary/10" : "border-secondary bg-secondary/30 hover:border-primary/40")}>
                              <Avatar className={cn("h-12 w-12 border-2", selectedEmployee === emp.id ? "border-primary" : "border-transparent")}>
                                <AvatarImage src={emp.imageUrl ?? ""} className="object-cover" />
                                <AvatarFallback className="font-bold">{emp.name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="text-center">
                                <p className={cn("text-xs font-semibold", selectedEmployee === emp.id ? "text-primary" : "")}>{emp.name}</p>
                                {emp.specialty && <p className="text-[10px] text-gray-500">{emp.specialty}</p>}
                              </div>
                            </button>
                          ))}

                          {employees.length === 0 && (
                            <p className="text-sm text-gray-400">Nenhum profissional cadastrado.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 4. Pagamento */}
                    {employeeChosen && (
                      <div ref={paymentRef} className="border-b border-solid px-5 py-4">
                        <p className="mb-3 text-xs font-bold uppercase text-gray-400">Forma de pagamento</p>
                        <div className="flex gap-3">
                          {PAYMENT_OPTIONS.map((opt) => (
                            <button key={opt.value} onClick={() => setSelectedPayment(opt.value)}
                              className={cn("flex flex-1 flex-col items-center gap-2 rounded-xl border py-4 text-xs font-medium transition-all",
                                selectedPayment === opt.value
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-secondary bg-secondary/30 text-gray-400 hover:border-primary/40")}>
                              {opt.icon}{opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 5. Resumo */}
                    {selectedDate && employeeChosen && (
                      <div className="p-5">
                        <BookingSummary barbershop={barbershop} service={service} selectedDate={selectedDate} />
                        {selectedEmployee && (
                          <div className="mt-3 flex items-center justify-between rounded-xl border border-solid px-3 py-2">
                            <span className="text-xs text-gray-400">Profissional</span>
                            <span className="text-xs font-semibold">{employees.find((e) => e.id === selectedEmployee)?.name ?? "—"}</span>
                          </div>
                        )}
                        {selectedPayment && (
                          <div className="mt-2 flex items-center justify-between rounded-xl border border-solid px-3 py-2">
                            <span className="text-xs text-gray-400">Pagamento</span>
                            <span className="text-xs font-semibold">
                              {selectedPayment === "CARD" ? "Cartão" : selectedPayment === "PIX" ? "PIX" : "Dinheiro"}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer fixo */}
                  <SheetFooter className="border-t border-solid px-5 pb-5 pt-4">
                    <Button
                      onClick={handleCreateBooking}
                      disabled={!selectedDay || !selectedTime || !employeeChosen || isSubmitting}
                      className="w-full" size="lg">
                      {isSubmitting ? <Loader2Icon size={18} className="animate-spin" /> : "Confirmar agendamento"}
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={signInDialogIsOpen} onOpenChange={setSignInDialogIsOpen}>
        <DialogContent className="w-[90%]">
          <SignInDialog />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ServiceItem
