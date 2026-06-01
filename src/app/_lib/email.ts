import { Resend } from "resend"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const paymentLabel = (m: string | null | undefined) => {
  if (m === "CARD") return "Cartão"
  if (m === "PIX") return "PIX"
  if (m === "CASH") return "Dinheiro"
  return "A definir"
}

const getResend = () => {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

interface BookingEmailParams {
  to: string
  clientName: string
  serviceName: string
  barbershopName: string
  barbershopAddress: string
  date: Date
  employeeName?: string | null
  paymentMethod?: string | null
  price: number
}

const brandHeader = `
  <div style="text-align:center;margin-bottom:24px">
    <span style="font-size:28px;font-weight:900;letter-spacing:2px">
      <span style="color:#8B5CF6">AGEN</span><span style="color:#f4f4f5">DEI</span>
    </span>
  </div>`

const baseWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:system-ui,sans-serif;color:#f4f4f5">
  <div style="max-width:520px;margin:32px auto;padding:24px">
    ${brandHeader}
    ${content}
    <p style="text-align:center;color:#3f3f46;font-size:11px;margin-top:16px">
      Agendei — Gestão de agendamentos para barbearias
    </p>
  </div>
</body>
</html>`

export const sendBookingConfirmation = async (params: BookingEmailParams) => {
  const resend = getResend()
  if (!resend) return

  const dateStr = format(params.date, "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })
  const priceStr = Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(params.price)

  const html = baseWrapper(`
    <div style="background:#18181b;border-radius:16px;padding:28px;border:1px solid #27272a">
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:40px;margin-bottom:8px">✅</div>
        <h1 style="margin:0;font-size:20px;font-weight:700">Agendamento Confirmado!</h1>
        <p style="margin:6px 0 0;color:#71717a;font-size:14px">Olá, ${params.clientName}! Seu horário está garantido.</p>
      </div>
      <div style="background:#09090b;border-radius:12px;padding:16px;margin:20px 0;border:1px solid #27272a">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 0;color:#71717a;font-size:13px">Serviço</td><td style="padding:6px 0;text-align:right;font-weight:600;font-size:13px">${params.serviceName}</td></tr>
          <tr><td style="padding:6px 0;color:#71717a;font-size:13px">Data e hora</td><td style="padding:6px 0;text-align:right;font-weight:600;font-size:13px;text-transform:capitalize">${dateStr}</td></tr>
          ${params.employeeName ? `<tr><td style="padding:6px 0;color:#71717a;font-size:13px">Profissional</td><td style="padding:6px 0;text-align:right;font-weight:600;font-size:13px">${params.employeeName}</td></tr>` : ""}
          <tr><td style="padding:6px 0;color:#71717a;font-size:13px">Valor</td><td style="padding:6px 0;text-align:right;font-weight:700;font-size:13px;color:#8B5CF6">${priceStr}</td></tr>
          <tr><td style="padding:6px 0;color:#71717a;font-size:13px">Pagamento</td><td style="padding:6px 0;text-align:right;font-weight:600;font-size:13px">${paymentLabel(params.paymentMethod)}</td></tr>
        </table>
      </div>
      <div style="background:#1c1917;border-radius:12px;padding:14px;border:1px solid #27272a">
        <p style="margin:0 0 4px;font-weight:700;font-size:14px">${params.barbershopName}</p>
        <p style="margin:0;color:#71717a;font-size:13px">📍 ${params.barbershopAddress}</p>
      </div>
      <p style="margin:20px 0 0;text-align:center;color:#52525b;font-size:12px">Para cancelar, acesse o app em Agendamentos.</p>
    </div>`)

  await resend.emails.send({
    from: "Agendei <noreply@agendei.app>",
    to: params.to,
    subject: `✅ Agendamento confirmado — ${params.serviceName}`,
    html,
  })
}

export const sendBookingCancellation = async (params: {
  to: string
  clientName: string
  serviceName: string
  barbershopName: string
  date: Date
}) => {
  const resend = getResend()
  if (!resend) return

  const dateStr = format(params.date, "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })

  const html = baseWrapper(`
    <div style="background:#18181b;border-radius:16px;padding:28px;border:1px solid #27272a">
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:40px;margin-bottom:8px">❌</div>
        <h1 style="margin:0;font-size:20px;font-weight:700">Agendamento Cancelado</h1>
        <p style="margin:6px 0 0;color:#71717a;font-size:14px">Olá, ${params.clientName}! Seu agendamento foi cancelado.</p>
      </div>
      <div style="background:#09090b;border-radius:12px;padding:16px;border:1px solid #27272a">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 0;color:#71717a;font-size:13px">Serviço</td><td style="padding:6px 0;text-align:right;font-weight:600;font-size:13px">${params.serviceName}</td></tr>
          <tr><td style="padding:6px 0;color:#71717a;font-size:13px">Data e hora</td><td style="padding:6px 0;text-align:right;font-weight:600;font-size:13px;text-transform:capitalize">${dateStr}</td></tr>
          <tr><td style="padding:6px 0;color:#71717a;font-size:13px">Barbearia</td><td style="padding:6px 0;text-align:right;font-weight:600;font-size:13px">${params.barbershopName}</td></tr>
        </table>
      </div>
      <p style="margin:20px 0 0;text-align:center;color:#52525b;font-size:12px">Você pode fazer um novo agendamento a qualquer momento.</p>
    </div>`)

  await resend.emails.send({
    from: "Agendei <noreply@agendei.app>",
    to: params.to,
    subject: `❌ Agendamento cancelado — ${params.serviceName}`,
    html,
  })
}

export const sendNewBookingAlert = async (params: {
  to: string
  clientName: string
  serviceName: string
  date: Date
  employeeName?: string | null
  paymentMethod?: string | null
  price: number
}) => {
  const resend = getResend()
  if (!resend) return

  const dateStr = format(params.date, "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })
  const priceStr = Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(params.price)

  const html = baseWrapper(`
    <div style="background:#18181b;border-radius:16px;padding:28px;border:1px solid #27272a">
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:40px;margin-bottom:8px">📅</div>
        <h1 style="margin:0;font-size:20px;font-weight:700">Novo Agendamento!</h1>
        <p style="margin:6px 0 0;color:#71717a;font-size:14px">Um novo cliente agendou um horário.</p>
      </div>
      <div style="background:#09090b;border-radius:12px;padding:16px;border:1px solid #27272a">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 0;color:#71717a;font-size:13px">Cliente</td><td style="padding:6px 0;text-align:right;font-weight:600;font-size:13px">${params.clientName}</td></tr>
          <tr><td style="padding:6px 0;color:#71717a;font-size:13px">Serviço</td><td style="padding:6px 0;text-align:right;font-weight:600;font-size:13px">${params.serviceName}</td></tr>
          <tr><td style="padding:6px 0;color:#71717a;font-size:13px">Data e hora</td><td style="padding:6px 0;text-align:right;font-weight:600;font-size:13px;text-transform:capitalize">${dateStr}</td></tr>
          ${params.employeeName ? `<tr><td style="padding:6px 0;color:#71717a;font-size:13px">Profissional</td><td style="padding:6px 0;text-align:right;font-weight:600;font-size:13px">${params.employeeName}</td></tr>` : ""}
          <tr><td style="padding:6px 0;color:#71717a;font-size:13px">Valor</td><td style="padding:6px 0;text-align:right;font-weight:700;font-size:13px;color:#8B5CF6">${priceStr}</td></tr>
          <tr><td style="padding:6px 0;color:#71717a;font-size:13px">Pagamento</td><td style="padding:6px 0;text-align:right;font-weight:600;font-size:13px">${paymentLabel(params.paymentMethod)}</td></tr>
        </table>
      </div>
    </div>`)

  await resend.emails.send({
    from: "Agendei <noreply@agendei.app>",
    to: params.to,
    subject: `📅 Novo agendamento — ${params.clientName}`,
    html,
  })
}
