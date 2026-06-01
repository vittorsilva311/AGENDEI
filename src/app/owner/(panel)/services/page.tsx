"use client"

import { useEffect, useState, useTransition } from "react"
import { Card, CardContent } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Badge } from "@/app/_components/ui/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/app/_components/ui/dialog"
import {
  createService, updateService, toggleServiceActive, deleteService,
} from "@/app/_actions/owner-services"
import { toast } from "sonner"
import {
  PlusIcon, Loader2Icon, ScissorsIcon, PencilIcon, Trash2Icon, EyeIcon, EyeOffIcon, ClockIcon,
} from "lucide-react"

interface Service {
  id: string
  name: string
  description: string
  imageUrl: string
  price: number
  durationMinutes: number
  active: boolean
}

const DURATION_OPTIONS = [
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1h" },
  { value: 90, label: "1h 30min" },
  { value: 120, label: "2h" },
]

const formatCurrency = (v: number) =>
  Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

const formatDuration = (min: number) => {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

const emptyForm = { name: "", description: "", price: "", imageUrl: "", duration: "30" }

const OwnerServicesPage = () => {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [form, setForm] = useState(emptyForm)

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/owner/services")
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setServices(data)
    } catch {
      toast.error("Erro ao carregar serviços")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchServices() }, [])

  const openCreate = () => {
    setEditingService(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (s: Service) => {
    setEditingService(s)
    setForm({ name: s.name, description: s.description, price: String(s.price), imageUrl: s.imageUrl, duration: String(s.durationMinutes) })
    setDialogOpen(true)
  }

  const handleSave = () => {
    const price = parseFloat(form.price.replace(",", "."))
    if (!form.name || !form.description || isNaN(price) || price <= 0) {
      toast.error("Preencha todos os campos corretamente")
      return
    }
    startTransition(async () => {
      try {
        const payload = { name: form.name, description: form.description, price, imageUrl: form.imageUrl, durationMinutes: Number(form.duration) }
        if (editingService) {
          await updateService(editingService.id, payload)
          toast.success("Serviço atualizado!")
        } else {
          await createService(payload)
          toast.success("Serviço criado!")
        }
        setDialogOpen(false)
        await fetchServices()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao salvar")
      }
    })
  }

  const handleToggle = (id: string) => {
    startTransition(async () => {
      try {
        await toggleServiceActive(id)
        await fetchServices()
      } catch (err) { toast.error(err instanceof Error ? err.message : "Erro") }
    })
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Excluir o serviço "${name}"?`)) return
    startTransition(async () => {
      try {
        await deleteService(id)
        toast.success("Serviço excluído")
        await fetchServices()
      } catch (err) { toast.error(err instanceof Error ? err.message : "Erro ao excluir") }
    })
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Serviços</h1>
          <p className="text-sm text-gray-400">Gerencie os serviços da sua barbearia</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} size="sm">
              <PlusIcon size={14} className="mr-2" />Novo serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90%] max-w-md">
            <DialogHeader>
              <DialogTitle>{editingService ? "Editar serviço" : "Novo serviço"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Nome *</label>
                <Input placeholder="Ex: Corte masculino" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Descrição *</label>
                <Input placeholder="Descreva o serviço" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Preço (R$) *</label>
                  <Input placeholder="45.00" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Duração</label>
                  <select
                    value={form.duration}
                    onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {DURATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">URL da imagem</label>
                <Input placeholder="https://..." value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} />
              </div>
              <Button className="w-full" onClick={handleSave} disabled={isPending}>
                {isPending ? <Loader2Icon size={16} className="animate-spin" /> : editingService ? "Salvar alterações" : "Criar serviço"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2Icon size={32} className="animate-spin text-primary" /></div>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <ScissorsIcon size={32} className="text-gray-500" />
            <p className="text-sm text-gray-400">Nenhum serviço cadastrado ainda.</p>
            <Button size="sm" onClick={openCreate}>Criar primeiro serviço</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <Card key={s.id} className={!s.active ? "opacity-60" : ""}>
              <CardContent className="flex items-center gap-4 p-4">
                {s.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.imageUrl} alt={s.name} className="h-12 w-12 flex-shrink-0 rounded-lg object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{s.name}</p>
                    {!s.active && <Badge variant="secondary" className="text-xs">Inativo</Badge>}
                  </div>
                  <p className="truncate text-xs text-gray-400">{s.description}</p>
                  <div className="mt-1 flex items-center gap-3">
                    <p className="text-sm font-bold text-primary">{formatCurrency(s.price)}</p>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <ClockIcon size={11} />{formatDuration(s.durationMinutes)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggle(s.id)} disabled={isPending} title={s.active ? "Desativar" : "Ativar"}>
                    {s.active ? <EyeOffIcon size={14} className="text-gray-400" /> : <EyeIcon size={14} className="text-primary" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)} disabled={isPending}>
                    <PencilIcon size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(s.id, s.name)} disabled={isPending}>
                    <Trash2Icon size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default OwnerServicesPage
