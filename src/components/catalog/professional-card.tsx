import { ArrowRight, BadgeCheck, MapPin } from "lucide-react";
import Link from "next/link";
import { areasSummary, displayName, primaryProfession, rateModeLabel } from "@/features/catalog/labels";
import type { CatalogItem } from "@/features/catalog/types";
import { formatMoney, plural } from "@/lib/format";
import { AttentionBadge } from "./attention-badge";
import { RatingSummary } from "./rating";
import { RemoteImage } from "./remote-image";

/**
 * Un profesional en el catálogo, como fila escaneable: foto, quién es y qué hace, cómo trabaja y su
 * tarifa de referencia. Toda la tarjeta es un único enlace (el nombre es su texto accesible); no hay
 * botones adentro para no anidar elementos interactivos. `preload` solo para la primera (LCP).
 */
export function ProfessionalCard({ item, preload = false }: { item: CatalogItem; preload?: boolean }) {
  const name = displayName(item);
  const profession = primaryProfession(item);
  const rate = formatMoney(item.referenceRate);
  const picture = item.coverImageUrl ?? item.avatarUrl;

  return (
    <article className="group relative flex h-full gap-4 rounded-2xl border border-line bg-surface p-4 transition-[border-color,box-shadow] duration-200 ease-out-soft hover:border-brand-300 hover:shadow-raised has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-electric-500 sm:gap-5 sm:p-5">
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-brand-100 sm:size-28">
        {picture ? (
          <RemoteImage
            src={picture}
            alt=""
            fill
            preload={preload}
            sizes="112px"
            className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.04]"
          />
        ) : (
          <span aria-hidden="true" className="grid size-full place-items-center font-display text-2xl font-bold text-brand-500">
            {item.firstName[0]}
            {item.lastName[0]}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-col gap-0.5">
          <h3 className="flex items-center gap-1.5 text-lg leading-tight font-bold text-ink">
            <Link href={`/profesionales/${item.slug}`} className="truncate outline-none after:absolute after:inset-0 after:content-['']">
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
          {item.yearsExperience !== null && <span className="hidden sm:inline">{plural(item.yearsExperience, "año", "años")} de oficio</span>}
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <AttentionBadge status={item.attentionStatus} />
            {item.freeQuote && <span className="text-xs font-semibold text-success-800">Presupuesto sin cargo</span>}
          </div>
          <div className="flex items-center gap-4">
            {rate && item.rateMode ? (
              <span className="text-right text-sm leading-tight text-muted" title="Tarifa de referencia que indica el profesional">
                <span className="block font-display text-lg font-bold text-ink">{rate}</span>
                {rateModeLabel[item.rateMode]}
                <span className="sr-only"> (tarifa de referencia)</span>
              </span>
            ) : (
              <span className="text-sm text-muted">Precio a convenir</span>
            )}
            <span aria-hidden="true" className="hidden items-center gap-1 text-sm font-semibold text-brand-700 sm:inline-flex">
              Ver perfil
              <ArrowRight className="size-4 transition-transform duration-200 ease-out-soft group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
