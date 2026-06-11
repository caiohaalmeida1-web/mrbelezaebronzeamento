import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

/**
 * Cliente Supabase para páginas públicas estáticas (SSG/ISR).
 *
 * Não lê cookies — por isso não força a rota a ser dinâmica e permite
 * que `export const revalidate` funcione de verdade. Usa a anon key,
 * então só enxerga dados liberados por RLS para leitura pública
 * (produtos ativos, posts publicados, galeria ativa, avaliações aprovadas).
 *
 * NÃO use em páginas que dependem do usuário logado.
 */
export function createStaticClient(): SupabaseClient<any, "public", any> {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
