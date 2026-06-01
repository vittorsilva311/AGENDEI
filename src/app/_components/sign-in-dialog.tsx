"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "./ui/button"
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Loader2Icon } from "lucide-react"
import Image from "next/image"

const SignInDialog = () => {
  const [isLoading, setIsLoading] = useState(false)

  const handleLoginWithGoogleClick = () => {
    if (isLoading) return
    setIsLoading(true)
    signIn("google")
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Faça login na plataforma</DialogTitle>
        <DialogDescription>
          Conecte-se usando sua conta do Google.
        </DialogDescription>
      </DialogHeader>

      <Button
        variant="outline"
        className="gap-2 font-bold"
        onClick={handleLoginWithGoogleClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2Icon size={18} className="animate-spin" />
        ) : (
          <Image
            alt="Fazer login com o Google"
            src="/google.svg"
            width={18}
            height={18}
          />
        )}
        {isLoading ? "Redirecionando..." : "Google"}
      </Button>
    </>
  )
}

export default SignInDialog
