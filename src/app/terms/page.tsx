import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/app/_components/ui/button"
import { ArrowLeftIcon } from "lucide-react"

export const metadata: Metadata = {
  title: "Termos de Uso — Agendei",
  description: "Termos e condições de uso da plataforma Agendei.",
}

const TermsPage = () => {
  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <div className="mb-8 flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/"><ArrowLeftIcon size={18} /></Link>
        </Button>
        <h1 className="text-2xl font-bold">Termos de Uso</h1>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-gray-300">
        <p className="text-xs text-gray-500">Última atualização: maio de 2025</p>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">1. Aceitação dos termos</h2>
          <p>
            Ao acessar ou usar a plataforma Agendei, você concorda com estes Termos de Uso.
            Se não concordar, por favor, não utilize o serviço.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">2. Descrição do serviço</h2>
          <p>
            O Agendei é uma plataforma digital que conecta clientes a salões de beleza e
            barbearias, permitindo o agendamento de serviços de forma fácil e conveniente.
            Não somos prestadores dos serviços oferecidos pelos estabelecimentos cadastrados.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">3. Cadastro e conta</h2>
          <p>
            Para utilizar todas as funcionalidades, é necessário criar uma conta. Você é
            responsável por manter a confidencialidade de suas credenciais e por todas as
            atividades realizadas em sua conta.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">4. Agendamentos</h2>
          <p>
            Os agendamentos são feitos diretamente com os estabelecimentos parceiros. O Agendei
            atua apenas como intermediário. Cancelamentos, reagendamentos e políticas de
            reembolso são definidos por cada estabelecimento.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">5. Conduta do usuário</h2>
          <p>É proibido utilizar a plataforma para:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Realizar agendamentos falsos ou fraudulentos</li>
            <li>Assediar, ameaçar ou prejudicar outros usuários</li>
            <li>Violar leis ou regulamentos aplicáveis</li>
            <li>Tentar acessar sistemas sem autorização</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">6. Avaliações</h2>
          <p>
            Os usuários podem deixar avaliações sobre os serviços recebidos. As avaliações
            devem ser honestas e baseadas em experiências reais. Avaliações falsas ou
            ofensivas poderão ser removidas.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">7. Limitação de responsabilidade</h2>
          <p>
            O Agendei não se responsabiliza pela qualidade dos serviços prestados pelos
            estabelecimentos parceiros, por cancelamentos feitos pelos estabelecimentos, ou
            por danos indiretos decorrentes do uso da plataforma.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">8. Alterações nos termos</h2>
          <p>
            Podemos atualizar estes termos a qualquer momento. Notificaremos os usuários sobre
            mudanças significativas. O uso continuado da plataforma após as alterações implica
            aceitação dos novos termos.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">9. Contato</h2>
          <p>
            Dúvidas sobre estes termos? Entre em contato conosco pelo e-mail:{" "}
            <span className="text-primary">contato@agendei.app</span>
          </p>
        </section>
      </div>

      <div className="mt-8 border-t border-secondary pt-6 text-center">
        <Link href="/privacy" className="text-xs text-gray-500 underline underline-offset-2 hover:text-gray-300">
          Ver Política de Privacidade
        </Link>
      </div>
    </div>
  )
}

export default TermsPage
