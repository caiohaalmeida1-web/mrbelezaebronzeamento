import { createClient } from "@/lib/supabase/server";
import type { GaleriaFoto } from "@/types/database";
import { GaleriaManager } from "./galeria-manager";

export const dynamic = "force-dynamic";

export default async function AdminGaleria() {
  const supabase = createClient();
  const { data } = await supabase
    .from("galeria_fotos")
    .select("*")
    .order("ordem", { ascending: true })
    .order("created_at", { ascending: false });

  const fotos: GaleriaFoto[] = data ?? [];

  return (
    <div className="space-y-8">
      <header>
        <p className="label-eyebrow">Galeria</p>
        <h1 className="mt-2 font-display text-4xl font-medium text-brand-brown sm:text-5xl">
          Fotos do site
        </h1>
      </header>

      <GaleriaManager fotos={fotos} />
    </div>
  );
}
