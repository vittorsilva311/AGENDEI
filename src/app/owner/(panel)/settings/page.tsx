"use client"

import { useEffect, useState, useTransition } from "react"
import { Card, CardContent } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { updateBarbershopSettings } from "@/app/_actions/owner-settings"
import { toast } from "sonner"
import { Loader2Icon, PlusIcon, Trash2Icon, ClockIcon } from "lucide-react"

interface BarbershopData {
  name: string
  address: string
  description: string
  imageUrl: string
  phones: string[]
  openTime: string
  closeTime: string
  workingDays: number[]
}

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

const OwnerSettingsPage = () => {
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState<BarbershopData>({
    name: "",
    address: "",
    description: "",
    imageUrl: "",
    phones: [""],
    openTime: "08:00",
    closeTime: "19:00",
    workingDays: [1, 2, 3, 4, 5, 6],
  })

  useEffect(() => {
    fetch("/api/owner/barbershop")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { toast.error(data.error); return }
        setForm({
          name: data.name ?? "",
          address: data.address ?? "",
          description: data.description ?? "",
          imageUrl: data.imageUrl ?? "",
          phones: data.phones?.length ? data.phones : [""],
          openTime: data.openTime ?? "08:00",
          closeTime: data.closeTime ?? "19:00",
          workingDays: data.workingDays ?? [1, 2, 3, 4, 5, 6],
        })
      })
      .catch(() => toast.error("Erro ao carregar dados"))
      .finally(() => setLoading(false))
  }, [])

  const toggleDay = (day: number) => {
    setForm((f) => ({
      ...f,
      workingDays: f.workingDays.includes(day)
        ? f.workingDays.filter((d) => d !== day)
        : [...f.workingDays, day].sort(),
    }))
  }

  const setPhone = (index: number, value: string) => {
    setForm((f) => {
      const phones = [...f.phones]
      phones[index] = value
      return { ...f, phones }
    })
  }

  const handleSave = () => {
    if (!form.name || !form.address || !form.description) {
      toast.error("Preencha os campos obrigatórios")
      return
    }
    if (form.workingDays.length === 0) {
      toast.error("Selecione ao menos um dia de funcionamento")
      return
    }
    startTransition(async () => {
      try {
        await updateBarbershopSettings(form)
        toast.success("Dados atualizados com sucesso!")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao salvar")
      }
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2Icon size={32} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-sm text-gray-400">Edite as informações da sua barbearia</p>
      </div>

      <div className="space-y-4">
        {/* Dados básicos */}
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Dados da Barbearia</h2>

            <div className="space-y-1">
              <label className="text-sm font-medium">Nome <span className="text-destructive">*</span></label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex: Barbearia do João" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Endereço <span className="text-destructive">*</span></label>
              <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Rua, número, bairro — Cidade/UF" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Descrição <span className="text-destructive">*</span></label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Conte um pouco sobre a barbearia" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">URL da imagem de capa</label>
              <Input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
              {form.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.imageUrl} alt="preview" className="mt-2 h-28 w-full rounded-xl object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Telefones de contato</label>
                {form.phones.length < 3 && (
                  <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 text-xs"
                    onClick={() => setForm((f) => ({ ...f, phones: [...f.phones, ""] }))}>
                    <PlusIcon size={12} />Adicionar
                  </Button>
                )}
              </div>
              {form.phones.map((phone, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={phone} onChange={(e) => setPhone(i, e.target.value)} placeholder="(00) 00000-0000" className="flex-1" />
                  {form.phones.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-destructive hover:text-destructive"
                      onClick={() => setForm((f) => ({ ...f, phones: f.phones.filter((_, idx) => idx !== i) }))}>
                      <Trash2Icon size={14} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Horários de funcionamento */}
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2">
              <ClockIcon size={15} className="text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Horário de Funcionamento</h2>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Dias de atendimento</label>
              <div className="flex gap-1.5 flex-wrap">
                {DAY_LABELS.map((label, day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      form.workingDays.includes(day)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-gray-400 hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Abertura</label>
                <Input
                  type="time"
                  value={form.openTime}
                  onChange={(e) => setForm((f) => ({ ...f, openTime: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Fechamento</label>
                <Input
                  type="time"
                  value={form.closeTime}
                  onChange={(e) => setForm((f) => ({ ...f, closeTime: e.target.value }))}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Os horários disponíveis para agendamento serão gerados automaticamente dentro deste intervalo.
            </p>
          </CardContent>
        </Card>

        <Button className="w-full" onClick={handleSave} disabled={isPending}>
          {isPending ? <Loader2Icon size={16} className="animate-spin" /> : "Salvar alterações"}
        </Button>
      </div>
    </div>
  )
}

export default OwnerSettingsPage
