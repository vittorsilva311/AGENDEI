"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
import { updateProfile } from "@/app/_actions/update-profile"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar"
import { Card, CardContent } from "@/app/_components/ui/card"
import { toast } from "sonner"
import { Loader2Icon, UserIcon, ArrowLeftIcon } from "lucide-react"
import Link from "next/link"

const ProfilePage = () => {
  const { data: session, update } = useSession()
  const [name, setName] = useState(session?.user?.name ?? "")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim() || name.trim().length < 2) {
      toast.error("Nome deve ter pelo menos 2 caracteres")
      return
    }
    setSaving(true)
    try {
      await updateProfile(name.trim())
      await update({ name: name.trim() })
      toast.success("Perfil atualizado!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/"><ArrowLeftIcon size={18} /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
          <p className="text-sm text-gray-400">Gerencie suas informações pessoais</p>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-6 p-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <Avatar className="h-20 w-20">
              <AvatarImage src={session?.user?.image ?? ""} className="object-cover" />
              <AvatarFallback className="text-2xl">
                {session?.user?.name?.[0] ?? <UserIcon size={32} />}
              </AvatarFallback>
            </Avatar>
            <p className="text-xs text-gray-500">Foto sincronizada com sua conta Google</p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>

          {/* Email (readonly) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">E-mail</label>
            <Input value={session?.user?.email ?? ""} disabled className="opacity-60" />
            <p className="text-xs text-gray-500">O e-mail é gerenciado pela sua conta Google</p>
          </div>

          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2Icon size={16} className="animate-spin" /> : "Salvar alterações"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfilePage
