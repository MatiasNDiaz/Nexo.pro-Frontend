import type { MetadataRoute } from "next";
import { env } from "@/config/env";
import { sitemapForumPosts, sitemapProfiles } from "@/features/seo/sitemap-data";

/**
 * Páginas públicas indexables: las fijas, los perfiles del catálogo y las publicaciones del foro.
 * No incluye páginas de cuenta, enlaces de email, legales provisorios ni secciones en construcción
 * (todas llevan `noindex`). Si la API no responde, quedan al menos las páginas fijas.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => `${env.siteUrl}${path}`;
  const fixed: MetadataRoute.Sitemap = [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/profesionales"), changeFrequency: "daily", priority: 0.9 },
    { url: url("/foro"), changeFrequency: "daily", priority: 0.7 },
    { url: url("/contacto"), changeFrequency: "yearly", priority: 0.3 },
  ];
  const [profiles, posts] = await Promise.all([
    sitemapProfiles().catch(() => []),
    sitemapForumPosts().catch(() => []),
  ]);
  return [
    ...fixed,
    ...profiles.map((slug) => ({ url: url(`/profesionales/${slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...posts.map((post) => ({ url: url(`/foro/${post.id}`), lastModified: post.createdAt, changeFrequency: "weekly" as const, priority: 0.5 })),
  ];
}
