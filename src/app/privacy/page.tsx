import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/app/_components/ui/button"
import { ArrowLeftIcon } from "lucide-react"

export const metadata: Metadata = {
  title: "Política de Privacidade — Agendei",
  description: "Saiba como o Agendei coleta, usa e protege seus dados pessoais.",
}

const PrivacyPage = () => {
  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <div className="mb-8 flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/"><ArrowLeftIcon size={18} /></Link>
        </Button>
        <h1 className="text-2xl font-bold">Política de Privacidade</h1>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-gray-300">
        <p className="text-xs text-gray-500">Última atualização: maio de 2025</p>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">1. Informações que coletamos</h2>
          <p>Coletamos as seguintes informações ao usar o Agendei:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li><strong className="text-white">Dados de conta:</strong> nome, endereço de e-mail e foto de perfil fornecidos pelo Google ao fazer login</li>
            <li><strong className="text-white">Dados de agendamento:</strong> serviços agendados, datas, horários e estabelecimentos escolhidos</li>
            <li><strong className="text-white">Avaliações:</strong> notas e comentários que você publica sobre os serviços</li>
            <li><strong className="text-white">Dados de uso:</strong> interações com a plataforma para melhorar a experiência</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">2. Como usamos seus dados</h2>
          <p>Utilizamos suas informações para:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Gerenciar sua conta e autenticação</li>
            <li>Processar e confirmar seus agendamentos</li>
            <li>Enviar notificações de confirmação e lembretes por e-mail</li>
            <li>Exibir avaliações e melhorar a qualidade da plataforma</li>
            <li>Cumprir obrigações legais</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">3. Compartilhamento de dados</h2>
          <p>
            Compartilhamos seus dados apenas com os estabelecimentos que você agendou
            serviços, exclusivamente para fins de confirmação e atendimento. Não vendemos
            seus dados pessoais a terceiros.
          </p>
          <p>
            Podemos compartilhar informações com prestadores de serviços técnicos (como
            hospedagem e e-mail transacional) estritamente para operação da plataforma,
            sob acordos de confidencialidade.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">4. Armazenamento e segurança</h2>
          <p>
            Seus dados são armazenados em servidores seguros com criptografia em trânsito
            (HTTPS). Adotamos medidas técnicas e organizacionais para proteger suas
            informações contra acesso não autorizado.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">5. Seus direitos (LGPD)</h2>
          <p>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Acessar os dados que temos sobre você</li>
            <li>Corrigir dados incorretos ou desatualizados</li>
            <li>Solicitar a exclusão dos seus dados</li>
            <li>Revogar o consentimento para uso dos seus dados</li>
            <li>Portabilidade dos seus dados</li>
          </ul>
          <p>Para exercer esses direitos, entre em contato: <span className="text-primary">privacidade@agendei.app</span></p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">6. Cookies</h2>
          <p>
            Utilizamos cookies de sessão essenciais para manter você autenticado.
            Não utilizamos cookies de rastreamento ou publicidade de terceiros.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">7. Retenção de dados</h2>
          <p>
            Mantemos seus dados enquanto sua conta estiver ativa. Ao solicitar a exclusão
            da conta, removeremos seus dados pessoais em até 30 dias, exceto onde houver
            obrigação legal de retenção.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">8. Alterações nesta política</h2>
          <p>
            Podemos atualizar esta política periodicamente. Notificaremos por e-mail ou
            aviso na plataforma sobre mudanças relevantes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-white">9. Contato</h2>
          <p>
            Encarregado de Proteção de Dados (DPO):{" "}
            <span className="text-primary">privacidade@agendei.app</span>
          </p>
        </section>
      </div>

      <div className="mt-8 border-t border-secondary pt-6 text-center">
        <Link href="/terms" className="text-xs text-gray-500 underline underline-offset-2 hover:text-gray-300">
          Ver Termos de Uso
        </Link>
      </div>
    </div>
  )
}

export default PrivacyPage
