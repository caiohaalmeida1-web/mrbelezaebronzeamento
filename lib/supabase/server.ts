import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase para Server Components, Server Actions e Route Handlers.
 * Lê/escreve cookies para manter a sessão sincronizada.
 */
export function createClient(): SupabaseClient<any, "public", any> {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Em Server Components puros, set() lança. Ignoramos pois o
            // middleware é responsável por persistir os cookies de sessão.
          }
        },
      },
    }
  );
}
