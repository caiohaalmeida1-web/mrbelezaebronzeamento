import { NextResponse, type NextRequest } from "next/server";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** Escapa célula de CSV (aspas, vírgulas e quebras de linha). */
function csvCell(value: unknown): string {
  const s = String(value ?? "");
  if (/[",;\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * GET /api/financeiro/csv?inicio=ISO&fim=ISO
 * Exporta movimentações (sessões + pedidos) do período. Apenas admin.
 */
export async function GET(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "sem permissão" }, { status: 403 });
  }

  const inicio = req.nextUrl.searchParams.get("inicio");
  const fim = req.nextUrl.searchParams.get("fim");
  if (!inicio || !fim || isNaN(Date.parse(inicio)) || isNaN(Date.parse(fim))) {
    return NextResponse.json(
      { error: "parâmetros inicio/fim inválidos" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const [{ data: agendamentos, error: agendErr }, { data: pedidos, error: pedErr }] =
    await Promise.all([
      admin
        .from("agendamentos")
        .select("data_hora, status, valor_pago, profiles(full_name), servicos(nome)")
        .gte("data_hora", inicio)
        .lte("data_hora", fim)
        .order("data_hora"),
      admin
        .from("pedidos")
        .select("created_at, status, valor_total, profiles(full_name)")
        .gte("created_at", inicio)
        .lte("created_at", fim)
        .order("created_at"),
    ]);

  if (agendErr || pedErr) {
    console.error("[financeiro/csv]", agendErr ?? pedErr);
    return NextResponse.json(
      { error: "erro ao consultar movimentações" },
      { status: 500 }
    );
  }

  type Rel = { full_name: string } | null;

  const linhas: string[] = [
    ["Data", "Tipo", "Cliente", "Descrição", "Status", "Valor (R$)"].join(";"),
  ];

  for (const a of agendamentos ?? []) {
    const cliente = a.profiles as unknown as Rel;
    const servico = a.servicos as unknown as { nome: string } | null;
    linhas.push(
      [
        format(new Date(a.data_hora), "dd/MM/yyyy HH:mm"),
        "Sessão",
        csvCell(cliente?.full_name),
        csvCell(servico?.nome),
        a.status,
        String(Number(a.valor_pago ?? 0)).replace(".", ","),
      ].join(";")
    );
  }

  for (const p of pedidos ?? []) {
    const cliente = p.profiles as unknown as Rel;
    linhas.push(
      [
        format(new Date(p.created_at), "dd/MM/yyyy HH:mm"),
        "Pedido loja",
        csvCell(cliente?.full_name),
        "Compra na loja",
        p.status,
        String(Number(p.valor_total)).replace(".", ","),
      ].join(";")
    );
  }

  // BOM para o Excel abrir acentos corretamente
  const csv = "\uFEFF" + linhas.join("\n");
  const nomeArquivo = `financeiro-${format(new Date(inicio), "yyyy-MM")}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
    },
  });
}
