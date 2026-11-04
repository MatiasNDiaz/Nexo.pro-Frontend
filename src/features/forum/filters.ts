/*
 * Filtros del foro. URL pública en castellano:
 *   /foro?tipo=busco-profesional&oficio=plomero&localidad=<uuid>&estado=abiertas&pagina=2
 * Se traducen a ForumQueryDto (type, professionId, localityId, resolved, page, limit). Un valor
 * inválido se ignora: nunca llega al backend.
 */

export const FORUM_PAGE_SIZE = 15;
const MAX_PAGE = 500;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG = /^[a-z0-9-]{1,80}$/;

export type ForumType = "QUESTION" | "PROFESSIONAL_WANTED";

const typeBySlug: Record<string, ForumType> = { preguntas: "QUESTION", "busco-profesional": "PROFESSIONAL_WANTED" };
const slugByType: Record<ForumType, string> = { QUESTION: "preguntas", PROFESSIONAL_WANTED: "busco-profesional" };

export interface ForumFilters {
  type: ForumType | null;
  professionSlug: string | null;
  localityId: string | null;
  /** true = resueltas, false = abiertas, null = todas. */
  resolved: boolean | null;
  page: number;
}

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export function parseForumFilters(params: SearchParams): ForumFilters {
  const tipo = first(params.tipo) ?? "";
  const oficio = first(params.oficio)?.toLowerCase() ?? "";
  const localidad = first(params.localidad) ?? "";
  const estado = first(params.estado);
  const pagina = Number.parseInt(first(params.pagina) ?? "", 10);
  return {
    type: typeBySlug[tipo] ?? null,
    professionSlug: SLUG.test(oficio) ? oficio : null,
    localityId: UUID.test(localidad) ? localidad : null,
    resolved: estado === "resueltas" ? true : estado === "abiertas" ? false : null,
    page: Number.isInteger(pagina) && pagina >= 1 && pagina <= MAX_PAGE ? pagina : 1,
  };
}

export function toForumQuery(filters: ForumFilters, professions: { id: string; slug: string }[]) {
  const professionId = filters.professionSlug
    ? (professions.find((profession) => profession.slug === filters.professionSlug)?.id ?? null)
    : null;
  return {
    type: filters.type,
    professionId,
    localityId: filters.localityId,
    resolved: filters.resolved,
    page: filters.page,
    limit: FORUM_PAGE_SIZE,
  };
}

export function forumHref(filters: Partial<ForumFilters>): string {
  const params = new URLSearchParams();
  if (filters.type) params.set("tipo", slugByType[filters.type]);
  if (filters.professionSlug) params.set("oficio", filters.professionSlug);
  if (filters.localityId) params.set("localidad", filters.localityId);
  if (filters.resolved === true) params.set("estado", "resueltas");
  if (filters.resolved === false) params.set("estado", "abiertas");
  if (filters.page && filters.page > 1) params.set("pagina", String(filters.page));
  const query = params.toString();
  return query ? `/foro?${query}` : "/foro";
}

export function isUuid(value: string): boolean {
  return UUID.test(value);
}
