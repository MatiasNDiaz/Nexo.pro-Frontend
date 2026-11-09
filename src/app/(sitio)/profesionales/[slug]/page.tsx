import {
  BadgeCheck,
  CalendarClock,
  Car,
  FileBadge,
  Globe,
  Images,
  MapPin,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { AttentionBadge } from "@/components/catalog/attention-badge";
import { MoreReviews } from "@/components/catalog/more-reviews";
import { CatalogBackTransition } from "@/components/catalog/catalog-return";
import { PendingProfilePhoto } from "@/components/catalog/photo-stash";
import { ProfileContact } from "@/components/catalog/profile-contact";
import { ProfilePhotoTransition } from "@/components/catalog/profile-photo-transition";
import { RatingSummary } from "@/components/catalog/rating";
import { RemoteImage } from "@/components/catalog/remote-image";
import { ReviewItem } from "@/components/catalog/review-item";
import { revealDelay } from "@/components/motion/reveal";
import { Skeleton } from "@/components/ui/feedback";
import { env } from "@/config/env";
import { cn } from "@/lib/cn";
import { getProfileReviews, getPublicProfile } from "@/features/catalog/data";
import { FavoriteButton } from "@/features/favorites/favorite-button";
import { ProfileActions } from "@/features/requests/profile-actions";
import { REVIEWS_PAGE_SIZE } from "@/features/catalog/filters";
import {
  areasSummary,
  displayName,
  exceptionLabel,
  primaryProfession,
  rateModeLabel,
  socialLabel,
  weekdayLabel,
} from "@/features/catalog/labels";
import type { PublicProfile } from "@/features/catalog/types";
import { serializeJsonLd } from "@/lib/json-ld";
import { formatDay, formatMoney, plural } from "@/lib/format";
import { mediaUrl, safeExternalUrl } from "@/lib/media";

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

  const name = displayName(profile);
  const profession = primaryProfession(profile);
  const rate = formatMoney(profile.referenceRate);
  const images = profile.media.filter((m) => m.kind === "IMAGE");
  const videos = profile.media.filter((m) => m.kind === "VIDEO");
  const socials = profile.socialLinks.flatMap((link) => {
    const url = safeExternalUrl(link.url);
    return url ? [{ ...link, url }] : [];
  });

  return (
    <article className="pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLdFor(profile)) }} />
      {/* "Atrás" hacia el catálogo con la foto volviendo a su tarjeta. */}
      <CatalogBackTransition />

      {/* Identidad: banda azul noche (con el banner del profesional de fondo, si tiene). */}
      <header className="relative isolate overflow-hidden bg-brand-950 text-white">
        {profile.banner?.kind === "IMAGE" && (
          <>
            <RemoteImage src={profile.banner.url} alt="" fill preload sizes="100vw" className="-z-20 object-cover" />
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-brand-950/75" />
          </>
        )}
        <div className="container-page flex flex-col gap-6 py-10 sm:flex-row sm:items-end sm:gap-8 sm:py-14">
          {/*
            Sin animación de entrada propia: la foto llega volando desde la tarjeta del catálogo (mismo
            nombre de transición, ver ProfilePhotoTransition) y tiene que estar quieta en su lugar.
          */}
          <span className="relative size-28 shrink-0 overflow-hidden rounded-2xl bg-brand-800 ring-1 ring-white/15 sm:size-36">
            <ProfilePhotoTransition slug={profile.slug}>
              {profile.avatarUrl ? (
                <RemoteImage src={profile.avatarUrl} alt={`Foto de ${name}`} fill preload sizes="144px" className="object-cover" />
              ) : (
                <span aria-hidden="true" className="grid size-full place-items-center font-display text-4xl font-bold text-brand-200">
                  {profile.firstName[0]}
                  {profile.lastName[0]}
                </span>
              )}
            </ProfilePhotoTransition>
          </span>
          <div className="flex min-w-0 flex-col gap-3 animate-fade-up">
            <div className="flex flex-col gap-1">
              {profession && <p className="font-semibold text-amber-400">{profession}</p>}
              <h1 className="flex flex-wrap items-center gap-2 text-4xl leading-[1.02] font-bold sm:text-6xl">
                {name}
                <span role="img" aria-label="Identidad verificada" title="Identidad verificada">
                  <BadgeCheck className="size-7 text-electric-400 sm:size-9" aria-hidden="true" />
                </span>
              </h1>
              {profile.businessName && <p className="text-lg text-brand-200">{profile.businessName}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <AttentionBadge status={profile.attentionStatus} />
              {profile.freeQuote && <span className="text-sm font-semibold text-white">Presupuesto sin cargo</span>}
              <RatingSummary average={profile.ratingAverage} count={profile.ratingCount} size="md" onDark />
            </div>
          </div>
        </div>
      </header>

      <div className="container-page pt-4">
        <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:gap-12">
          <div className="flex min-w-0 flex-col gap-8">

            {profile.bio && (
              <Section icon={Users} title={`Sobre ${profile.firstName}`}>
                <p className="leading-relaxed whitespace-pre-line text-ink">{profile.bio}</p>
              </Section>
            )}

            <Section icon={FileBadge} title="Servicio">
              <dl className="grid border-t border-line sm:grid-cols-2 sm:gap-x-10">
                <Fact label="Oficios" value={profile.professions.map((p) => p.name).join(", ")} />
                {profile.yearsExperience !== null && <Fact label="Experiencia" value={plural(profile.yearsExperience, "año")} />}
                {rate && profile.rateMode && <Fact label="Tarifa de referencia" value={`${rate} ${rateModeLabel[profile.rateMode]}`} />}
                <Fact label="Presupuesto" value={profile.freeQuote ? "Sin cargo" : "A consultar"} />
                {profile.worksWithTeam && <Fact label="Equipo" value="Trabaja con equipo" />}
                {profile.hasMobility && <Fact label="Movilidad" value="Tiene movilidad propia" icon={Car} />}
              </dl>
            </Section>

            {(images.length > 0 || videos.length > 0) && (
              <Section icon={Images} title="Trabajos">
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map((media, index) => (
                    <li key={media.url} data-reveal="scale" style={revealDelay(index % 3, 70)} className="relative aspect-square overflow-hidden rounded-2xl bg-brand-50">
                      <RemoteImage
                        src={media.url}
                        alt={`Trabajo de ${name} (${index + 1})`}
                        fill
                        sizes="(min-width: 1024px) 220px, (min-width: 640px) 33vw, 50vw"
                        className="object-cover"
                      />
                    </li>
                  ))}
                </ul>
                {videos.map((media) => {
                  const url = mediaUrl(media.url);
                  return url ? (
                    <video key={media.url} src={url} controls preload="none" playsInline className="mt-3 w-full rounded-2xl bg-brand-950">
                      Tu navegador no puede reproducir este video.
                    </video>
                  ) : null;
                })}
              </Section>
            )}

            {profile.certifications.length > 0 && (
              <Section icon={FileBadge} title="Certificados">
                <ul className="flex flex-col gap-3">
                  {profile.certifications.map((cert) => {
                    const url = mediaUrl(cert.url);
                    return (
                      <li key={cert.url} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line p-4">
                        <div>
                          <p className="font-semibold text-ink">{cert.title}</p>
                          <p className="text-sm text-muted">
                            {[cert.institution, cert.issuedYear].filter(Boolean).join(" · ") || "Sin datos de emisión"}
                          </p>
                          {/* ADR 0020: el equipo no verifica certificados. */}
                          <p className="mt-1 text-xs text-muted">Cargado por el profesional, no verificado por Repara Ya.</p>
                        </div>
                        {url && (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand-700 underline-offset-4 hover:underline">
                            Ver certificado<span className="sr-only"> {cert.title} (se abre en otra pestaña)</span>
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </Section>
            )}

            <Section icon={Star} title="Reseñas">
              {reviews && reviews.count > 0 ? (
                <ul className="flex flex-col gap-3">
                  {reviews.data.map((review) => (
                    <li key={review.id}>
                      <ReviewItem review={review} professionalName={profile.firstName} />
                    </li>
                  ))}
                  {reviews.count > REVIEWS_PAGE_SIZE && (
                    <MoreReviews slug={profile.slug} professionalName={profile.firstName} total={reviews.count} />
                  )}
                </ul>
              ) : (
                <p className="text-muted">Todavía no tiene reseñas. Las reseñas solo las dejan clientes con un trabajo terminado.</p>
              )}
            </Section>
          </div>

          {/* Columna lateral: contacto, zonas y horarios */}
          {/* En celular va primero: contactar es la acción principal del perfil. */}
          <aside className="order-first flex flex-col gap-5 pt-6 lg:sticky lg:top-24 lg:order-none lg:mt-8 lg:self-start lg:pt-0">
            <div className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-5 shadow-card">
              <h2 className="text-lg font-semibold text-brand-900">Contactá a {profile.firstName}</h2>
              <ProfileActions
                slug={profile.slug}
                professionalUserId={profile.professionalUserId}
                firstName={profile.firstName}
                professions={profile.professions}
              />
              <ProfileContact slug={profile.slug} name={profile.firstName} />
              <FavoriteButton professionalUserId={profile.professionalUserId} name={profile.firstName} />
            </div>

            <SideCard icon={MapPin} title="Zonas de trabajo">
              <ul className="flex flex-col gap-1.5 text-sm text-ink">
                {profile.serviceAreas.map((area) => (
                  <li key={`${area.localityId}:${area.neighborhoodId ?? "todo"}`}>
                    {area.neighborhoodName ? `${area.neighborhoodName}, ${area.localityName}` : `Toda ${area.localityName}`}
                  </li>
                ))}
              </ul>
            </SideCard>

            {(profile.availability.slots.length > 0 || profile.availability.exceptions.length > 0) && (
              <SideCard icon={CalendarClock} title="Horarios de atención">
                {profile.availability.slots.length > 0 && (
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                    {profile.availability.slots.map((slot) => (
                      <div key={`${slot.weekday}-${slot.start}`} className="contents">
                        <dt className="font-medium text-ink">{weekdayLabel[slot.weekday]}</dt>
                        <dd className="text-muted">
                          {slot.start} a {slot.end}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
                {profile.availability.exceptions.length > 0 && (
                  <div className="mt-3 border-t border-line pt-3">
                    <p className="text-sm font-medium text-ink">Próximos días sin atención</p>
                    <ul className="mt-1 flex flex-col gap-1 text-sm text-muted">
                      {profile.availability.exceptions.map((ex) => (
                        <li key={`${ex.startDate}-${ex.endDate}`}>
                          {exceptionLabel[ex.type]}: {formatDay(ex.startDate)}
                          {ex.endDate !== ex.startDate && ` al ${formatDay(ex.endDate)}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="mt-3 text-xs text-muted">Horario de Córdoba.</p>
              </SideCard>
            )}

            {socials.length > 0 && (
              <SideCard icon={Globe} title="Redes y sitio web">
                <ul className="flex flex-col gap-1.5 text-sm">
                  {socials.map((link) => (
                    <li key={link.url}>
                      {/* Enlaces cargados por el usuario: nofollow/ugc y sin acceso a esta página. */}
                      <a href={link.url} target="_blank" rel="nofollow ugc noopener noreferrer" className="font-medium text-brand-700 underline-offset-4 hover:underline">
                        {socialLabel[link.network] ?? link.network}
                        <span className="sr-only"> (se abre en otra pestaña)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </SideCard>
            )}
          </aside>
        </div>
      </div>
    </article>
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

/** Sección del perfil: título con peso propio (sin ícono decorativo) separado por una línea. */
function Section({ title, children }: { icon?: LucideIcon; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5 border-t border-line pt-8 first:border-t-0 first:pt-6">
      <h2 className="text-2xl font-bold text-brand-900 sm:text-3xl">{title}</h2>
      {children}
    </section>
  );
}

function SideCard({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-surface p-5">
      <h2 className="mb-3 flex items-center gap-2 font-semibold text-brand-900">
        <Icon className="size-4 text-brand-600" aria-hidden="true" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Fact({ label, value, icon: Icon }: { label: string; value: string; icon?: LucideIcon }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-3">
      <dt className="flex items-center gap-1.5 text-sm text-muted-strong">
        {Icon && <Icon className="size-4" aria-hidden="true" />}
        {label}
      </dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
    </div>
  );
}

/**
 * Mientras carga: la misma banda y la misma caja de foto que el encabezado real (mismas clases y
 * alturas de línea), con la foto de la tarjeta recién tocada adentro (PendingProfilePhoto). Así la
 * foto vuela hasta su lugar aunque el perfil no estuviera precargado, y la real la reemplaza sin moverse.
 */
function ProfileSkeleton() {
  const bar = "inline-block rounded-md bg-white/10 align-middle";
  return (
    <div aria-busy="true" aria-label="Cargando perfil">
      <div className="bg-brand-950">
        <div className="container-page flex flex-col gap-6 py-10 sm:flex-row sm:items-end sm:gap-8 sm:py-14">
          <span className="relative size-28 shrink-0 overflow-hidden rounded-2xl bg-brand-800 ring-1 ring-white/15 sm:size-36">
            <PendingProfilePhoto />
          </span>
          <div aria-hidden="true" className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-col gap-1">
              <p className="font-semibold">
                <span className={cn(bar, "h-[1em] w-24")} />
              </p>
              <p className="font-display text-4xl leading-[1.02] font-bold sm:text-6xl">
                <span className={cn(bar, "h-[0.85em] w-[7ch]")} />
              </p>
              <p className="text-lg">
                <span className={cn(bar, "h-[1em] w-40")} />
              </p>
            </div>
            <span className={cn(bar, "h-6 w-48 rounded-full")} />
          </div>
        </div>
      </div>
      <div className="container-page grid gap-8 pt-8 lg:grid-cols-[1fr_22rem] lg:gap-12">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-56 w-full rounded-3xl" />
      </div>
    </div>
  );
}
