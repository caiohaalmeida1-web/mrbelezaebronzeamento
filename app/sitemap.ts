import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_CONFIG } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_CONFIG.url;

  const rotasFixas: MetadataRoute.Sitemap = [
    { url: `${base}/`, priority: 1.0, changeFrequency: "weekly" },
    { url: `${base}/servicos`, priority: 0.9, changeFrequency: "monthly" },
    { url: `${base}/agendar`, priority: 0.95, changeFrequency: "weekly" },
    { url: `${base}/loja`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${base}/sobre`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${base}/contato`, priority: 0.7, changeFrequency: "yearly" },
    { url: `${base}/fidelidade`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${base}/blog`, priority: 0.85, changeFrequency: "weekly" },
  ];

  try {
    const supabase = createAdminClient();
    const [{ data: posts }, { data: produtos }] = await Promise.all([
      supabase
        .from("blog_posts")
        .select("slug, updated_at")
        .eq("publicado", true),
      supabase.from("produtos").select("slug").eq("ativo", true),
    ]);

    const blogRotas: MetadataRoute.Sitemap = (posts ?? []).map(
      (p: { slug: string; updated_at?: string | null }) => ({
        url: `${base}/blog/${p.slug}`,
        lastModified: p.updated_at ?? undefined,
        changeFrequency: "monthly",
        priority: 0.7,
      })
    );

    const produtoRotas: MetadataRoute.Sitemap = (produtos ?? []).map(
      (p: { slug: string }) => ({
        url: `${base}/loja/${p.slug}`,
        changeFrequency: "weekly",
        priority: 0.7,
      })
    );

    return [...rotasFixas, ...blogRotas, ...produtoRotas];
  } catch {
    return rotasFixas;
  }
}
