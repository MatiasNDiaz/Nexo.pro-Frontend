import { BadgeCheck, MapPin } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/feedback";
import { areasSummary, displayName, primaryProfession, rateModeLabel } from "@/features/catalog/labels";
import type { CatalogItem } from "@/features/catalog/types";
import { formatMoney } from "@/lib/format";
import { AttentionBadge } from "./attention-badge";
import { RatingSummary } from "./rating";
import { RemoteImage } from "./remote-image";

/**
 * Tarjeta de un profesional en el catálogo. Toda la tarjeta es un único enlace (el nombre es su
 * texto accesible); no hay botones adentro para no anidar elementos interactivos.
 * `preload` solo para la primera tarjeta visible: es la imagen que define la carga percibida (LCP).
 */
export function ProfessionalCard({ item, preload = false }: { item: CatalogItem; preload?: boolean }) {
  const name = displayName(item);
  const profession = primaryProfession(item);
  const rate = formatMoney(item.referenceRate);
  const cover = item.coverImageUrl ?? item.avatarUrl;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-[transform,box-shadow,border-color] duration-300 ease-out-soft hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-raised has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-electric-500">
      <div className="relative aspect-4/3 overflow-hidden bg-linear-to-br from-brand-100 to-brand-50">
        {cover ? (
          <RemoteImage
            src={cover}
            alt=""
            fill
            preload={preload}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]"
          />
        ) : (
          <span aria-hidden="true" className="absolute inset-0 grid place-items-center font-display text-5xl font-bold text-brand-300">
            {item.firstName[0]}
            {item.lastName[0]}
          </span>
        )}
        <AttentionBadge status={item.attentionStatus} className="absolute top-3 left-3 shadow-xs" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start gap-3">
          {item.avatarUrl && item.coverImageUrl && (
            <span className="relative -mt-11 size-14 shrink-0 overflow-hidden rounded-2xl border-4 border-surface bg-brand-50 shadow-card">
              <RemoteImage src={item.avatarUrl} alt="" fill sizes="56px" className="object-cover" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold text-ink">
              <Link
                href={`/profesionales/${item.slug}`}
                className="outline-none after:absolute after:inset-0 after:content-['']"
              >
                {name}
              </Link>
            </h3>
            {item.businessName && <p className="truncate text-sm text-muted">{item.businessName}</p>}
          </div>
          <span role="img" aria-label="Identidad verificada" title="Identidad verificada" className="mt-1 shrink-0">
            <BadgeCheck className="size-5 text-electric-500" aria-hidden="true" />
          </span>
        </div>

        {profession && <p className="font-medium text-brand-700">{profession}</p>}

        {item.serviceAreas.length > 0 && (
          <p className="flex items-start gap-1.5 text-sm text-muted">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span className="line-clamp-2">{areasSummary(item.serviceAreas)}</span>
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
          <RatingSummary average={item.ratingAverage} count={item.ratingCount} />
          <div className="flex flex-wrap items-center gap-2">
            {item.freeQuote && <Badge tone="electric">Presupuesto sin cargo</Badge>}
            {rate && item.rateMode && (
              <span className="text-sm text-muted" title="Tarifa de referencia que indica el profesional">
                <span className="font-semibold text-ink">{rate}</span> {rateModeLabel[item.rateMode]}
                <span className="sr-only"> (tarifa de referencia)</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
