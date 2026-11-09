import { ArrowRight, BadgeCheck, MapPin } from "lucide-react";
import Link from "next/link";
import { areasSummary, displayName, primaryProfession, rateModeLabel } from "@/features/catalog/labels";
import type { CatalogItem } from "@/features/catalog/types";
import { formatMoney, plural } from "@/lib/format";
import { AttentionBadge } from "./attention-badge";
import { ProfilePhotoTransition } from "./profile-photo-transition";
import { RatingSummary } from "./rating";
import { RemoteImage } from "./remote-image";

/**
 * Un profesional en el catálogo: la cara grande arriba (es lo que da confianza), y abajo quién es,
 * qué hace, cómo trabaja y su tarifa de referencia. Toda la tarjeta es un único enlace (el nombre es
 * su texto accesible); no hay botones adentro para no anidar elementos interactivos. `preload` solo
 * para la primera (LCP).
 */
export function ProfessionalCard({ item, preload = false }: { item: CatalogItem; preload?: boolean }) {
  const name = displayName(item);
  const profession = primaryProfession(item);
  const rate = formatMoney(item.referenceRate);
  // La foto de la persona primero; la portada, si no tiene foto.
  const picture = item.avatarUrl ?? item.coverImageUrl;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[border-color,box-shadow,translate] duration-300 ease-out-soft hover:-translate-y-1.5 hover:border-electric-400 hover:shadow-[0_24px_50px_-22px_rgb(18_59_122/0.45)] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-electric-500">
      <div className="relative aspect-[6/5] overflow-hidden bg-brand-100">
        {/* La misma foto que la del perfil (mismo nombre): al navegar, el navegador la lleva de un lugar al otro. */}
        <ProfilePhotoTransition slug={item.slug}>
          {picture ? (
            <RemoteImage
              src={picture}
              alt=""
              fill
              preload={preload}
              sizes="(min-width: 1408px) 20vw, (min-width: 1024px) 26vw, (min-width: 640px) 46vw, 92vw"
              className="object-cover object-[center_30%] transition-transform duration-700 ease-out-soft group-hover:scale-[1.07]"
            />
          ) : (
            <span aria-hidden="true" className="grid size-full place-items-center font-display text-5xl font-bold text-brand-500">
              {item.firstName[0]}
              {item.lastName[0]}
            </span>
          )}
        </ProfilePhotoTransition>
        {/* Hover: un brillo cruza la foto, sube un degradado y aparece "Ver perfil" (decorativo: el enlace es el nombre). */}
        <span
          aria-hidden="true"
          className="shine-hover bg-linear-to-r from-transparent via-white/30 to-transparent group-hover:[animation:shine-once_700ms_var(--ease-out-soft)]"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-end justify-center bg-linear-to-t from-brand-950/75 via-brand-950/15 to-transparent pb-4 opacity-0 transition-opacity duration-300 ease-out-soft group-hover:opacity-100"
        >
          <span className="inline-flex translate-y-3 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-800 shadow-raised transition-[translate] duration-300 ease-out-soft group-hover:translate-y-0">
            Ver perfil
            <ArrowRight className="size-4" />
          </span>
        </span>
        <span className="absolute top-3 left-3">
          <AttentionBadge status={item.attentionStatus} />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="flex flex-col gap-0.5">
          <h3 className="flex items-center gap-1.5 text-lg leading-tight font-bold text-ink">
            {/*
              prefetch: trae el perfil completo de antemano para que llegue en el mismo instante del
              clic; si se mostrara primero el esqueleto, la foto no podría viajar de la tarjeta al perfil.
            */}
            <Link href={`/profesionales/${item.slug}`} prefetch className="truncate outline-none after:absolute after:inset-0 after:content-['']">
              {name}
            </Link>
            <span role="img" aria-label="Identidad verificada" title="Identidad verificada" className="shrink-0">
              <BadgeCheck className="size-[1.1rem] text-electric-500" aria-hidden="true" />
            </span>
          </h3>
          <p className="truncate text-sm">
            {profession && <span className="font-semibold text-brand-700">{profession}</span>}
            {item.businessName && <span className="text-muted"> · {item.businessName}</span>}
          </p>
        </div>

        {item.bio && <p className="line-clamp-2 text-sm leading-relaxed text-muted-strong">{item.bio}</p>}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted">
          <RatingSummary average={item.ratingAverage} count={item.ratingCount} />
          {item.serviceAreas.length > 0 && (
            <span className="flex max-w-full min-w-0 items-center gap-1">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{areasSummary(item.serviceAreas)}</span>
            </span>
          )}
          {item.yearsExperience !== null && <span>{plural(item.yearsExperience, "año", "años")} de oficio</span>}
          {item.freeQuote && <span className="font-semibold text-success-800">Presupuesto sin cargo</span>}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-3.5">
          {rate && item.rateMode ? (
            <span className="text-sm leading-tight text-muted" title="Tarifa de referencia que indica el profesional">
              <span className="block font-display text-lg font-bold text-ink">{rate}</span>
              {rateModeLabel[item.rateMode]}
              <span className="sr-only"> (tarifa de referencia)</span>
            </span>
          ) : (
            <span className="text-sm text-muted">Precio a convenir</span>
          )}
          <span aria-hidden="true" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
            Ver perfil
            <ArrowRight className="size-4 transition-transform duration-200 ease-out-soft group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
