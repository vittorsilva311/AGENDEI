"use client"

import { useEffect, useState, useTransition } from "react"
import { useParams, useRouter } from "next/navigation"
import { getInvitation, acceptInvitation } from "@/app/_actions/accept-invitation"
import { Card, CardContent } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import {
  ScissorsIcon,
  Loader2Icon,
  CheckCircle2Icon,
  EyeIcon,
  EyeOffIcon,
  XCircleIcon,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface InviteData {
  email: string
  ownerName: string
  barbershopName: string
  barbershopAddress: string
}

export default function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [state, setState] = useState<
    "loading" | "valid" | "invalid" | "success"
  >("loading")
  const [error, setError] = useState("")
  const [invite, setInvite] = useState<InviteData | null>(null)
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPwd, setShowPwd] = useState(false)

  useEffect(() => {
    getInvitation(token).then((res) => {
      if ("error" in res) {
        setError(res.error ?? "Convite inválido")
        setState("invalid")
      } else {
        setInvite({
          email: res.invitation.email,
          ownerName: res.invitation.ownerName,
          barbershopName: res.invitation.barbershop.name,
          barbershopAddress: res.invitation.barbershop.address,
        })
        setState("valid")
      }
    })
  }, [token])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      toast.error("As senhas não coincidem")
      return
    }
    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres")
      return
    }

    startTransition(async () => {
      try {
        await acceptInvitation({ token, password })
        setState("success")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao aceitar convite")
      }
    })
  }

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2Icon size={32} className="animate-spin text-primary" />
      </div>
    )
  }

  if (state === "invalid") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <XCircleIcon size={32} className="text-destructive" />
        </div>
        <h1 className="text-xl font-bold">Convite inválido</h1>
        <p className="max-w-sm text-sm text-gray-400">{error}</p>
        <Button asChild variant="outline">
          <Link href="/">Voltar ao início</Link>
        </Button>
      </div>
    )
  }

  if (state === "success") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2Icon size={32} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Conta criada com sucesso!</h1>
          <p className="mt-1 text-sm text-gray-400">
            Agora você pode acessar o painel da sua barbearia.
          </p>
        </div>
        <Button onClick={() => router.push("/owner/login?callbackUrl=/owner/dashboard")}>
          Fazer login e acessar painel
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <ScissorsIcon size={28} className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Agendei</h1>
          <p className="text-sm text-gray-400">
            Você foi convidado para gerenciar uma barbearia
          </p>
        </div>

        {/* Barbershop info */}
        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
          <p className="text-xs font-medium uppercase text-primary">
            Barbearia
          </p>
          <p className="mt-1 text-lg font-bold">{invite?.barbershopName}</p>
          <p className="text-xs text-gray-400">{invite?.barbershopAddress}</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="mb-1 text-lg font-semibold">Criar sua conta</h2>
            <p className="mb-5 text-sm text-gray-400">
              Olá, <strong className="text-foreground">{invite?.ownerName}</strong>!
              Configure sua senha para acessar o painel.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">
                  E-mail
                </label>
                <Input value={invite?.email ?? ""} disabled />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">
                  Senha
                </label>
                <div className="relative">
                  <Input
                    type={showPwd ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPwd((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPwd ? (
                      <EyeOffIcon size={16} />
                    ) : (
                      <EyeIcon size={16} />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">
                  Confirmar senha
                </label>
                <Input
                  type="password"
                  placeholder="Repita a senha"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2Icon size={16} className="animate-spin" />
                ) : (
                  "Criar conta e acessar"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-gray-500">
          Este convite expira em 2 meses a partir do envio.
        </p>
      </div>
    </div>
  )
}
