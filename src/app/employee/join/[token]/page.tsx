"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession, signIn } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar"
import { Button } from "@/app/_components/ui/button"
import { Card, CardContent } from "@/app/_components/ui/card"
import { acceptEmployeeInvitation } from "@/app/_actions/accept-employee-invitation"
import { toast } from "sonner"
import { Loader2Icon, ScissorsIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react"

interface InviteData {
  alreadyLinked: boolean
  employee: {
    name: string
    specialty: string | null
    imageUrl: string | null
    barbershopName: string
  }
}

const EmployeeJoinPage = () => {
  const params = useParams<{ token: string }>()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [invite, setInvite] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/employee/invite/${params.token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setInvite(data)
      })
      .catch(() => setError("Erro ao carregar convite"))
      .finally(() => setLoading(false))
  }, [params.token])

  const handleAccept = async () => {
    setAccepting(true)
    try {
      await acceptEmployeeInvitation(params.token)
      setDone(true)
      toast.success("Conta vinculada com sucesso!")
      setTimeout(() => router.push("/employee/schedule"), 1500)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao aceitar convite")
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2Icon size={32} className="animate-spin text-primary" />
      </div>
    )
  }

  if (error || !invite) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
        <XCircleIcon size={48} className="text-destructive" />
        <h1 className="text-xl font-bold">Convite inválido</h1>
        <p className="text-sm text-gray-400">{error ?? "Este link não é válido."}</p>
        <Button onClick={() => router.push("/")} variant="outline">Ir para início</Button>
      </div>
    )
  }

  if (invite.alreadyLinked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
        <CheckCircle2Icon size={48} className="text-primary" />
        <h1 className="text-xl font-bold">Conta já vinculada</h1>
        <p className="text-sm text-gray-400">
          Este funcionário já tem uma conta. Faça login para acessar sua agenda.
        </p>
        <Button onClick={() => router.push("/employee/schedule")}>Acessar minha agenda</Button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
        <CheckCircle2Icon size={56} className="text-primary" />
        <h1 className="text-xl font-bold">Tudo certo!</h1>
        <p className="text-sm text-gray-400">Redirecionando para sua agenda...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-1">
          <div className="flex select-none items-center text-3xl font-black tracking-wider">
            <span className="text-[#8B5CF6]">AGEN</span>
            <span className="text-gray-100">DEI</span>
          </div>
          <p className="text-xs text-gray-400">Gestão de agendamentos</p>
        </div>

        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <Avatar className="h-20 w-20 border-2 border-primary/30">
                <AvatarImage src={invite.employee.imageUrl ?? ""} className="object-cover" />
                <AvatarFallback className="text-2xl font-bold">{invite.employee.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-bold">{invite.employee.name}</p>
                {invite.employee.specialty && (
                  <p className="text-sm text-gray-400">{invite.employee.specialty}</p>
                )}
                <div className="mt-1 flex items-center justify-center gap-1">
                  <ScissorsIcon size={12} className="text-primary" />
                  <p className="text-sm font-medium text-primary">{invite.employee.barbershopName}</p>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-gray-400">
              Você foi convidado para acessar sua agenda profissional no Agendei.
            </p>

            {status === "loading" ? (
              <div className="flex justify-center py-4">
                <Loader2Icon size={24} className="animate-spin text-primary" />
              </div>
            ) : session?.user ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
                  <p className="text-center text-xs text-gray-400">Logado como</p>
                  <p className="text-center text-sm font-semibold">{session.user.name}</p>
                  <p className="text-center text-xs text-gray-500">{session.user.email}</p>
                </div>
                <Button className="w-full" onClick={handleAccept} disabled={accepting}>
                  {accepting ? (
                    <Loader2Icon size={16} className="animate-spin" />
                  ) : (
                    "Aceitar convite e acessar minha agenda"
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-center text-xs text-gray-500">
                  Entre com sua conta para aceitar o convite
                </p>
                <Button
                  className="w-full"
                  onClick={() => signIn("google", { callbackUrl: `/employee/join/${params.token}` })}
                >
                  Entrar com Google
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default EmployeeJoinPage
