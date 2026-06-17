import { Resend } from "resend";

let resendInstance: Resend | null = null;

export function getResend(): Resend {
  if (resendInstance) return resendInstance;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY não configurada");
  resendInstance = new Resend(key);
  return resendInstance;
}

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "noreply@merciaregina.com.br";

interface AgendamentoEmailData {
  nomeCliente: string;
  servico: string;
  dataHora: string;
  endereco: string;
}

export async function sendAgendamentoConfirmation(
  to: string,
  data: AgendamentoEmailData
) {
  const from = `Mércia Regina <${FROM_EMAIL}>`;
  const subject = "Seu agendamento está confirmado ✨";

  console.log("[resend] agendamento — iniciando envio", {
    to,
    from,
    subject,
    servico: data.servico,
    dataHora: data.dataHora,
    endereco: data.endereco,
  });

  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html: agendamentoEmailHtml(data),
    });

    if (result.error) {
      console.error("[resend] agendamento — erro retornado pela API", {
        to,
        from,
        subject,
        error: result.error,
        responseData: result.data,
      });
      throw new Error(
        result.error.message ?? "Resend retornou erro sem mensagem"
      );
    }

    console.log("[resend] agendamento — enviado com sucesso", {
      to,
      from,
      subject,
      messageId: result.data?.id ?? null,
      responseData: result.data,
    });

    return result;
  } catch (e) {
    console.error("[resend] agendamento — exceção ao chamar API", {
      to,
      from,
      subject,
      error:
        e instanceof Error
          ? { name: e.name, message: e.message, stack: e.stack }
          : e,
    });
    throw e;
  }
}

function agendamentoEmailHtml(d: AgendamentoEmailData): string {
  return `
  <!DOCTYPE html>
  <html lang="pt-BR">
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#FEF8EE; padding:32px;">
      <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:24px;padding:40px;box-shadow:0 8px 32px rgba(44,16,0,0.08);">
        <h1 style="font-family:'Cormorant Garamond', serif; color:#2C1000; font-size:32px; margin:0 0 8px;">
          Olá, ${d.nomeCliente}!
        </h1>
        <p style="color:#8B4513; font-size:14px; letter-spacing:1px; text-transform:uppercase; margin:0 0 24px;">
          Seu agendamento está confirmado
        </p>
        <div style="background:#FFF3D8; border-radius:16px; padding:24px; margin:24px 0;">
          <p style="margin:0 0 12px;"><strong>Serviço:</strong> ${d.servico}</p>
          <p style="margin:0 0 12px;"><strong>Data:</strong> ${d.dataHora}</p>
          <p style="margin:0;"><strong>Endereço:</strong> ${d.endereco}</p>
        </div>
        <p style="color:#2C1000; line-height:1.6;">
          Mal posso esperar para te receber. Lembre-se da nossa checklist:
          venha de pele limpa, traga 2 toalhas de banho e 1 de rosto, esteja
          alimentada e com cabelo preso. ✨
        </p>
        <p style="margin-top:32px; padding-top:24px; border-top:1px solid #FFF3D8; color:#8B4513; font-size:13px;">
          Mércia Regina · Beleza e Bronzeamento<br/>
          Vicente Pires, DF · (61) 98234-4399
        </p>
      </div>
    </body>
  </html>
  `;
}

export async function sendContactNotification(
  toAdmin: string,
  data: { nome: string; email: string; mensagem: string; telefone?: string }
) {
  const resend = getResend();
  return resend.emails.send({
    from: `Site Mércia Regina <${FROM_EMAIL}>`,
    to: toAdmin,
    subject: `Novo contato pelo site — ${data.nome}`,
    html: `
      <h2>Novo contato pelo site</h2>
      <p><strong>Nome:</strong> ${data.nome}</p>
      <p><strong>E-mail:</strong> ${data.email}</p>
      ${data.telefone ? `<p><strong>Telefone:</strong> ${data.telefone}</p>` : ""}
      <p><strong>Mensagem:</strong></p>
      <p>${data.mensagem.replace(/\n/g, "<br/>")}</p>
    `,
  });
}
