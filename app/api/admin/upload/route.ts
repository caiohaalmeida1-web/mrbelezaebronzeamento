import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  MAX_IMAGEM_MB,
  extensaoImagem,
  tamanhoImagemValido,
  tipoImagemValido,
} from "@/lib/upload-limits";
import {
  bucketAdminValido,
  verificarAdminApi,
} from "@/lib/verificar-admin-api";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/admin/upload
 * Body JSON: { bucket, fileName, fileType, fileSize, pathPrefix? }
 * Retorna URL assinada para o browser enviar o arquivo direto ao Supabase Storage.
 */
export async function POST(req: NextRequest) {
  const adminUser = await verificarAdminApi();
  if (!adminUser) {
    return NextResponse.json({ ok: false, erro: "Sem permissão." }, { status: 403 });
  }

  let body: {
    bucket?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    pathPrefix?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, erro: "Requisição inválida." },
      { status: 400 }
    );
  }

  if (!bucketAdminValido(body.bucket)) {
    return NextResponse.json(
      { ok: false, erro: "Bucket de destino inválido." },
      { status: 400 }
    );
  }

  const fileName = body.fileName ?? "imagem.jpg";
  const fileType = body.fileType || "image/jpeg";
  const fileSize = Number(body.fileSize ?? 0);
  const prefix =
    body.pathPrefix?.replace(/^\/+|\/+$/g, "") &&
    !body.pathPrefix.includes("..")
      ? `${body.pathPrefix.replace(/^\/+|\/+$/g, "")}/`
      : "";

  if (!fileSize || !tamanhoImagemValido(fileSize)) {
    return NextResponse.json(
      {
        ok: false,
        erro: `Imagem inválida ou maior que ${MAX_IMAGEM_MB}MB.`,
      },
      { status: 400 }
    );
  }

  if (!tipoImagemValido(fileType, fileName)) {
    return NextResponse.json(
      { ok: false, erro: "Envie apenas imagens JPG, PNG ou WebP." },
      { status: 400 }
    );
  }

  try {
    const admin = createAdminClient();
    const ext = extensaoImagem(fileName, fileType);
    const path = `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { data, error } = await admin.storage
      .from(body.bucket)
      .createSignedUploadUrl(path, { upsert: false });

    if (error || !data?.signedUrl) {
      console.error(`[upload ${body.bucket}] signed url`, error);
      const msg = error?.message ?? "Erro desconhecido";
      return NextResponse.json(
        {
          ok: false,
          erro: msg.includes("Bucket not found")
            ? "Bucket de imagens não configurado."
            : `Não foi possível preparar o upload: ${msg}`,
        },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = admin.storage.from(body.bucket).getPublicUrl(path);

    return NextResponse.json({
      ok: true,
      signedUrl: data.signedUrl,
      path,
      publicUrl,
      contentType: fileType,
    });
  } catch (e) {
    console.error(`[upload ${body.bucket}] exceção`, e);
    const msg =
      e instanceof Error && e.message.includes("SUPABASE_SERVICE_ROLE_KEY")
        ? "Servidor sem chave de admin (SUPABASE_SERVICE_ROLE_KEY). Configure na Vercel."
        : "Erro interno ao preparar o upload.";
    return NextResponse.json({ ok: false, erro: msg }, { status: 500 });
  }
}
