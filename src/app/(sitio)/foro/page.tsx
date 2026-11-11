import { Hammer, HelpCircle, LayoutList, MessagesSquare, SearchX, type LucideIcon } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Pagination } from "@/components/catalog/pagination";
import { ForumFiltersBar } from "@/components/forum/forum-filters";
import { ForumGuide } from "@/components/forum/forum-guide";
import { ForumPostCard } from "@/components/forum/forum-post-card";
import { ParticipateCta } from "@/components/forum/participate-cta";
import { PageHeader } from "@/components/layout/page-header";
import { revealDelay } from "@/components/motion/reveal";
import { Alert, EmptyState, Skeleton } from "@/components/ui/feedback";
import { banners } from "@/content/photos";
import { getLocalities, getProfessions } from "@/features/catalog/data";
import { totalPages, type SearchParams } from "@/features/catalog/filters";
import { listForum } from "@/features/forum/data";
import { forumHref, parseForumFilters, type ForumFilters } from "@/features/forum/filters";
import { errorMessage } from "@/lib/api/errors";
import { plural } from "@/lib/format";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Foro",
  description: "Preguntas de la comunidad y pedidos de clientes que buscan un profesional de oficios en su zona.",
  alternates: { canonical: "/foro" },
};

export default function ForumPage({ searchParams }: PageProps<"/foro">) {
  return (
    <>
      <PageHeader
        photo={banners.foro}
        focus="50% 30%"
        title="Foro"
        description="Preguntas sobre arreglos y pedidos de clientes que buscan un profesional en su zona. Contá qué te pasa y te responden otros clientes y profesionales de Córdoba."
        highlights={[
          { icon: HelpCircle, label: "Preguntá gratis" },
          { icon: Hammer, label: "Pedidos con presupuesto" },
          { icon: MessagesSquare, label: "Responden clientes y profesionales" },
        ]}
      />
      {/* La lista a la izquierda; a la derecha (escritorio), publicar y cómo funciona, a la vista al bajar. */}
      {/* Una sola columna lateral: arriba en celular (publicar), a la derecha en escritorio (con la guía). */}
      <div className="container-page grid gap-6 py-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-10">
        <aside className="flex flex-col gap-5 self-start lg:sticky lg:top-24 lg:order-2">
          <ParticipateCta returnTo="/foro" text="Ingresá para hacer una pregunta o publicar lo que necesitás." showPublish stacked />
          <div className="hidden lg:block">
            <ForumGuide />
          </div>
        </aside>
        <div className="flex min-w-0 flex-col gap-6 lg:order-1">
          <Suspense fallback={<Skeleton className="h-28 w-full rounded-2xl" />}>
            <Controls searchParams={searchParams} />
          </Suspense>
          {/* Alto mínimo: si un filtro trae menos publicaciones, la página no se acorta y la pantalla no salta. */}
          <div className="min-h-[70vh]">
            <Suspense fallback={<ResultsSkeleton />}>
              <Results searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}

const tabs: { label: string; type: ForumFilters["type"]; icon: LucideIcon }[] = [
  { label: "Todas", type: null, icon: LayoutList },
  { label: "Preguntas", type: "QUESTION", icon: HelpCircle },
  { label: "Busco profesional", type: "PROFESSIONAL_WANTED", icon: Hammer },
];

async function Controls({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = parseForumFilters(await searchParams);
  const lists = await Promise.all([getProfessions(), getLocalities()]).catch(() => null);
  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-line bg-surface p-4 shadow-card sm:p-5">
      {/* Pestañas como control segmentado: la elegida se levanta sobre el riel. */}
      <nav aria-label="Tipo de publicación" className="-mx-1 overflow-x-auto px-1">
        <ul className="inline-flex gap-1 rounded-2xl bg-canvas p-1 ring-1 ring-line">
          {tabs.map((tab) => {
            const active = filters.type === tab.type;
            return (
              <li key={tab.label}>
                <Link
                  href={forumHref({ ...filters, type: tab.type, page: 1 }) as Route}
                  // Cambia la lista sin mover la pantalla (sin volver arriba de todo).
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold whitespace-nowrap transition-[background-color,color,box-shadow] duration-200 sm:px-4",
                    active ? "bg-surface text-brand-900 shadow-card ring-1 ring-line" : "text-muted-strong hover:text-brand-800",
                  )}
                >
                  {/* En celular sin ícono: así las tres pestañas entran enteras. */}
                  <tab.icon className={cn("hidden size-4 sm:block", active ? "text-brand-700" : "")} aria-hidden="true" />
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {lists && <ForumFiltersBar key={JSON.stringify(filters)} filters={filters} professions={lists[0]} localities={lists[1]} />}
    </div>
  );
}

async function Results({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = parseForumFilters(await searchParams);
  const result = await listForum(filters).then(
    (value) => ({ ok: true as const, value }),
    (error: unknown) => ({ ok: false as const, error }),
  );
  if (!result.ok) {
    return (
      <Alert tone="danger" title="No pudimos cargar el foro">
        <p>{errorMessage(result.error)}</p>
        <a href={forumHref(filters)} className="mt-2 inline-block font-semibold underline underline-offset-4">
          Reintentar
        </a>
      </Alert>
    );
  }
  const page = result.value;
  const filtered = !!(filters.type || filters.professionSlug || filters.localityId || filters.resolved !== null);

  if (page.data.length === 0) {
    return filtered ? (
      <EmptyState
        icon={SearchX}
        title="No hay publicaciones con estos filtros"
        description="Probá con otro oficio, otra zona u otro estado."
      />
    ) : (
      <EmptyState icon={MessagesSquare} title="Todavía no hay publicaciones" description="Sé la primera persona en preguntar." />
    );
  }

  return (
    <section aria-labelledby="publicaciones" className="flex flex-col gap-5">
      <h2 id="publicaciones" className="text-sm font-medium text-muted-strong">
        {plural(page.total, "publicación", "publicaciones")}
      </h2>
      <ul className="flex flex-col gap-4">
        {page.data.map((post, index) => (
          <li key={post.id} data-reveal style={revealDelay(index, 70, 280)} className="flex">
            <ForumPostCard post={post} />
          </li>
        ))}
      </ul>
      <Pagination
        page={page.page}
        total={totalPages(page.total, page.limit)}
        hrefFor={(target) => forumHref({ ...filters, page: target })}
      />
    </section>
  );
}

function ResultsSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando publicaciones">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-48 w-full rounded-3xl" />
      ))}
    </div>
  );
}
