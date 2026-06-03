import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase para Client Components.
 * Usa as chaves PUBLIC ANON (seguras de expor no browser).
 *
 * O retorno é tipado como `SupabaseClient` (sem generic Database) — em
 * produção, gere os tipos do schema via `supabase gen types typescript`
 * e parametrize. Para queries específicas, use `.returns<T>()` ou cast
 * para os tipos exportados em `@/types/database`.
 */
export function createClient(): SupabaseClient<any, "public", any> {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
