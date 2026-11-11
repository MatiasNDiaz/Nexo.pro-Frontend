import type { PublicProfile } from "@/features/catalog/types";
import { api, type Schemas } from "@/lib/api/client";

/*
 * Perfil propio del profesional (docs E-084 a E-104; FI §6–7). Casi todo responde el perfil completo
 * actualizado (ProfessionalMeDto), que se guarda directo en la caché. Lo que depende del plan lo
 * controla el backend (PLAN_LIMIT_REACHED, THEME_NOT_IN_PLAN); acá solo se anticipa para explicarlo.
 */

export type ProfessionalMe = Schemas["ProfessionalMeDto"];
export type MediaItem = Schemas["MediaItemDto"];
export type MediaPurpose = MediaItem["purpose"];
export type Subscription = Schemas["SubscriptionSummaryDto"];
export type SocialNetwork = Schemas["SocialLinkDto"]["network"];
export type RateMode = NonNullable<ProfessionalMe["rateMode"]>;
export type Theme = Schemas["ProfileThemeDto"];

/** Límites de professional-profile.dto.ts. */
export const BUSINESS_NAME_MAX = 80;
export const BIO_MAX = 200;
export const YEARS_MAX = 70;
export const RATE_MAX = 99_999_999;
export const HEADLINE_MAX = 80;
export const SOCIAL_URL_MAX = 300;

/** Lo que le falta a la página para publicarse (PublicationRequirement del backend), en orden. */
export type PublicationRequirement = Schemas["OwnPublicPageDto"]["missing"][number];

/**
 * La página propia aunque todavía no esté publicada. `profile` va con el tipo escrito a mano de la
 * página pública (catalog/types.ts): el OpenAPI tipa mal la disponibilidad (ver FRONTEND_DECISIONES).
 */
export interface OwnPublicPage {
  published: boolean;
  missing: PublicationRequirement[];
  profile: PublicProfile;
}

export const proKeys = {
  me: ["professional", "me"] as const,
  subscription: ["subscription", "me"] as const,
  publicPage: ["professional", "public-page"] as const,
};

export const getMyProfile = () => api<ProfessionalMe>("/professionals/me");
export const getSubscription = () => api<Subscription>("/subscriptions/me");
/** No cuenta como visita en las métricas. */
export const getOwnPublicPage = () => api<OwnPublicPage>("/professionals/me/public-page");

export const updateProfile = (input: Schemas["UpdateProfessionalProfileDto"]) =>
  api<ProfessionalMe>("/professionals/me", { method: "PATCH", body: input });

export const setTheme = (theme: Theme) => api<ProfessionalMe>("/professionals/me/theme", { method: "PUT", body: theme });

export const replaceProfessions = (professionIds: string[], primaryId: string) =>
  api<ProfessionalMe>("/professionals/me/professions", { method: "PUT", body: { professionIds, primaryId } });

export const replaceServiceAreas = (serviceAreas: Schemas["ServiceAreaInputDto"][]) =>
  api<ProfessionalMe>("/professionals/me/service-areas", { method: "PUT", body: { serviceAreas } });

export const replaceSocialLinks = (links: Schemas["SocialLinkInputDto"][]) =>
  api<ProfessionalMe>("/professionals/me/social-links", { method: "PUT", body: { links } });

export const addMedia = (fileId: string, purpose: MediaPurpose) =>
  api<MediaItem>("/professionals/me/media", { method: "POST", body: { fileId, purpose } });

export const removeMedia = (id: string) => api(`/professionals/me/media/${id}`, { method: "DELETE" });

export const reorderMedia = (ids: string[]) => api<ProfessionalMe>("/professionals/me/media/order", { method: "PUT", body: { ids } });

/** Nombres de las redes (SocialNetwork del backend). */
export const socialNetworks: { value: SocialNetwork; label: string; placeholder: string }[] = [
  { value: "INSTAGRAM", label: "Instagram", placeholder: "https://instagram.com/tu-usuario" },
  { value: "FACEBOOK", label: "Facebook", placeholder: "https://facebook.com/tu-pagina" },
  { value: "TIKTOK", label: "TikTok", placeholder: "https://tiktok.com/@tu-usuario" },
  { value: "LINKEDIN", label: "LinkedIn", placeholder: "https://linkedin.com/in/tu-perfil" },
  { value: "YOUTUBE", label: "YouTube", placeholder: "https://youtube.com/@tu-canal" },
  { value: "WEBSITE", label: "Sitio web", placeholder: "https://tu-sitio.com" },
];

export const rateModes: { value: RateMode; label: string }[] = [
  { value: "PER_VISIT", label: "Por visita" },
  { value: "PER_HOUR", label: "Por hora" },
  { value: "PER_JOB", label: "Por trabajo" },
];

/** ¿El plan admite este nivel de personalización? (themeLevel: NONE < STANDARD < EXTENDED). */
export function themeAllows(subscription: Subscription | undefined, level: "STANDARD" | "EXTENDED"): boolean {
  const current = subscription?.live ? subscription.plan?.themeLevel : undefined;
  if (!current) return false;
  return level === "STANDARD" ? current !== "NONE" : current === "EXTENDED";
}
