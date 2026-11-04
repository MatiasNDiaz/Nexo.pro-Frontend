import { cacheLife, cacheTag } from "next/cache";
import { getProfessions } from "@/features/catalog/data";
import type { Schemas } from "@/lib/api/client";
import { serverGet } from "@/lib/api/server-api";
import { FORUM_PAGE_SIZE, isUuid, toForumQuery, type ForumFilters } from "./filters";

export type ForumPost = Schemas["ForumPostDto"];
export type ForumPage = Schemas["ForumPageDto"];
export type ForumPostDetail = Schemas["ForumPostDetailDto"];
export type ForumReply = Schemas["ForumReplyDto"];

/** Lista pública del foro (en caché un minuto, como el catálogo). */
export async function listForum(filters: ForumFilters): Promise<ForumPage> {
  "use cache";
  cacheLife("minutes");
  cacheTag("forum");
  const query = toForumQuery(filters, await getProfessions());
  const empty = { data: [], page: filters.page, limit: FORUM_PAGE_SIZE, total: 0 };
  // Un oficio desconocido en la URL no tiene resultados (no se ignora: sería engañoso mostrar todo).
  if (filters.professionSlug && !query.professionId) return empty;
  return (await serverGet<ForumPage>("/forum/posts", query)) ?? empty;
}

/** Detalle con respuestas; null si no existe, está oculto o el id no es válido. */
export async function getForumPost(id: string): Promise<ForumPostDetail | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`forum:${id}`);
  if (!isUuid(id)) return null;
  return serverGet<ForumPostDetail>(`/forum/posts/${id}`);
}
