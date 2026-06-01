import { Button } from "./_components/ui/button"
import Link from "next/link"

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
      <h1 className="text-5xl font-bold text-primary">404</h1>
      <h2 className="text-xl font-semibold">Página não encontrada</h2>
      <p className="max-w-sm text-sm text-gray-400">
        A página que você está procurando não existe ou foi removida.
      </p>
      <Button asChild>
        <Link href="/">Voltar ao início</Link>
      </Button>
    </div>
  )
}

export default NotFound
