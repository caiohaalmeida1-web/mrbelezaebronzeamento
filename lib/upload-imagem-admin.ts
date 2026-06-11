import {
  MAX_IMAGEM_MB,
  tamanhoImagemValido,
  tipoImagemValido,
} from "@/lib/upload-limits";
import type { AdminUploadBucket } from "@/lib/verificar-admin-api";

const UPLOAD_TIMEOUT_MS = 90_000;

interface UploadMeta {
  ok: boolean;
  signedUrl?: string;
  path?: string;
  publicUrl?: string;
  contentType?: string;
  erro?: string;
}

export type ResultadoUploadImagem =
  | { ok: true; url: string; path: string }
  | { ok: false; erro: string };

interface OpcoesUpload {
  bucket: AdminUploadBucket;
  /** Ex.: "capas" para imagens do blog */
  pathPrefix?: string;
}

/**
 * Envia imagem direto ao Supabase Storage via URL assinada.
 * O arquivo não passa pelo servidor Next.js — evita travamento.
 */
export async function enviarImagemAdmin(
  file: File,
  { bucket, pathPrefix }: OpcoesUpload
): Promise<ResultadoUploadImagem> {
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
    metaRes = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bucket,
        pathPrefix,
        fileName: file.name,
        fileType: file.type || "image/jpeg",
        fileSize: file.size,
      }),
    });
  } catch {
    return {
      ok: false,
      erro: "Sem conexão com o servidor. Verifique a internet.",
    };
  }

  let meta: UploadMeta;
  try {
    meta = (await metaRes.json()) as UploadMeta;
  } catch {
    return { ok: false, erro: "Resposta inválida do servidor." };
  }

  if (
    !metaRes.ok ||
    !meta.ok ||
    !meta.signedUrl ||
    !meta.publicUrl ||
    !meta.path
  ) {
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
      console.error(`[upload ${bucket}] storage PUT`, uploadRes.status, detalhe);
      return {
        ok: false,
        erro: `Storage recusou o envio (HTTP ${uploadRes.status}). Tente outra imagem.`,
      };
    }

    return { ok: true, url: meta.publicUrl, path: meta.path };
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

/** Atalho para upload no bucket de produtos. */
export function enviarImagemProduto(file: File) {
  return enviarImagemAdmin(file, { bucket: "produtos" });
}

/** Atalho para upload no bucket da galeria de resultados. */
export function enviarImagemGaleria(file: File) {
  return enviarImagemAdmin(file, { bucket: "galeria" });
}

/** Atalho para capa de post do blog. */
export function enviarImagemBlogCapa(file: File) {
  return enviarImagemAdmin(file, { bucket: "blog", pathPrefix: "capas" });
}
