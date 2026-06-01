"use client"

export const dynamic = "force-dynamic"

import { Button } from "@/app/_components/ui/button"
import { LogInIcon, AlertCircleIcon } from "lucide-react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

const ERROR_MESSAGES: Record<string, string> = {
  Configuration:
    "Erro de configuração no servidor. Verifique os logs do terminal.",
  AccessDenied: "Acesso negado. Sua conta não tem permissão.",
  Verification: "O link de verificação expirou ou já foi usado.",
  OAuthSignin: "Erro ao iniciar login com Google.",
  OAuthCallback: "Erro no retorno do Google. Tente novamente.",
  OAuthCreateAccount: "Não foi possível criar sua conta.",
  EmailCreateAccount: "Não foi possível criar sua conta.",
  Callback: "Erro no callback de autenticação.",
  OAuthAccountNotLinked:
    "Este e-mail já está cadastrado com outro método de login.",
  Default: "Ocorreu um erro inesperado.",
}

function ErrorContent() {
  const params = useSearchParams()
  const error = params.get("error") ?? "Default"
  const message = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-5 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircleIcon size={32} className="text-destructive" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">Erro ao fazer login</h1>
        <p className="mt-2 max-w-sm text-sm text-gray-400">{message}</p>
        <p className="mt-1 text-xs text-gray-600">Código: {error}</p>
      </div>
      <div className="flex flex-col gap-3">
        <Button onClick={() => signIn("google")} className="gap-2">
          <LogInIcon size={16} />
          Tentar novamente com Google
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Voltar ao início</Link>
        </Button>
      </div>
    </div>
  )
}

const AuthErrorPage = () => {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  )
}

export default AuthErrorPage
