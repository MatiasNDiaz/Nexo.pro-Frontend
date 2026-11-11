import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CatalogBackTransition } from "@/components/catalog/catalog-return";
import { PendingProfilePhoto } from "@/components/catalog/photo-stash";
import { Skeleton } from "@/components/ui/feedback";
import { env } from "@/config/env";
import { getProfileReviews, getPublicProfile } from "@/features/catalog/data";
import { areasSummary, displayName, primaryProfession } from "@/features/catalog/labels";
import { AVATAR, COVER, ProfileView } from "@/features/catalog/profile-view";
import type { PublicProfile } from "@/features/catalog/types";
import { cn } from "@/lib/cn";
import { serializeJsonLd } from "@/lib/json-ld";
import { mediaUrl } from "@/lib/media";

/** Slugs válidos del backend: minúsculas, números y guiones. Otro valor ni se consulta. */
const SLUG = /^[a-z0-9-]{1,80}$/;

async function loadProfile(slug: string): Promise<PublicProfile | null> {
  return SLUG.test(slug) ? getPublicProfile(slug) : null;
}

export async function generateMetadata({ params }: PageProps<"/profesionales/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const profile = await loadProfile(slug).catch(() => null);
  if (!profile) return { title: "Perfil no disponible", robots: { index: false } };

  const name = displayName(profile);
  const profession = primaryProfession(profile);
  const title = profession ? `${name}, ${profession.toLowerCase()}` : name;
  const description =
    profile.bio?.slice(0, 155) ??
    `${profession ?? "Profesional"} con identidad verificada en ${areasSummary(profile.serviceAreas, 3)}. Mirá sus trabajos y reseñas.`;
  const image = mediaUrl(profile.coverImageUrl ?? profile.avatarUrl);
  return {
    title,
    description,
    alternates: { canonical: `/profesionales/${profile.slug}` },
    openGraph: { type: "profile", title, description, ...(image ? { images: [{ url: image }] } : {}) },
  };
}

export default function ProfilePage({ params }: PageProps<"/profesionales/[slug]">) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <Profile params={params} />
    </Suspense>
  );
}

async function Profile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [profile, reviews] = await Promise.all([loadProfile(slug), SLUG.test(slug) ? getProfileReviews(slug) : null]);
  if (!profile) notFound();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLdFor(profile)) }} />
      {/* "Atrás" hacia el catálogo con la foto volviendo a su tarjeta. */}
      <CatalogBackTransition />
      {/* Sin banner propio, ProfileView muestra la portada de los perfiles básicos (content/photos.ts). */}
      <ProfileView profile={profile} reviews={reviews} />
    </>
  );
}

/** Datos estructurados (schema.org). Sin teléfono ni email: no se exponen al HTML en caché. */
function jsonLdFor(profile: PublicProfile) {
  const image = mediaUrl(profile.avatarUrl ?? profile.coverImageUrl);
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: profile.businessName ?? displayName(profile),
    description: profile.bio ?? undefined,
    url: `${env.siteUrl}/profesionales/${profile.slug}`,
    image: image ?? undefined,
    areaServed: [...new Set(profile.serviceAreas.map((area) => area.localityName))].map((name) => ({ "@type": "City", name })),
    knowsAbout: profile.professions.map((p) => p.name),
    ...(profile.ratingAverage && profile.ratingCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: profile.ratingAverage,
            reviewCount: profile.ratingCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}

/**
 * Mientras carga: la misma portada y la misma caja de foto que el perfil real (COVER y AVATAR), con
 * la foto de la tarjeta recién tocada adentro (PendingProfilePhoto). Así la foto vuela hasta su lugar
 * aunque el perfil no estuviera precargado, y la real la reemplaza sin moverse.
 */
function ProfileSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando perfil">
      <div className={cn(COVER, "bg-[linear-gradient(135deg,#123b7a,#07152a)]")} />
      <div className="container-page">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
          <span className={AVATAR}>
            <PendingProfilePhoto />
          </span>
          <div aria-hidden="true" className="flex min-w-0 flex-1 flex-col gap-3 sm:pt-5">
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-12 w-72 max-w-full" />
            <Skeleton className="h-5 w-40" />
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
