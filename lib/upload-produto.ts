import {
  MAX_IMAGEM_MB,
  tamanhoImagemValido,
  tipoImagemValido,
} from "@/lib/upload-limits";

const UPLOAD_TIMEOUT_MS = 90_000;

interface UploadMeta {
  ok: boolean;
  signedUrl?: string;
  publicUrl?: string;
  contentType?: string;
  erro?: string;
}

/**
 * Envia imagem de produto direto ao Supabase Storage via URL assinada.
 * O arquivo não passa pelo servidor Next.js — evita travamento de Server Actions.
 */
export async function enviarImagemProduto(
  file: File
): Promise<{ ok: true; url: string } | { ok: false; erro: string }> {
  if (!tipoImagemValido(file.type || "image/jpeg", file.name)) {
    return { ok: false, erro: "Envie apenas imagens JPG, PNG ou WebP." };
  }
  if (!tamanhoImagemValido(file.size)) {
    return {
      ok: false,
      erro: `Imagem muito grande. Máximo ${MAX_IMAGEM_MB}MB.`,
    };
  }

  let metaRes: Response;
  try {
    metaRes = await fetch("/api/admin/produtos/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type || "image/jpeg",
        fileSize: file.size,
      }),
    });
  } catch {
    return { ok: false, erro: "Sem conexão com o servidor. Verifique a internet." };
  }

  let meta: UploadMeta;
  try {
    meta = (await metaRes.json()) as UploadMeta;
  } catch {
    return { ok: false, erro: "Resposta inválida do servidor." };
  }

  if (!metaRes.ok || !meta.ok || !meta.signedUrl || !meta.publicUrl) {
    return {
      ok: false,
      erro: meta.erro ?? `Erro do servidor (${metaRes.status}).`,
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  try {
    const uploadRes = await fetch(meta.signedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": meta.contentType ?? file.type ?? "image/jpeg",
      },
      signal: controller.signal,
    });

    if (!uploadRes.ok) {
      const detalhe = await uploadRes.text().catch(() => "");
      console.error("[upload produto] storage PUT", uploadRes.status, detalhe);
      return {
        ok: false,
        erro: `Storage recusou o envio (HTTP ${uploadRes.status}). Tente outra imagem.`,
      };
    }

    return { ok: true, url: meta.publicUrl };
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      return {
        ok: false,
        erro: "Upload demorou demais. Tente uma imagem menor ou conexão mais rápida.",
      };
    }
    return { ok: false, erro: "Falha ao enviar a imagem para o storage." };
  } finally {
    clearTimeout(timer);
  }
}
