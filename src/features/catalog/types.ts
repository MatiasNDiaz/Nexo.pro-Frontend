import type { Schemas } from "@/lib/api/client";

export type CatalogItem = Schemas["CatalogItemDto"];
export type CatalogPage = Schemas["CatalogPageDto"];
export type ReviewPage = Schemas["ReviewPageDto"];
export type PublicReview = Schemas["PublicReviewDto"];
export type AttentionStatus = CatalogItem["attentionStatus"];
export type RateMode = NonNullable<CatalogItem["rateMode"]>;

/**
 * Disponibilidad del perfil público. El OpenAPI del backend la declara como `string[]` (anotación
 * incompleta en PublicAvailabilityDto), pero el código devuelve objetos (catalog.service.ts, `profile`):
 * se tipa según lo que realmente responde.
 */
export interface PublicAvailability {
  /** 1 = lunes … 7 = domingo; horas "HH:MM" de Córdoba. */
  slots: { weekday: number; start: string; end: string }[];
  /** Próximos días sin atención (fechas AAAA-MM-DD). */
  exceptions: { startDate: string; endDate: string; type: "DAY_OFF" | "HOLIDAY" | "VACATION" }[];
}

export type PublicProfile = Omit<Schemas["PublicProfileDto"], "availability"> & { availability: PublicAvailability };

export interface Profession {
  id: string;
  name: string;
  slug: string;
}

export interface Locality {
  id: string;
  name: string;
}
