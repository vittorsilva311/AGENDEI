"use client"

import { useEffect, useState, useTransition } from "react"
import { Card, CardContent } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Badge } from "@/app/_components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar"
import { removeBarbershopOwner } from "@/app/_actions/assign-owner"
import { createInvitation } from "@/app/_actions/create-invitation"
import {
  createBarbershop,
  deleteBarbershop,
  updateBarbershopAsAdmin,
} from "@/app/_actions/admin-barbershops"
import { toast } from "sonner"
import {
  TrendingUpIcon,
  UsersIcon,
  Loader2Icon,
  MailIcon,
  UserXIcon,
  CopyIcon,
  CheckIcon,
  PlusIcon,
  Trash2Icon,
  PencilIcon,
  StoreIcon,
  CalendarCheckIcon,
  MapPinIcon,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog"

interface AdminStats {
  totalRevenue: number
  totalBarbershops: number
  totalCustomers: number
  barbershops: {
    id: string
    name: string
    address: string
    imageUrl: string
    owner: { name: string | null; email: string | null; image: string | null } | null
    monthRevenue: number
    monthBookings: number
    totalBookings: number
  }[]
}

const formatCurrency = (v: number) =>
  Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

const emptyBarbershopForm = {
  name: "",
  address: "",
  description: "",
  imageUrl: "",
  phone1: "",
  phone2: "",
}

const AdminPage = () => {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isGeocoding, setIsGeocoding] = useState(false)

  // Invite dialog
  const [openInviteDialog, setOpenInviteDialog] = useState<string | null>(null)
  const [inviteForm, setInviteForm] = useState({ name: "", email: "" })
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [selectedBarbershop, setSelectedBarbershop] = useState<{ id: string; name: string } | null>(null)

  // Barbershop dialog (create / edit)
  const [barbershopDialogOpen, setBarbershopDialogOpen] = useState(false)
  const [editingBarbershop, setEditingBarbershop] = useState<AdminStats["barbershops"][0] | null>(null)
  const [bForm, setBForm] = useState(emptyBarbershopForm)

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats")
      const data = await res.json()
      if (!res.ok) {
        setFetchError(data?.error ?? "Erro ao carregar dados")
        return
      }
      setStats(data)
      setFetchError(null)
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStats() }, [])

  /* ── Invite ── */
  const handleSendInvite = () => {
    if (!selectedBarbershop || !inviteForm.name || !inviteForm.email) {
      toast.error("Preencha nome e e-mail")
      return
    }
    startTransition(async () => {
      try {
        const result = await createInvitation({
          ownerName: inviteForm.name,
          email: inviteForm.email,
          barbershopId: selectedBarbershop.id,
        })
        setGeneratedLink(result.link)
        toast.success("Convite criado!")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao criar convite")
      }
    })
  }

  const handleCopyLink = () => {
    if (!generatedLink) return
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("Link copiado!")
  }

  const resetInviteDialog = () => {
    setInviteForm({ name: "", email: "" })
    setGeneratedLink(null)
    setCopied(false)
    setOpenInviteDialog(null)
    setSelectedBarbershop(null)
  }

  const handleRemoveOwner = (barbershopId: string, name: string) => {
    startTransition(async () => {
      try {
        await removeBarbershopOwner(barbershopId)
        toast.success(`Proprietário removido de ${name}`)
        await fetchStats()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao remover")
      }
    })
  }

  /* ── Barbershop CRUD ── */
  const openCreate = () => {
    setEditingBarbershop(null)
    setBForm(emptyBarbershopForm)
    setBarbershopDialogOpen(true)
  }

  const openEdit = (b: AdminStats["barbershops"][0]) => {
    setEditingBarbershop(b)
    setBForm({
      name: b.name,
      address: b.address,
      description: "",
      imageUrl: b.imageUrl,
      phone1: "",
      phone2: "",
    })
    setBarbershopDialogOpen(true)
  }

  const handleSaveBarbershop = () => {
    if (!bForm.name || !bForm.address) {
      toast.error("Nome e endereço são obrigatórios")
      return
    }
    const phones = [bForm.phone1, bForm.phone2].filter(Boolean)
    startTransition(async () => {
      try {
        if (editingBarbershop) {
          await updateBarbershopAsAdmin(editingBarbershop.id, {
            name: bForm.name,
            address: bForm.address,
            description: bForm.description || editingBarbershop.name,
            imageUrl: bForm.imageUrl,
            phones,
          })
          toast.success("Salão atualizado!")
        } else {
          await createBarbershop({
            name: bForm.name,
            address: bForm.address,
            description: bForm.description || bForm.name,
            imageUrl: bForm.imageUrl,
            phones,
          })
          toast.success("Salão criado com sucesso!")
        }
        setBarbershopDialogOpen(false)
        await fetchStats()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao salvar")
      }
    })
  }

  const handleGeocode = async () => {
    setIsGeocoding(true)
    try {
      const res = await fetch("/api/admin/geocode-barbershops", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? "Erro")
      toast.success(`Geocodificação concluída: ${data.updated} atualizados, ${data.failed} falhas`)
      await fetchStats()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao geocodificar")
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleDeleteBarbershop = (id: string, name: string) => {
    if (!confirm(`Excluir o salão "${name}"? Esta ação não pode ser desfeita.`)) return
    startTransition(async () => {
      try {
        await deleteBarbershop(id)
        toast.success(`Salão "${name}" excluído`)
        await fetchStats()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao excluir")
      }
    })
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Painel do Administrador</h1>
          <p className="text-sm text-gray-400">
            Gerencie todos os salões e acompanhe o desempenho da plataforma
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleGeocode}
            disabled={isGeocoding}
            title="Geocodificar endereços de salões sem coordenadas"
          >
            {isGeocoding ? (
              <Loader2Icon size={14} className="animate-spin" />
            ) : (
              <MapPinIcon size={14} />
            )}
            <span className="ml-2 hidden sm:inline">Geocodificar</span>
          </Button>

        {/* Botão criar salão */}
        <Dialog open={barbershopDialogOpen} onOpenChange={setBarbershopDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <PlusIcon size={14} className="mr-2" />
              Novo Salão
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90%] max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingBarbershop ? "Editar Salão" : "Cadastrar Novo Salão"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="text-sm font-medium">Nome do salão *</label>
                <Input
                  placeholder="Ex: Barbearia do João"
                  value={bForm.name}
                  onChange={(e) => setBForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Endereço *</label>
                <Input
                  placeholder="Rua, número — Cidade/UF"
                  value={bForm.address}
                  onChange={(e) => setBForm((f) => ({ ...f, address: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Descrição</label>
                <Input
                  placeholder="Breve descrição do salão"
                  value={bForm.description}
                  onChange={(e) => setBForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">URL da imagem</label>
                <Input
                  placeholder="https://..."
                  value={bForm.imageUrl}
                  onChange={(e) => setBForm((f) => ({ ...f, imageUrl: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Telefone 1</label>
                  <Input
                    placeholder="(00) 00000-0000"
                    value={bForm.phone1}
                    onChange={(e) => setBForm((f) => ({ ...f, phone1: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Telefone 2</label>
                  <Input
                    placeholder="(00) 00000-0000"
                    value={bForm.phone2}
                    onChange={(e) => setBForm((f) => ({ ...f, phone2: e.target.value }))}
                  />
                </div>
              </div>
              <Button className="w-full" onClick={handleSaveBarbershop} disabled={isPending}>
                {isPending ? (
                  <Loader2Icon size={16} className="animate-spin" />
                ) : editingBarbershop ? (
                  "Salvar alterações"
                ) : (
                  "Cadastrar salão"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2Icon size={32} className="animate-spin text-primary" />
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <p className="text-sm text-destructive">{fetchError}</p>
          <Button variant="outline" size="sm" onClick={fetchStats}>
            Tentar novamente
          </Button>
        </div>
      ) : stats ? (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUpIcon size={16} className="text-primary" />
                  </div>
                  <span className="text-xs text-gray-400">Receita Total</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                <p className="mt-1 text-xs text-gray-500">em toda a plataforma</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <StoreIcon size={16} className="text-primary" />
                  </div>
                  <span className="text-xs text-gray-400">Salões Ativos</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalBarbershops}</p>
                <p className="mt-1 text-xs text-gray-500">cadastrados na plataforma</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <UsersIcon size={16} className="text-primary" />
                  </div>
                  <span className="text-xs text-gray-400">Clientes</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                <p className="mt-1 text-xs text-gray-500">usuários cadastrados</p>
              </CardContent>
            </Card>
          </div>

          {/* Salões */}
          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheckIcon size={16} className="text-primary" />
                <h2 className="font-bold">Salões cadastrados</h2>
                <Badge variant="secondary" className="text-xs">
                  {stats.barbershops.length}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              {stats.barbershops.map((b) => (
                <Card key={b.id}>
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                      {/* Info */}
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-secondary">
                          {b.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={b.imageUrl} alt={b.name} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold">{b.name}</p>
                          <p className="text-xs text-gray-400">{b.address}</p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex gap-6 text-center">
                        <div>
                          <p className="text-lg font-bold text-primary">{formatCurrency(b.monthRevenue)}</p>
                          <p className="text-xs text-gray-400">este mês</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold">{b.monthBookings}</p>
                          <p className="text-xs text-gray-400">agend. mês</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold">{b.totalBookings}</p>
                          <p className="text-xs text-gray-400">total</p>
                        </div>
                      </div>

                      {/* Owner + actions */}
                      <div className="flex items-center gap-2">
                        {b.owner ? (
                          <>
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={b.owner.image ?? ""} />
                              <AvatarFallback>{b.owner.name?.[0] ?? "?"}</AvatarFallback>
                            </Avatar>
                            <div className="mr-2">
                              <p className="text-xs font-medium">{b.owner.name}</p>
                              <p className="text-xs text-gray-400">{b.owner.email}</p>
                            </div>
                            <Button
                              variant="ghost" size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleRemoveOwner(b.id, b.name)}
                              disabled={isPending}
                              title="Remover proprietário"
                            >
                              <UserXIcon size={14} />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Badge variant="secondary" className="text-xs">Sem proprietário</Badge>

                            {/* Invite */}
                            <Dialog
                              open={openInviteDialog === b.id}
                              onOpenChange={(open) => {
                                if (open) {
                                  setSelectedBarbershop({ id: b.id, name: b.name })
                                  setOpenInviteDialog(b.id)
                                } else {
                                  resetInviteDialog()
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button size="sm" variant="default">
                                  <MailIcon size={13} className="mr-1" />
                                  Criar acesso do dono
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="w-[90%] max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Criar acesso do proprietário</DialogTitle>
                                </DialogHeader>
                                <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                                  <p className="text-xs text-gray-400">Salão</p>
                                  <p className="font-semibold">{b.name}</p>
                                </div>

                                {!generatedLink ? (
                                  <div className="space-y-3 pt-1">
                                    <div className="space-y-1">
                                      <label className="text-sm font-medium">Nome do proprietário</label>
                                      <Input
                                        placeholder="Ex: João Silva"
                                        value={inviteForm.name}
                                        onChange={(e) => setInviteForm((f) => ({ ...f, name: e.target.value }))}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-sm font-medium">E-mail do proprietário</label>
                                      <Input
                                        type="email"
                                        placeholder="email@exemplo.com"
                                        value={inviteForm.email}
                                        onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                                      />
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      Será gerado um link único. O dono clica, cria uma senha e já acessa o painel do <strong className="text-foreground">{b.name}</strong> automaticamente.
                                    </p>
                                    <Button className="w-full" onClick={handleSendInvite} disabled={isPending}>
                                      {isPending ? <Loader2Icon size={16} className="animate-spin" /> : "Gerar link de acesso"}
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="space-y-4 pt-1">
                                    <p className="text-sm text-gray-400">
                                      Envie este link para <strong className="text-foreground">{inviteForm.name}</strong>. Ao clicar, ele cria a senha e já fica vinculado ao salão.
                                    </p>
                                    <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
                                      <p className="flex-1 break-all text-xs text-gray-300">{generatedLink}</p>
                                      <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0" onClick={handleCopyLink}>
                                        {copied ? <CheckIcon size={16} className="text-green-400" /> : <CopyIcon size={16} />}
                                      </Button>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      Válido por <strong>2 meses</strong> · Uso único
                                    </p>
                                    <div className="flex gap-2">
                                      <Button variant="outline" className="w-full" onClick={resetInviteDialog}>Fechar</Button>
                                      <Button className="w-full" onClick={handleCopyLink}>
                                        {copied ? "Copiado!" : "Copiar link"}
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </>
                        )}

                        {/* Edit / Delete */}
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8"
                          onClick={() => openEdit(b)}
                          disabled={isPending}
                          title="Editar salão"
                        >
                          <PencilIcon size={14} />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteBarbershop(b.id, b.name)}
                          disabled={isPending}
                          title="Excluir salão"
                        >
                          <Trash2Icon size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {stats.barbershops.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                    <StoreIcon size={32} className="text-gray-500" />
                    <p className="text-sm text-gray-400">Nenhum salão cadastrado ainda.</p>
                    <Button size="sm" onClick={openCreate}>
                      <PlusIcon size={14} className="mr-2" />
                      Cadastrar primeiro salão
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

export default AdminPage
