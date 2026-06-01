"use client"

export const dynamic = "force-dynamic"

import { useState, useTransition } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Card, CardContent } from "@/app/_components/ui/card"
import { ScissorsIcon, Loader2Icon, EyeIcon, EyeOffIcon } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

const OwnerLoginPage = () => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Preencha e-mail e senha")
      return
    }

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("E-mail ou senha incorretos")
        return
      }

      toast.success("Bem-vindo!")
      router.push("/owner/dashboard")
      router.refresh()
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <ScissorsIcon size={28} className="text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold"><span className="text-primary">AGEN</span>DEI</h1>
            <p className="text-sm text-gray-400">
              Acesso exclusivo para proprietários
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="mb-6 text-center text-lg font-semibold">
              Entrar no Painel
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">
                  E-mail
                </label>
                <Input
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">
                  Senha
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={isPending}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOffIcon size={16} />
                    ) : (
                      <EyeIcon size={16} />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2Icon size={16} className="animate-spin" />
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-gray-500">
          É cliente?{" "}
          <Link href="/" className="text-primary hover:underline">
            Voltar ao início
          </Link>
        </p>
      </div>
    </div>
  )
}

export default OwnerLoginPage
