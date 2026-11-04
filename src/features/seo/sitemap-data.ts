import { cacheLife, cacheTag } from "next/cache";
import type { CatalogPage } from "@/features/catalog/types";
import type { ForumPage } from "@/features/forum/data";
import { serverGet } from "@/lib/api/server-api";

/** Topes para no recorrer de más la API (cada página es un pedido; límite del backend: 100 por minuto). */
const MAX_CATALOG_PAGES = 20; // hasta 1000 perfiles
const MAX_FORUM_PAGES = 10; // hasta 500 publicaciones
const PAGE_SIZE = 50; // máximo que admite el backend

/** Slugs de los perfiles publicados hoy en el catálogo. */
export async function sitemapProfiles(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");
  const slugs: string[] = [];
  for (let page = 1; page <= MAX_CATALOG_PAGES; page++) {
    const result = await serverGet<CatalogPage>("/catalog/professionals", { page, limit: PAGE_SIZE });
    if (!result) break;
    slugs.push(...result.data.map((item) => item.slug));
    if (page * PAGE_SIZE >= result.total) break;
  }
  return slugs;
}

/** Publicaciones visibles del foro, con su fecha para `lastModified`. */
export async function sitemapForumPosts(): Promise<{ id: string; createdAt: string }[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("forum");
  const posts: { id: string; createdAt: string }[] = [];
  for (let page = 1; page <= MAX_FORUM_PAGES; page++) {
    const result = await serverGet<ForumPage>("/forum/posts", { page, limit: PAGE_SIZE });
    if (!result) break;
    posts.push(...result.data.map((post) => ({ id: post.id, createdAt: post.createdAt })));
    if (page * PAGE_SIZE >= result.total) break;
  }
  return posts;
}
