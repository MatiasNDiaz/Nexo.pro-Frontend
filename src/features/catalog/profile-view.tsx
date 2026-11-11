import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarClock,
  Car,
  Clock3,
  FileBadge,
  FileText,
  Globe,
  Heart,
  MapPin,
  MessageSquareText,
  Quote,
  Star,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { AttentionBadge } from "@/components/catalog/attention-badge";
import { MoreReviews } from "@/components/catalog/more-reviews";
import { ProfileContact } from "@/components/catalog/profile-contact";
import { ProfilePhotoTransition } from "@/components/catalog/profile-photo-transition";
import { Stars } from "@/components/catalog/rating";
import { RemoteImage } from "@/components/catalog/remote-image";
import { ReviewItem } from "@/components/catalog/review-item";
import { WorkGallery } from "@/components/catalog/work-gallery";
import { revealDelay } from "@/components/motion/reveal";
import { basicProfileBanner } from "@/content/photos";
import { REVIEWS_PAGE_SIZE } from "@/features/catalog/filters";
import { displayName, exceptionLabel, rateModeLabel, socialLabel, weekdayLabel } from "@/features/catalog/labels";
import { sectionAttributes, themeAnimations, themeFonts, themeStyle, type ProfileTheme, type SectionKey } from "@/features/catalog/profile-theme";
import type { PublicProfile, ReviewPage } from "@/features/catalog/types";
import { FavoriteButton } from "@/features/favorites/favorite-button";
import { ReportButton } from "@/features/reports/report-dialog";
import { ProfileActions } from "@/features/requests/profile-actions";
import { cn } from "@/lib/cn";
import { formatDay, formatMoney, formatRating, plural } from "@/lib/format";
import { mediaUrl, safeExternalUrl } from "@/lib/media";

/*
 * Geometría compartida con el esqueleto (la foto vuela desde la tarjeta hasta este lugar exacto):
 * la portada mide lo mismo y la foto sube lo mismo sobre ella.
 */
export const COVER = "relative h-52 overflow-hidden sm:h-72 lg:h-80";
export const AVATAR = "relative size-36 shrink-0 overflow-hidden rounded-3xl bg-brand-800 shadow-raised ring-4 ring-canvas -mt-20 sm:size-44 sm:-mt-24";

/** Envuelve una sección para editarla (el editor le agrega el menú ⋮). Sin editor, la deja igual. */
export type SectionFrame = (key: SectionKey, node: ReactNode) => ReactNode;

/**
 * La página pública del profesional. La usan la ruta /profesionales/[slug] (en el servidor) y el
 * editor de estilos del panel (en el navegador, `preview`): así el editor muestra exactamente lo que
 * se va a ver. En `preview` no hay acciones reales (contactar, guardar, reportar) ni transición de foto.
 */
export function ProfileView({
  profile,
  reviews,
  theme = profile.theme,
  frame = (_, node) => node,
  preview = false,
}: {
  profile: PublicProfile;
  reviews: ReviewPage | null;
  theme?: ProfileTheme;
  frame?: SectionFrame;
  preview?: boolean;
}) {
  const name = displayName(profile);
  const rate = formatMoney(profile.referenceRate);
  const sections = theme.sections;
  const font = theme.font ? themeFonts[theme.font].className : "font-display";
  const presentation = sectionAttributes(sections, "presentacion", null);
  // La animación de la sección "Presentación" reemplaza a la del nombre.
  const entrance = presentation["data-reveal"] ? "" : theme.animation ? themeAnimations[theme.animation].className : "animate-fade-up";
  const sortedProfessions = [...profile.professions].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
  const socials = profile.socialLinks.flatMap((link) => {
    const url = safeExternalUrl(link.url);
    return url ? [{ ...link, url }] : [];
  });
  const bannerVideo = profile.banner?.kind === "VIDEO" ? mediaUrl(profile.banner.url) : null;
  const page = sectionAttributes(sections, "pagina", null);
  const stats = sectionAttributes(sections, "datos");

  const avatar = profile.avatarUrl ? (
    <RemoteImage src={profile.avatarUrl} alt={`Foto de ${name}`} fill preload={!preview} sizes="176px" className="object-cover" />
  ) : (
    <span aria-hidden="true" className="grid size-full place-items-center font-display text-5xl font-bold text-brand-200">
      {profile.firstName[0]}
      {profile.lastName[0]}
    </span>
  );

  return (
    <article className="pb-20" style={{ ...themeStyle(theme), ...page.style } as CSSProperties} data-section="pagina">
      <header>
        {/*
          Portada: el banner del profesional (foto o, en Premium, video). Sin banner propio (todos los
          Basic: su plan no lo incluye), la portada de Repara Ya para perfiles básicos.
        */}
        <div className={cn(COVER, "bg-[linear-gradient(135deg,var(--pro-from),var(--pro-to))]")}>
          {profile.banner?.kind === "IMAGE" ? (
            <RemoteImage src={profile.banner.url} alt="" fill preload={!preview} sizes="100vw" className="object-cover motion-safe:animate-[ken-burns_24s_var(--ease-in-out-strong)_infinite_alternate]" />
          ) : bannerVideo ? (
            <video src={bannerVideo} autoPlay muted loop playsInline aria-hidden="true" className="absolute inset-0 size-full object-cover" />
          ) : (
            <Image
              src={basicProfileBanner.src}
              alt=""
              fill
              preload={!preview}
              quality={75}
              sizes="100vw"
              className="object-cover motion-safe:animate-[ken-burns_24s_var(--ease-in-out-strong)_infinite_alternate]"
              style={{ objectPosition: "70% 60%" }}
            />
          )}
          <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-brand-950/70 via-brand-950/10 to-transparent" />
        </div>

        <div className="container-page">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
            {/*
              Sin animación de entrada propia: la foto llega volando desde la tarjeta del catálogo (mismo
              nombre de transición, ver ProfilePhotoTransition) y tiene que estar quieta en su lugar.
            */}
            <span className={AVATAR}>{preview ? avatar : <ProfilePhotoTransition slug={profile.slug}>{avatar}</ProfilePhotoTransition>}</span>

            {frame(
              "presentacion",
              <div
                {...presentation}
                suppressHydrationWarning
                className={cn("flex min-w-0 flex-1 flex-col gap-3 sm:mt-5", entrance, presentation.className)}
              >
                <ul className="flex flex-wrap gap-2" aria-label="Oficios">
                  {sortedProfessions.map((item) => (
                    <li
                      key={item.id}
                      className={cn(
                        "rounded-full px-3 py-1 text-sm font-semibold",
                        item.isPrimary ? "bg-[var(--pro-accent)] text-white" : "bg-surface text-ink ring-1 ring-line",
                      )}
                    >
                      {item.name}
                    </li>
                  ))}
                </ul>
                <h1 className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-4xl leading-[1.02] font-bold text-brand-950 sm:text-5xl lg:text-6xl", font)}>
                  {name}
                  <span role="img" aria-label="Identidad verificada" title="Identidad verificada">
                    <BadgeCheck className="size-8 text-electric-500 sm:size-10" aria-hidden="true" />
                  </span>
                </h1>
                {profile.businessName && <p className="text-lg font-medium text-muted-strong">{profile.businessName}</p>}
                {theme.headline && (
                  <p className="flex items-start gap-2 text-xl leading-snug text-[var(--pro-accent)] sm:text-2xl">
                    <Quote className="mt-1 size-5 shrink-0 opacity-60" aria-hidden="true" />
                    <span className={cn(theme.font ? font : "font-serif italic")}>{theme.headline}</span>
                  </p>
                )}
              </div>,
            )}
          </div>

          {/* Los datos que deciden: calificación, experiencia, tarifa y si atiende ahora. */}
          {frame(
            "datos",
            <dl className="mt-8 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 lg:grid-cols-[repeat(4,minmax(0,1fr))]" data-section="datos">
              <Stat icon={Star} label="Calificación" delay={0} attributes={stats}>
                {profile.ratingAverage !== null && profile.ratingCount > 0 ? (
                  <>
                    <span className="flex items-baseline gap-2">
                      <span className="font-display text-3xl font-bold text-ink">{formatRating(profile.ratingAverage)}</span>
                      <Stars value={profile.ratingAverage} />
                    </span>
                    <span className="text-sm text-muted">{plural(profile.ratingCount, "reseña")}</span>
                  </>
                ) : (
                  <>
                    <span className="font-display text-2xl font-bold text-ink">Nuevo</span>
                    <span className="text-sm text-muted">Sin reseñas todavía</span>
                  </>
                )}
              </Stat>
              <Stat icon={BriefcaseBusiness} label="Experiencia" delay={1} attributes={stats}>
                <span className="font-display text-3xl font-bold text-ink">{profile.yearsExperience !== null ? profile.yearsExperience : "—"}</span>
                <span className="text-sm text-muted">{profile.yearsExperience !== null ? (profile.yearsExperience === 1 ? "año de oficio" : "años de oficio") : "Sin dato"}</span>
              </Stat>
              <Stat icon={Wallet} label="Tarifa de referencia" delay={2} attributes={stats}>
                {rate && profile.rateMode ? (
                  <>
                    <span className="font-display text-3xl font-bold text-ink">{rate}</span>
                    <span className="text-sm text-muted">{rateModeLabel[profile.rateMode]}</span>
                  </>
                ) : (
                  <>
                    <span className="font-display text-2xl font-bold text-ink">A convenir</span>
                    <span className="text-sm text-muted">Pedile un presupuesto</span>
                  </>
                )}
              </Stat>
              <Stat icon={Clock3} label="Ahora" delay={3} attributes={stats}>
                <AttentionBadge status={profile.attentionStatus} className="self-start text-sm" />
                <span className="text-sm text-muted">{profile.freeQuote ? "Presupuesto sin cargo" : "Presupuesto a consultar"}</span>
              </Stat>
            </dl>,
          )}
        </div>
      </header>

      <div className="container-page mt-10">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
          <div className="flex min-w-0 flex-col gap-12">
            {frame(
              "sobre",
              <Section title={`Sobre ${profile.firstName}`} attributes={sectionAttributes(sections, "sobre")}>
                {profile.bio ? (
                  <p className="text-lg leading-relaxed whitespace-pre-line text-ink">{profile.bio}</p>
                ) : (
                  <p className="text-muted">Todavía no escribió una descripción.</p>
                )}
                <ul className="flex flex-wrap gap-2">
                  {profile.freeQuote && <Pill icon={FileText}>Presupuesto sin cargo</Pill>}
                  {profile.hasMobility && <Pill icon={Car}>Movilidad propia</Pill>}
                  {profile.worksWithTeam && <Pill icon={Users}>Trabaja con equipo</Pill>}
                  <Pill icon={BadgeCheck}>Identidad verificada</Pill>
                </ul>
              </Section>,
            )}

            {profile.media.length > 0 &&
              frame(
                "trabajos",
                <Section title="Trabajos" attributes={sectionAttributes(sections, "trabajos")}>
                  <WorkGallery items={profile.media} name={profile.firstName} />
                </Section>,
              )}

            {profile.certifications.length > 0 &&
              frame(
                "certificados",
                <Section title="Certificados" attributes={sectionAttributes(sections, "certificados")}>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {profile.certifications.map((cert, index) => {
                      const url = mediaUrl(cert.url);
                      return (
                        <li key={cert.url} data-reveal style={revealDelay(index % 2, 70)} className="flex gap-3 rounded-2xl border border-line bg-surface p-4">
                          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--pro-accent)_12%,white)] text-[var(--pro-accent)]">
                            <FileBadge className="size-5" aria-hidden="true" />
                          </span>
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <p className="font-semibold text-ink">{cert.title}</p>
                            <p className="text-sm text-muted">{[cert.institution, cert.issuedYear].filter(Boolean).join(" · ") || "Sin datos de emisión"}</p>
                            {/* ADR 0020: el equipo no verifica certificados. */}
                            <p className="text-xs text-muted">Cargado por el profesional, no verificado por Repara Ya.</p>
                            {url && !preview && (
                              <a href={url} target="_blank" rel="noopener noreferrer" className="mt-1 text-sm font-semibold text-brand-700 underline-offset-4 hover:underline">
                                Ver certificado<span className="sr-only"> {cert.title} (se abre en otra pestaña)</span>
                              </a>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </Section>,
              )}

            {frame(
              "resenas",
              <Section title="Reseñas" attributes={sectionAttributes(sections, "resenas")}>
                {reviews && reviews.count > 0 ? (
                  <>
                    <div className="flex flex-wrap items-center gap-5 rounded-3xl bg-brand-950 p-6 text-white">
                      <span className="font-display text-6xl leading-none font-bold">{formatRating(reviews.average ?? profile.ratingAverage ?? 0)}</span>
                      <span className="flex flex-col gap-1">
                        <Stars value={reviews.average ?? profile.ratingAverage ?? 0} size="md" />
                        <span className="text-brand-200">{plural(reviews.count, "reseña")} de trabajos terminados</span>
                      </span>
                    </div>
                    <ul className="flex flex-col gap-3">
                      {reviews.data.map((review, index) => (
                        <li key={review.id} data-reveal style={revealDelay(index % 3, 60)}>
                          <ReviewItem review={review} professionalName={profile.firstName} />
                        </li>
                      ))}
                      {!preview && reviews.count > REVIEWS_PAGE_SIZE && <MoreReviews slug={profile.slug} professionalName={profile.firstName} total={reviews.count} />}
                    </ul>
                  </>
                ) : (
                  <p className="text-muted">Todavía no tiene reseñas. Las reseñas solo las dejan clientes con un trabajo terminado.</p>
                )}
              </Section>,
            )}
          </div>

          {/* Columna lateral: contacto, zonas y horarios. En celular va primero: contactar es lo principal. */}
          {/* En el editor no queda fija: si es más alta que la pantalla, los menús de abajo quedarían fuera de alcance. */}
          <aside className={cn("order-first flex min-w-0 flex-col gap-5 lg:order-none lg:self-start", !preview && "lg:sticky lg:top-24")}>
            {frame(
              "contacto",
              <Card attributes={sectionAttributes(sections, "contacto", null)} className="flex flex-col gap-4 overflow-hidden shadow-raised">
                <div className="-mx-5 -mt-5 mb-1 h-1.5 bg-[linear-gradient(90deg,var(--pro-from),var(--pro-to))]" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-brand-900">Contactá a {profile.firstName}</h2>
                {preview ? (
                  <ContactPreview />
                ) : (
                  <>
                    <ProfileActions slug={profile.slug} professionalUserId={profile.professionalUserId} firstName={profile.firstName} professions={profile.professions} />
                    <ProfileContact slug={profile.slug} name={profile.firstName} />
                    <FavoriteButton professionalUserId={profile.professionalUserId} name={profile.firstName} />
                    <ReportButton targetType="PROFILE" targetId={profile.professionalUserId} subject={`el perfil de ${profile.firstName}`} className="self-center" />
                  </>
                )}
              </Card>,
            )}

            {frame(
              "zonas",
              <SideCard icon={MapPin} title="Zonas de trabajo" attributes={sectionAttributes(sections, "zonas", null)}>
                <ul className="flex flex-wrap gap-2">
                  {profile.serviceAreas.map((area) => (
                    <li key={`${area.localityId}:${area.neighborhoodId ?? "todo"}`} className="rounded-full bg-canvas px-3 py-1 text-sm font-medium text-ink">
                      {area.neighborhoodName ? `${area.neighborhoodName}, ${area.localityName}` : `Toda ${area.localityName}`}
                    </li>
                  ))}
                </ul>
              </SideCard>,
            )}

            {(profile.availability.slots.length > 0 || profile.availability.exceptions.length > 0) &&
              frame(
                "horarios",
                <SideCard icon={CalendarClock} title="Horarios de atención" attributes={sectionAttributes(sections, "horarios", null)}>
                  {profile.availability.slots.length > 0 && (
                    <dl className="flex flex-col divide-y divide-line text-sm">
                      {profile.availability.slots.map((slot) => (
                        <div key={`${slot.weekday}-${slot.start}`} className="flex justify-between gap-4 py-1.5">
                          <dt className="font-medium text-ink">{weekdayLabel[slot.weekday]}</dt>
                          <dd className="text-muted-strong tabular-nums">
                            {slot.start} a {slot.end}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {profile.availability.exceptions.length > 0 && (
                    <div className="mt-3 rounded-xl bg-amber-50 p-3">
                      <p className="text-sm font-semibold text-amber-800">Próximos días sin atención</p>
                      <ul className="mt-1 flex flex-col gap-1 text-sm text-brand-950">
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
                </SideCard>,
              )}

            {socials.length > 0 &&
              frame(
                "redes",
                <SideCard icon={Globe} title="Redes y sitio web" attributes={sectionAttributes(sections, "redes", null)}>
                  <ul className="flex flex-wrap gap-2">
                    {socials.map((link) => (
                      <li key={link.url}>
                        {/* Enlaces cargados por el usuario: nofollow/ugc y sin acceso a esta página. */}
                        <a
                          href={preview ? undefined : link.url}
                          target="_blank"
                          rel="nofollow ugc noopener noreferrer"
                          className="inline-flex h-9 items-center rounded-full border border-line px-3.5 text-sm font-semibold text-ink transition-colors hover:border-brand-300 hover:bg-surface"
                        >
                          {socialLabel[link.network] ?? link.network}
                          <span className="sr-only"> (se abre en otra pestaña)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </SideCard>,
              )}
          </aside>
        </div>
      </div>
    </article>
  );
}

type Attributes = ReturnType<typeof sectionAttributes>;

/** Sección del perfil: título con un subrayado corto del color del profesional. */
function Section({ title, attributes, children }: { title: string; attributes: Attributes; children: ReactNode }) {
  return (
    // suppressHydrationWarning: el sistema de aparición (data-revealed) puede marcarla antes de hidratar si ya está a la vista.
    <section {...attributes} className={cn("flex flex-col gap-5", attributes.className)} suppressHydrationWarning>
      <h2 className="relative pb-3 text-2xl font-bold text-brand-900 after:absolute after:bottom-0 after:left-0 after:h-1 after:w-10 after:rounded-full after:bg-[var(--pro-accent)] sm:text-3xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Stat({ icon: Icon, label, delay, attributes, children }: { icon: LucideIcon; label: string; delay: number; attributes: Attributes; children: ReactNode }) {
  return (
    <div
      {...attributes}
      data-section={undefined}
      suppressHydrationWarning
      style={{ ...revealDelay(delay, 70), ...attributes.style }}
      className="flex flex-col gap-1.5 rounded-2xl border border-line bg-surface p-4 transition-[border-color,translate] duration-300 ease-out-soft hover:-translate-y-0.5 hover:border-brand-200 sm:p-5"
    >
      <dt className="flex items-center gap-2 text-sm font-medium text-muted-strong">
        <Icon className="size-4 text-[var(--pro-accent)]" aria-hidden="true" />
        {label}
      </dt>
      <dd className="flex flex-col gap-0.5">{children}</dd>
    </div>
  );
}

function Pill({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <li className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-sm font-medium text-ink ring-1 ring-line">
      <Icon className="size-4 text-[var(--pro-accent)]" aria-hidden="true" />
      {children}
    </li>
  );
}

function Card({ attributes, className, children }: { attributes: Attributes; className?: string; children: ReactNode }) {
  return (
    <section {...attributes} suppressHydrationWarning className={cn("rounded-3xl border border-line bg-surface p-5", className)}>
      {children}
    </section>
  );
}

function SideCard({ icon: Icon, title, attributes, children }: { icon: LucideIcon; title: string; attributes: Attributes; children: ReactNode }) {
  return (
    <Card attributes={attributes}>
      <h2 className="mb-3 flex items-center gap-2 font-semibold text-brand-900">
        <Icon className="size-4 text-[var(--pro-accent)]" aria-hidden="true" />
        {title}
      </h2>
      {children}
    </Card>
  );
}

/** En el editor: los botones de contacto, como se ven, pero sin acción. */
function ContactPreview() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-2">
      <span className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-amber-400 font-semibold text-brand-900">
        <MessageSquareText className="size-5" />
        Pedir presupuesto
      </span>
      <span className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line font-semibold text-brand-800">
        <Heart className="size-4" />
        Guardar en favoritos
      </span>
    </div>
  );
}
