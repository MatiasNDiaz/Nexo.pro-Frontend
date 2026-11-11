"use client";

import { keepPreviousData, useQuery, type UseQueryResult } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Hammer, HelpCircle, LayoutList, MapPin, MessagesSquare, UserX, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ForumAvatar } from "@/components/forum/forum-author";
import { ForumPostCard } from "@/components/forum/forum-post-card";
import { Alert, EmptyState, Skeleton } from "@/components/ui/feedback";
import type { ForumPage } from "@/features/forum/data";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { formatMonthYear, plural } from "@/lib/format";
import { CUSTOMER_POSTS_PAGE_SIZE, customerKeys, getCustomer, listCustomerPosts, type CustomerCard, type PostType } from "./api";
import { lastPostLabel } from "./customers-page";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const tabs: { label: string; type: PostType | null; icon: LucideIcon }[] = [
  { label: "Todo", type: null, icon: LayoutList },
  { label: "Busca profesional", type: "PROFESSIONAL_WANTED", icon: Hammer },
  { label: "Preguntas", type: "QUESTION", icon: HelpCircle },
];

/**
 * Ficha de un cliente (ADR 0037 del backend): quién es y todo lo que preguntó y pidió en el foro, lo
 * más nuevo primero. Cada publicación abre su hilo del foro, donde el profesional responde.
 */
export function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const valid = UUID.test(id);
  const [type, setType] = useState<PostType | null>(null);
  const [page, setPage] = useState(1);
  const card = useQuery({
    queryKey: customerKeys.card(id),
    queryFn: () => getCustomer(id),
    enabled: valid,
    retry: (count, error) => !isApiError(error) && count < 2,
  });
  const posts = useQuery({
    queryKey: customerKeys.posts(id, type, page),
    queryFn: () => listCustomerPosts(id, type, page),
    enabled: valid && card.isSuccess,
    placeholderData: keepPreviousData,
  });

  const back = (
    <Link href="/panel/clientes" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-700 hover:underline">
      <ArrowLeft className="size-4" aria-hidden="true" />
      Clientes
    </Link>
  );

  if (!valid || (card.isError && isApiError(card.error, "CUSTOMER_NOT_FOUND"))) {
    return (
      <div className="flex flex-col gap-6">
        {back}
        <EmptyState icon={UserX} headingLevel={1} title="Este cliente no está disponible" description="Puede que haya dado de baja su cuenta o que esté suspendida." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {back}
      {card.isPending ? (
        <Skeleton className="h-40 rounded-3xl" />
      ) : card.isError ? (
        <Alert tone="danger" title="No pudimos cargar al cliente">
          {errorMessage(card.error)}
        </Alert>
      ) : (
        <>
          <Header customer={card.data} />
          <section aria-labelledby="publicaciones" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="publicaciones" className="text-xl font-semibold text-brand-900">
                En el foro
              </h2>
              {card.data.postCount > 0 && (
                <div role="group" aria-label="Tipo de publicación" className="inline-flex gap-1 rounded-2xl bg-canvas p-1 ring-1 ring-line">
                  {tabs.map((tab) => {
                    const active = type === tab.type;
                    return (
                      <button
                        key={tab.label}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          setType(tab.type);
                          setPage(1);
                        }}
                        className={cn(
                          "inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold whitespace-nowrap transition-[background-color,color,box-shadow]",
                          active ? "bg-surface text-brand-900 shadow-card ring-1 ring-line" : "text-muted-strong hover:text-brand-800",
                        )}
                      >
                        <tab.icon className="hidden size-4 sm:block" aria-hidden="true" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <Posts customer={card.data} query={posts} type={type} page={page} onPage={setPage} />
          </section>
        </>
      )}
    </div>
  );
}

function Header({ customer }: { customer: CustomerCard }) {
  const name = `${customer.firstName} ${customer.lastName}`;
  return (
    <header className="flex flex-col gap-5 rounded-3xl border border-line bg-surface p-5 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-7">
      <div className="flex items-center gap-4">
        <ForumAvatar name={name} avatarUrl={customer.avatarUrl} size="lg" />
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-3xl font-bold wrap-break-word text-brand-900">{name}</h1>
          <p className="flex items-center gap-1.5 text-sm text-muted-strong">
            <CalendarDays className="size-4" aria-hidden="true" />
            En Repara Ya desde {formatMonthYear(customer.memberSince)}
          </p>
          {customer.localities.length > 0 && (
            <p className="flex items-center gap-1.5 text-sm text-muted-strong">
              <MapPin className="size-4" aria-hidden="true" />
              Publicó en {customer.localities.map((l) => l.name).join(", ")}
            </p>
          )}
        </div>
      </div>
      <dl className="grid grid-cols-3 gap-2 text-center sm:min-w-88">
        <Stat label="Pedidos abiertos" value={customer.openRequestCount} highlight={customer.openRequestCount > 0} />
        <Stat label="Publicaciones" value={customer.postCount} />
        <div className="flex flex-col justify-center rounded-2xl bg-canvas px-2 py-3 ring-1 ring-line">
          <dt className="text-xs text-muted-strong">Última</dt>
          <dd className="font-display text-base font-bold text-ink">{customer.lastPostAt ? lastPostLabel(customer.lastPostAt) : "—"}</dd>
        </div>
      </dl>
    </header>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={cn("flex flex-col justify-center rounded-2xl px-2 py-3", highlight ? "bg-amber-400 text-brand-950" : "bg-canvas ring-1 ring-line")}>
      <dt className={cn("text-xs", highlight ? "font-semibold" : "text-muted-strong")}>{label}</dt>
      <dd className="font-display text-2xl font-bold tabular-nums">{value}</dd>
    </div>
  );
}

function Posts({
  customer,
  query,
  type,
  page,
  onPage,
}: {
  customer: CustomerCard;
  query: UseQueryResult<ForumPage>;
  type: PostType | null;
  page: number;
  onPage: (page: number) => void;
}) {
  if (customer.postCount === 0) {
    return (
      <EmptyState
        icon={MessagesSquare}
        title={`${customer.firstName} todavía no publicó en el foro`}
        description="Cuando haga una pregunta o pida un profesional, lo vas a ver acá."
      />
    );
  }
  if (query.isPending) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando publicaciones">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-44 rounded-3xl" />
        ))}
      </div>
    );
  }
  if (query.isError) {
    return (
      <Alert tone="danger" title="No pudimos cargar sus publicaciones">
        {errorMessage(query.error)}
      </Alert>
    );
  }
  if (query.data.data.length === 0) {
    return <EmptyState icon={MessagesSquare} title={type === "QUESTION" ? "No hizo preguntas" : "No pidió profesionales"} description="Probá con otra pestaña." />;
  }
  const pages = Math.max(1, Math.ceil(query.data.total / CUSTOMER_POSTS_PAGE_SIZE));
  return (
    <div className={cn("flex flex-col gap-4 transition-opacity", query.isPlaceholderData && "opacity-60")}>
      <p className="text-sm font-medium text-muted-strong" aria-live="polite">
        {plural(query.data.total, "publicación", "publicaciones")}
      </p>
      <ul className="flex flex-col gap-4">
        {query.data.data.map((post) => (
          <li key={post.id} className="flex">
            <ForumPostCard post={post} />
          </li>
        ))}
      </ul>
      {pages > 1 && (
        <nav aria-label="Páginas" className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
            className="h-10 rounded-xl px-4 text-sm font-semibold text-brand-800 ring-1 ring-line disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-muted-strong">
            Página {page} de {pages}
          </span>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => onPage(page + 1)}
            className="h-10 rounded-xl px-4 text-sm font-semibold text-brand-800 ring-1 ring-line disabled:opacity-50"
          >
            Siguiente
          </button>
        </nav>
      )}
    </div>
  );
}
