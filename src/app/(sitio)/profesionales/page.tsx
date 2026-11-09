import { SearchX, Users } from "lucide-react";
import type { Metadata, Route } from "next";
import { Suspense } from "react";
import { CatalogFiltersBar } from "@/components/catalog/catalog-filters";
import { Pagination } from "@/components/catalog/pagination";
import { ProfessionalCard } from "@/components/catalog/professional-card";
import { ViewBeacon } from "@/components/catalog/view-beacon";
import { PageHeader } from "@/components/layout/page-header";
import { revealDelay } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Alert, EmptyState, Skeleton } from "@/components/ui/feedback";
import { scenes } from "@/content/photos";
import { getLocalities, getProfessions, searchCatalog } from "@/features/catalog/data";
import {
  catalogHref,
  hasActiveFilters,
  parseCatalogFilters,
  toBackendQuery,
  totalPages,
  type SearchParams,
} from "@/features/catalog/filters";
import { errorMessage } from "@/lib/api/errors";
import { plural } from "@/lib/format";

/**
 * Título y canonical según el oficio y la localidad (las combinaciones útiles para buscadores). La
 * página, "disponible ahora" y el barrio no generan URLs canónicas propias.
 */
export async function generateMetadata({ searchParams }: PageProps<"/profesionales">): Promise<Metadata> {
  const filters = parseCatalogFilters(await searchParams);
  const [professions, localities] = await Promise.all([getProfessions(), getLocalities()]).catch(() => [[], []] as const);
  const profession = professions.find((p) => p.slug === filters.professionSlug);
  const locality = localities.find((l) => l.id === filters.localityId);
  const what = profession ? profession.name : "Profesionales de oficios";
  const where = locality ? ` en ${locality.name}` : "";
  return {
    title: `${what}${where}`,
    description: `${what}${where} con identidad verificada. Compará perfiles y reseñas, mirá quién está disponible y pedí presupuesto.`,
    alternates: {
      canonical: catalogHref({ professionSlug: profession?.slug ?? null, localityId: locality?.id ?? null }),
    },
  };
}

export default function CatalogPage({ searchParams }: PageProps<"/profesionales">) {
  return (
    <>
      <PageHeader
        photo={scenes.pasillo}
        title="Encontrá al profesional indicado"
        description="Todos tienen la identidad verificada por nuestro equipo. Filtrá por oficio y zona, o mirá quién está disponible ahora."
      />
      <div className="container-page flex flex-col gap-6 py-8 sm:py-10">
        <Suspense fallback={<FiltersSkeleton />}>
          <Filters searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<ResultsSkeleton />}>
          <Results searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Filters({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = parseCatalogFilters(await searchParams);
  const data = await Promise.all([getProfessions(), getLocalities(), searchCatalog(filters)]).catch(() => null);
  if (!data) return null; // Los resultados ya muestran el error.
  const [professions, localities, page] = data;
  // Nombre del barrio filtrado: sale de las zonas de los resultados (misma consulta, en caché).
  const neighborhoodName = filters.neighborhoodId
    ? (page.data
        .flatMap((item) => item.serviceAreas)
        .find((area) => area.neighborhoodId === filters.neighborhoodId)?.neighborhoodName ?? null)
    : null;
  return (
    <CatalogFiltersBar
      // Vuelve a montar con los filtros de la URL (atrás/adelante del navegador).
      key={JSON.stringify(filters)}
      filters={filters}
      neighborhoodName={neighborhoodName}
      professions={professions}
      localities={localities}
    />
  );
}

async function Results({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = parseCatalogFilters(await searchParams);
  const result = await Promise.all([searchCatalog(filters), getProfessions()]).then(
    (value) => ({ ok: true as const, value }),
    (error: unknown) => ({ ok: false as const, error }),
  );
  if (!result.ok) {
    return (
      <Alert tone="danger" title="No pudimos cargar los profesionales">
        <p>{errorMessage(result.error)}</p>
        <a href={catalogHref(filters)} className="mt-2 inline-block font-semibold underline underline-offset-4">
          Reintentar
        </a>
      </Alert>
    );
  }
  const [page, professions] = result.value;

  const pages = totalPages(page.total, page.limit);
  // El navegador repite la búsqueda para registrar las apariciones (métricas; ver ViewBeacon).
  const beacon = <ViewBeacon path="/catalog/professionals" query={toBackendQuery(filters, professions)} />;

  if (page.data.length === 0) {
    return (
      <>
        {beacon}
        {hasActiveFilters(filters) ? (
          <EmptyState
            icon={SearchX}
            title="No encontramos profesionales con estos filtros"
            description="Probá con otra zona, otro oficio o sin el filtro de disponibilidad."
            action={
              <ButtonLink href="/profesionales" variant="secondary">
                Ver todos los profesionales
              </ButtonLink>
            }
          />
        ) : (
          <EmptyState
            icon={Users}
            title="Todavía no hay profesionales publicados"
            description="Estamos sumando profesionales verificados. Volvé a mirar en unos días."
          />
        )}
      </>
    );
  }

  return (
    <section aria-labelledby="resultados" className="flex flex-col gap-6">
      {beacon}
      <h2 id="resultados" className="text-sm font-medium text-muted-strong" aria-live="polite">
        {plural(page.total, "profesional encontrado", "profesionales encontrados")}
      </h2>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {page.data.map((item, index) => (
          <li key={item.slug} data-reveal style={revealDelay(index % 3, 80)}>
            <ProfessionalCard item={item} preload={index === 0} />
          </li>
        ))}
      </ul>
      <Pagination
        page={page.page}
        total={pages}
        hrefFor={(target) => catalogHref({ ...filters, page: target }) as Route}
      />
    </section>
  );
}

function FiltersSkeleton() {
  return <Skeleton className="h-11 w-full lg:h-24" />;
}

function ResultsSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Cargando profesionales">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-line bg-surface">
          <Skeleton className="aspect-4/3 w-full rounded-none" />
          <div className="flex flex-col gap-3 p-5">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
