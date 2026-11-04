/*
 * Filtros del catálogo. La URL pública usa nombres en castellano y el oficio por slug (legible y
 * mejor para buscadores): /profesionales?oficio=electricista&localidad=<uuid>&disponible=1&pagina=2
 * Se traducen a los parámetros del backend (CatalogQueryDto: professionId, localityId,
 * neighborhoodId, availableNow, page, limit). Un valor inválido se ignora: nunca llega al backend.
 */

export const CATALOG_PAGE_SIZE = 12;
/**
 * Reseñas por página en el perfil (el backend admite hasta 50). Vive en un módulo sin "use client":
 * lo leen componentes de servidor y de cliente (una constante exportada desde un módulo cliente le
 * llega al servidor como referencia, no como valor).
 */
export const REVIEWS_PAGE_SIZE = 10;
/** Tope del backend para `page` (CatalogQueryDto: ≤ 500). */
const MAX_PAGE = 500;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG = /^[a-z0-9-]{1,80}$/;

export interface CatalogFilters {
  professionSlug: string | null;
  localityId: string | null;
  neighborhoodId: string | null;
  availableNow: boolean;
  page: number;
}

export type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export function parseCatalogFilters(params: SearchParams): CatalogFilters {
  const oficio = first(params.oficio)?.toLowerCase() ?? "";
  const localidad = first(params.localidad) ?? "";
  const barrio = first(params.barrio) ?? "";
  const pagina = Number.parseInt(first(params.pagina) ?? "", 10);
  const localityId = UUID.test(localidad) ? localidad : null;
  return {
    professionSlug: SLUG.test(oficio) ? oficio : null,
    localityId,
    // El barrio solo tiene sentido dentro de una localidad.
    neighborhoodId: localityId && UUID.test(barrio) ? barrio : null,
    availableNow: first(params.disponible) === "1",
    page: Number.isInteger(pagina) && pagina >= 1 && pagina <= MAX_PAGE ? pagina : 1,
  };
}

/** Parámetros para `GET /catalog/professionals`. El oficio se resuelve de slug a id con la lista de oficios. */
export function toBackendQuery(filters: CatalogFilters, professions: { id: string; slug: string }[]) {
  const professionId = filters.professionSlug
    ? (professions.find((profession) => profession.slug === filters.professionSlug)?.id ?? null)
    : null;
  return {
    professionId,
    localityId: filters.localityId,
    neighborhoodId: filters.neighborhoodId,
    availableNow: filters.availableNow || null,
    page: filters.page,
    limit: CATALOG_PAGE_SIZE,
  };
}

/** URL del catálogo con estos filtros (solo los que tienen valor; la página 1 no se escribe). */
export function catalogHref(filters: Partial<CatalogFilters>): string {
  const params = new URLSearchParams();
  if (filters.professionSlug) params.set("oficio", filters.professionSlug);
  if (filters.localityId) params.set("localidad", filters.localityId);
  if (filters.localityId && filters.neighborhoodId) params.set("barrio", filters.neighborhoodId);
  if (filters.availableNow) params.set("disponible", "1");
  if (filters.page && filters.page > 1) params.set("pagina", String(filters.page));
  const query = params.toString();
  return query ? `/profesionales?${query}` : "/profesionales";
}

export function hasActiveFilters(filters: CatalogFilters): boolean {
  return !!(filters.professionSlug || filters.localityId || filters.availableNow);
}

export function totalPages(total: number, limit = CATALOG_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / limit));
}
