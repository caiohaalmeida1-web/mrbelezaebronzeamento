import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

/**
 * Cliente Supabase com SERVICE ROLE key.
 *
 * ⚠️  USAR APENAS EM SERVER-SIDE (API routes / Server Actions).
 * Bypassa Row Level Security — não exponha jamais ao cliente.
 */
export function createAdminClient(): SupabaseClient<any, "public", any> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin client requer NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
