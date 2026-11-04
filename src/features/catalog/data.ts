import { cacheLife, cacheTag } from "next/cache";
import { serverGet } from "@/lib/api/server-api";
import { CATALOG_PAGE_SIZE, REVIEWS_PAGE_SIZE, toBackendQuery, type CatalogFilters } from "./filters";
import type { CatalogPage, Locality, Profession, PublicProfile, ReviewPage } from "./types";

/*
 * Datos públicos del catálogo para las páginas armadas en el servidor. Todo pasa por caché:
 * - es lo que hace rápidas las páginas, y
 * - limita los pedidos del servidor de Next al backend (100 por minuto por IP en toda la API).
 * Las métricas Premium NO se cuentan acá (ver server-api.ts): las registra el navegador.
 */

/** Oficios activos (casi no cambian). */
export async function getProfessions(): Promise<Profession[]> {
  "use cache";
  cacheLife("days");
  cacheTag("professions");
  return (await serverGet<Profession[]>("/professions")) ?? [];
}

/** Localidades activas de todas las provincias activas (hoy, solo Córdoba). */
export async function getLocalities(): Promise<Locality[]> {
  "use cache";
  cacheLife("days");
  cacheTag("localities");
  const provinces = (await serverGet<Locality[]>("/locations/provinces")) ?? [];
  const lists = await Promise.all(
    provinces.map((province) => serverGet<Locality[]>("/locations/localities", { provinceId: province.id })),
  );
  return lists
    .flatMap((list) => list ?? [])
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

/** Una página de resultados. Los argumentos forman la clave de caché (un resultado por filtro). */
export async function searchCatalog(filters: CatalogFilters): Promise<CatalogPage> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  const professions = await getProfessions();
  const query = toBackendQuery(filters, professions);
  // Un oficio desconocido en la URL no tiene resultados (no se ignora: sería engañoso mostrar todos).
  if (filters.professionSlug && !query.professionId) {
    return { data: [], page: filters.page, limit: CATALOG_PAGE_SIZE, total: 0 };
  }
  return (
    (await serverGet<CatalogPage>("/catalog/professionals", query)) ?? {
      data: [],
      page: filters.page,
      limit: CATALOG_PAGE_SIZE,
      total: 0,
    }
  );
}

/** Perfil público por slug; null si no existe o hoy no está en el catálogo. */
export async function getPublicProfile(slug: string): Promise<PublicProfile | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`profile:${slug}`);
  return serverGet<PublicProfile>(`/catalog/professionals/${encodeURIComponent(slug)}`);
}

/** Primera página de reseñas visibles del perfil. */
export async function getProfileReviews(slug: string, page = 1): Promise<ReviewPage | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`profile:${slug}`);
  return serverGet<ReviewPage>(`/catalog/professionals/${encodeURIComponent(slug)}/reviews`, {
    page,
    limit: REVIEWS_PAGE_SIZE,
  });
}
