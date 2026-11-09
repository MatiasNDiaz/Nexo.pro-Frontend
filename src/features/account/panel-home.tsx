"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Bell, Briefcase, FileText, Hammer, Heart, MessagesSquare, Search, Star, type LucideIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { ShineLink } from "@/components/home/shine-link";
import { revealDelay } from "@/components/motion/reveal";
import { WordsUp } from "@/components/motion/words-up";
import { EmptyState } from "@/components/ui/feedback";
import { totalUnread } from "@/features/chat/cache";
import { useConversations } from "@/features/chat/inbox";
import { useFavorites } from "@/features/favorites/favorite-button";
import { useUnreadNotifications } from "@/features/notifications/queries";
import { contractKeys, listContracts, listRequests, OPEN_CONTRACT_STATUSES, requestKeys } from "@/features/requests/api";
import { listMyReviews, reviewKeys } from "@/features/reviews/api";
import { cn } from "@/lib/cn";
import { AccountStatus, AccountSummary } from "./account-status";
import { useMe } from "./use-me";

/** Inicio del panel: saludo, estado de la cuenta y un tablero con lo que importa hoy. El del profesional llega en la etapa 6. */
export function PanelHome() {
  const user = useMe();
  const customerActive = user.role === "CUSTOMER" && user.status === "ACTIVE";
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-4xl leading-[1.02] font-bold text-brand-900 sm:text-5xl">
          <WordsUp text={`Hola, ${user.firstName}`} />
        </h1>
        <div className="animate-fade-up [animation-delay:250ms]">
          <AccountSummary user={user} />
        </div>
      </header>
      <div data-reveal>
        <AccountStatus user={user} />
      </div>
      {customerActive ? (
        <CustomerDashboard />
      ) : (
        <div data-reveal>
          <EmptyState
            icon={Hammer}
            title="Tus pedidos y conversaciones llegan pronto"
            description="Muy pronto vas a ver acá tus pedidos, conversaciones y trabajos."
          />
        </div>
      )}
    </div>
  );
}

function CustomerDashboard() {
  const conversations = useConversations();
  const requests = useQuery({ queryKey: requestKeys.all, queryFn: listRequests });
  const contracts = useQuery({ queryKey: contractKeys.all, queryFn: listContracts });
  const reviews = useQuery({ queryKey: reviewKeys.mine, queryFn: listMyReviews });
  const { query: favorites } = useFavorites();
  const notifications = useUnreadNotifications(true);

  const unread = totalUnread(conversations.data);
  const openRequests = requests.data?.filter((r) => r.status === "OPEN").length;
  const activeContracts = contracts.data?.filter((c) => OPEN_CONTRACT_STATUSES.includes(c.status)).length;
  const reviewed = new Set(reviews.data?.map((r) => r.contractId));
  const toReview = contracts.data && reviews.data ? contracts.data.filter((c) => c.status === "COMPLETED" && !reviewed.has(c.id)).length : undefined;

  const tiles: TileProps[] = [
    { href: "/panel/mensajes", icon: MessagesSquare, title: "Mensajes", count: unread, detail: "sin leer", highlight: unread > 0, loading: conversations.isPending },
    { href: "/panel/pedidos", icon: FileText, title: "Pedidos", count: openRequests, detail: "esperando presupuesto", loading: requests.isPending },
    { href: "/panel/trabajos", icon: Briefcase, title: "Trabajos", count: activeContracts, detail: "en curso", loading: contracts.isPending },
    { href: "/panel/resenas", icon: Star, title: "Reseñas", count: toReview, detail: "por dejar", highlight: (toReview ?? 0) > 0, loading: toReview === undefined },
    { href: "/panel/favoritos", icon: Heart, title: "Favoritos", count: favorites.data?.length, detail: "guardados", loading: favorites.isPending },
    { href: "/panel/notificaciones", icon: Bell, title: "Notificaciones", count: notifications.data, detail: "sin leer", highlight: (notifications.data ?? 0) > 0, loading: notifications.isPending },
  ];

  return (
    <>
      <ul className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 sm:gap-4 xl:grid-cols-[repeat(3,minmax(0,1fr))]">
        {tiles.map((tile, index) => (
          <li key={tile.href} data-reveal style={revealDelay(index % 3, 70)}>
            <Tile {...tile} />
          </li>
        ))}
      </ul>

      <section
        data-reveal
        aria-labelledby="otro-arreglo"
        className="relative isolate flex flex-col items-start gap-5 overflow-hidden rounded-3xl bg-brand-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8"
      >
        <span aria-hidden="true" className="absolute -top-24 -right-16 -z-1 size-72 rounded-full bg-[radial-gradient(closest-side,rgb(59_130_246/0.35),transparent)]" />
        <div className="flex flex-col gap-1.5">
          <h2 id="otro-arreglo" className="font-display text-2xl font-bold sm:text-3xl">
            ¿Tenés otro arreglo?
          </h2>
          <p className="text-brand-200">Buscá por oficio y zona, y pedí presupuesto sin compromiso.</p>
        </div>
        <ShineLink href="/profesionales" className="shrink-0">
          <Search className="size-5" aria-hidden="true" />
          Buscar un profesional
        </ShineLink>
      </section>
    </>
  );
}

interface TileProps {
  href: Route;
  icon: LucideIcon;
  title: string;
  count: number | undefined;
  detail: string;
  highlight?: boolean;
  loading?: boolean;
}

/** Acceso del tablero: el número grande, qué cuenta y el ícono; se levanta al pasar el mouse. */
function Tile({ href, icon: Icon, title, count, detail, highlight = false, loading = false }: TileProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full flex-col gap-4 rounded-3xl border p-4 transition-[border-color,box-shadow,translate] duration-300 ease-out-soft hover:-translate-y-1 hover:shadow-raised sm:p-5",
        highlight ? "border-amber-400/60 bg-amber-50" : "border-line bg-surface shadow-card hover:border-brand-200",
      )}
    >
      <span className="flex items-center justify-between">
        <span
          className={cn(
            "grid size-11 place-items-center rounded-2xl transition-transform duration-300 ease-out-soft group-hover:scale-110 group-hover:-rotate-6",
            highlight ? "bg-amber-400 text-brand-900" : "bg-brand-50 text-brand-700",
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <ArrowUpRight
          className="size-5 text-muted transition-[translate,color] duration-200 ease-out-soft group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-700"
          aria-hidden="true"
        />
      </span>
      <span className="flex flex-col">
        <span className="font-display text-4xl leading-none font-bold text-brand-900 font-stretch-[112%]">
          {loading ? <span className="inline-block h-9 w-10 animate-pulse rounded-lg bg-brand-100 align-middle" /> : (count ?? 0)}
        </span>
        <span className="mt-2 font-semibold text-ink">{title}</span>
        <span className="text-sm text-muted-strong">{detail}</span>
      </span>
    </Link>
  );
}
