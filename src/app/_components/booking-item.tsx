"use client"

import { Prisma } from "@prisma/client"
import { Avatar, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Card, CardContent } from "./ui/card"
import { format, isFuture } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"
import PhoneItem from "./phone-item"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { DialogClose } from "@radix-ui/react-dialog"
import { deleteBooking } from "../_actions/delete-booking"
import { createReview } from "../_actions/create-review"
import { toast } from "sonner"
import { useState } from "react"
import BookingSummary from "./booking-summary"
import { Loader2Icon, StarIcon } from "lucide-react"
import { cn } from "../_lib/utils"

interface BookingItemProps {
  booking: Prisma.BookingGetPayload<{
    include: {
      service: {
        include: {
          barbershop: true
        }
      }
      review: true
    }
  }>
}

const BookingItem = ({ booking }: BookingItemProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [selectedStar, setSelectedStar] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  const { service: { barbershop } } = booking
  const isConfirmed = isFuture(booking.date)
  const hasReview = !!booking.review

  const handleCancelBooking = async () => {
    try {
      setIsCanceling(true)
      await deleteBooking(booking.id)
      setIsSheetOpen(false)
      toast.success("Reserva cancelada com sucesso!")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao cancelar reserva.")
    } finally {
      setIsCanceling(false)
    }
  }

  const handleSubmitReview = async () => {
    if (selectedStar === 0) { toast.error("Selecione uma nota"); return }
    setIsSubmittingReview(true)
    try {
      await createReview({ bookingId: booking.id, rating: selectedStar, comment: reviewComment || undefined })
      toast.success("Avaliação enviada! Obrigado.")
      setIsReviewDialogOpen(false)
      setSelectedStar(0)
      setReviewComment("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar avaliação")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Card className="min-w-[90%] cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm">
          <CardContent className="flex justify-between p-0">
            <div className="flex flex-col gap-2 py-5 pl-5">
              <Badge className="w-fit" variant={isConfirmed ? "default" : "secondary"}>
                {isConfirmed ? "Confirmado" : "Finalizado"}
              </Badge>
              <h3 className="font-semibold">{booking.service.name}</h3>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={booking.service.barbershop.imageUrl} />
                </Avatar>
                <p className="text-sm text-gray-400">{booking.service.barbershop.name}</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center border-l border-solid px-5">
              <p className="text-sm capitalize">{format(booking.date, "MMMM", { locale: ptBR })}</p>
              <p className="text-3xl font-bold">{format(booking.date, "dd", { locale: ptBR })}</p>
              <p className="text-sm text-gray-400">{format(booking.date, "HH:mm", { locale: ptBR })}</p>
            </div>
          </CardContent>
        </Card>
      </SheetTrigger>

      <SheetContent className="w-[85%]">
        <SheetHeader>
          <SheetTitle className="text-left">Informações da Reserva</SheetTitle>
        </SheetHeader>

        {/* Map */}
        <div className="mt-6">
          <div className="relative h-[180px] w-full overflow-hidden rounded-xl">
            <iframe
              title={`Localização de ${barbershop.name}`}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(barbershop.address)}&output=embed&z=15`}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
            />
          </div>
          <Card className="-mt-8 relative z-10 mx-5 rounded-xl">
            <CardContent className="flex items-center gap-3 px-5 py-3">
              <Avatar>
                <AvatarImage src={barbershop.imageUrl} />
              </Avatar>
              <div>
                <h3 className="font-bold">{barbershop.name}</h3>
                <p className="text-xs text-gray-400">{barbershop.address}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Badge className="w-fit" variant={isConfirmed ? "default" : "secondary"}>
            {isConfirmed ? "Confirmado" : "Finalizado"}
          </Badge>

          <div className="mb-3 mt-6">
            <BookingSummary barbershop={barbershop} service={booking.service} selectedDate={booking.date} />
          </div>

          <div className="space-y-3">
            {barbershop.phones.map((phone) => <PhoneItem key={phone} phone={phone} />)}
          </div>
        </div>

        <SheetFooter className="mt-6">
          <div className="flex flex-col gap-2 w-full">
            {/* Review button for concluded bookings */}
            {!isConfirmed && (
              <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant={hasReview ? "secondary" : "outline"} className="w-full gap-2" disabled={hasReview}>
                    <StarIcon size={15} className={hasReview ? "fill-primary text-primary" : ""} />
                    {hasReview ? `Avaliado — ${booking.review!.rating}/5` : "Avaliar atendimento"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90%]">
                  <DialogHeader>
                    <DialogTitle>Avaliar atendimento</DialogTitle>
                    <DialogDescription>{booking.service.name} em {barbershop.name}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Stars */}
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          onClick={() => setSelectedStar(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <StarIcon
                            size={32}
                            className={cn(
                              "transition-colors",
                              star <= (hoveredStar || selectedStar)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-600",
                            )}
                          />
                        </button>
                      ))}
                    </div>
                    {selectedStar > 0 && (
                      <p className="text-center text-sm text-gray-400">
                        {["", "Muito ruim", "Ruim", "Regular", "Bom", "Excelente!"][selectedStar]}
                      </p>
                    )}
                    <textarea
                      placeholder="Deixe um comentário (opcional)"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                      className="w-full resize-none rounded-xl border border-secondary bg-secondary/30 px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <DialogFooter className="flex flex-row gap-3">
                    <DialogClose asChild>
                      <Button variant="secondary" className="w-full">Cancelar</Button>
                    </DialogClose>
                    <Button className="w-full" onClick={handleSubmitReview} disabled={isSubmittingReview || selectedStar === 0}>
                      {isSubmittingReview ? <Loader2Icon size={16} className="animate-spin" /> : "Enviar avaliação"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            <div className="flex items-center gap-3">
              <SheetClose asChild>
                <Button variant="outline" className="w-full">Voltar</Button>
              </SheetClose>
              {isConfirmed && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">Cancelar Reserva</Button>
                  </DialogTrigger>
                  <DialogContent className="w-[90%]">
                    <DialogHeader>
                      <DialogTitle>Cancelar reserva?</DialogTitle>
                      <DialogDescription>
                        Essa ação é irreversível. Sua reserva será cancelada permanentemente.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-row gap-3">
                      <DialogClose asChild>
                        <Button variant="secondary" className="w-full">Voltar</Button>
                      </DialogClose>
                      <Button variant="destructive" onClick={handleCancelBooking} className="w-full" disabled={isCanceling}>
                        {isCanceling ? <Loader2Icon size={16} className="animate-spin" /> : "Confirmar"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default BookingItem
