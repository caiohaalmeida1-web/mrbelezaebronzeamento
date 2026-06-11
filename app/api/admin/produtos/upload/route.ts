import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  MAX_IMAGEM_MB,
  extensaoImagem,
  tamanhoImagemValido,
  tipoImagemValido,
} from "@/lib/upload-limits";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

async function verificarAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return profile?.role === "admin" ? user : null;
}

/**
 * POST /api/admin/produtos/upload
 * Body JSON: { fileName, fileType, fileSize }
 * Retorna URL assinada para o browser enviar o arquivo direto ao Supabase Storage.
 */
export async function POST(req: NextRequest) {
  const adminUser = await verificarAdmin();
  if (!adminUser) {
    return NextResponse.json({ ok: false, erro: "Sem permissão." }, { status: 403 });
  }

  let body: { fileName?: string; fileType?: string; fileSize?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, erro: "Requisição inválida." },
      { status: 400 }
    );
  }

  const fileName = body.fileName ?? "imagem.jpg";
  const fileType = body.fileType || "image/jpeg";
  const fileSize = Number(body.fileSize ?? 0);

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
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { data, error } = await admin.storage
      .from("produtos")
      .createSignedUploadUrl(path, { upsert: false });

    if (error || !data?.signedUrl) {
      console.error("[upload produto] signed url", error);
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
    } = admin.storage.from("produtos").getPublicUrl(path);

    return NextResponse.json({
      ok: true,
      signedUrl: data.signedUrl,
      path,
      publicUrl,
      contentType: fileType,
    });
  } catch (e) {
    console.error("[upload produto] exceção", e);
    const msg =
      e instanceof Error && e.message.includes("SUPABASE_SERVICE_ROLE_KEY")
        ? "Servidor sem chave de admin (SUPABASE_SERVICE_ROLE_KEY). Configure na Vercel."
        : "Erro interno ao preparar o upload.";
    return NextResponse.json({ ok: false, erro: msg }, { status: 500 });
  }
}
