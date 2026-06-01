import Link from "next/link"
import { Card, CardContent } from "./ui/card"

const Footer = () => {
  return (
    <footer>
      <Card className="rounded-none border-x-0 border-b-0">
        <CardContent className="mx-auto max-w-5xl px-5 py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-400">
              © 2026{" "}
              <span className="font-bold text-white">Agendei</span>
              <span className="ml-1 text-gray-500">· Todos os direitos reservados</span>
            </p>
            <div className="flex gap-4">
              <Link href="/terms" className="text-xs text-gray-500 hover:text-gray-300 underline underline-offset-2">
                Termos de Uso
              </Link>
              <Link href="/privacy" className="text-xs text-gray-500 hover:text-gray-300 underline underline-offset-2">
                Privacidade
              </Link>
              <Link href="/owner/login" className="text-xs text-gray-500 hover:text-gray-300 underline underline-offset-2">
                Acesso do Proprietário
              </Link>
              <Link href="/admin" className="text-xs text-gray-500 hover:text-gray-300 underline underline-offset-2">
                Acesso do Admin
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </footer>
  )
}

export default Footer
