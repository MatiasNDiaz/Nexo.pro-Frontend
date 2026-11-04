import { MessagesSquare, SearchX } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Pagination } from "@/components/catalog/pagination";
import { ForumFiltersBar } from "@/components/forum/forum-filters";
import { ForumPostCard } from "@/components/forum/forum-post-card";
import { ParticipateCta } from "@/components/forum/participate-cta";
import { PageHeader } from "@/components/layout/page-header";
import { revealDelay } from "@/components/motion/reveal";
import { Alert, EmptyState, Skeleton } from "@/components/ui/feedback";
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
        eyebrow="Comunidad"
        title="Foro"
        description="Preguntas sobre arreglos y pedidos de clientes que buscan un profesional en su zona."
      />
      <div className="container-page flex flex-col gap-6 py-8 sm:py-10">
        <ParticipateCta returnTo="/foro" text="Ingresá para hacer una pregunta o publicar lo que necesitás." />
        <Suspense fallback={<Skeleton className="h-28 w-full rounded-2xl" />}>
          <Controls searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<ResultsSkeleton />}>
          <Results searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

const tabs: { label: string; type: ForumFilters["type"] }[] = [
  { label: "Todas", type: null },
  { label: "Preguntas", type: "QUESTION" },
  { label: "Busco profesional", type: "PROFESSIONAL_WANTED" },
];

async function Controls({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = parseForumFilters(await searchParams);
  const lists = await Promise.all([getProfessions(), getLocalities()]).catch(() => null);
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card">
      <nav aria-label="Tipo de publicación" className="-mx-1 overflow-x-auto">
        <ul className="flex gap-1 px-1">
          {tabs.map((tab) => {
            const active = filters.type === tab.type;
            return (
              <li key={tab.label}>
                <Link
                  href={forumHref({ ...filters, type: tab.type, page: 1 }) as Route}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold whitespace-nowrap transition-colors",
                    active ? "bg-brand-700 text-white" : "text-brand-800 hover:bg-brand-50",
                  )}
                >
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
      <ul className="grid gap-4 lg:grid-cols-2">
        {page.data.map((post, index) => (
          <li key={post.id} data-reveal style={revealDelay(index % 2, 80)} className="flex">
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
    <div className="grid gap-4 lg:grid-cols-2" aria-busy="true" aria-label="Cargando publicaciones">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-52 w-full rounded-2xl" />
      ))}
    </div>
  );
}
