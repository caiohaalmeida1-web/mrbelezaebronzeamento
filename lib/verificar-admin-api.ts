import { createClient } from "@/lib/supabase/server";

/** Verifica se o request vem de um admin autenticado (API routes). */
export async function verificarAdminApi() {
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

export const BUCKETS_ADMIN = ["produtos", "galeria", "blog"] as const;
export type AdminUploadBucket = (typeof BUCKETS_ADMIN)[number];

export function bucketAdminValido(
  value: string | undefined
): value is AdminUploadBucket {
  return BUCKETS_ADMIN.includes(value as AdminUploadBucket);
}
