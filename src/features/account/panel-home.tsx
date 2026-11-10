"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Bell, Briefcase, Crown, FileText, Hammer, Heart, Inbox, MessagesSquare, Search, Star } from "lucide-react";
import Link from "next/link";
import { AdminDashboard } from "@/features/admin/admin-dashboard";
import { ShineLink } from "@/components/home/shine-link";
import { revealDelay } from "@/components/motion/reveal";
import { WordsUp } from "@/components/motion/words-up";
import { EmptyState } from "@/components/ui/feedback";
import { totalUnread } from "@/features/chat/cache";
import { useConversations } from "@/features/chat/inbox";
import { useFavorites } from "@/features/favorites/favorite-button";
import { useUnreadNotifications } from "@/features/notifications/queries";
import { contractKeys, listContracts, listRequests, OPEN_CONTRACT_STATUSES, requestKeys } from "@/features/requests/api";
import { getMyProfile, getSubscription, proKeys } from "@/features/pro-profile/api";
import { attentionOptions, listReceived, listReceivedReviews, workKeys } from "@/features/pro-work/api";
import { listMyReviews, reviewKeys } from "@/features/reviews/api";
import { cn } from "@/lib/cn";
import { AccountStatus, AccountSummary } from "./account-status";
import { Tile, type TileProps } from "./dashboard-tile";
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
      ) : user.role === "PROFESSIONAL" ? (
        <ProfessionalDashboard active={user.status === "ACTIVE"} />
      ) : user.role === "ADMIN" ? (
        <AdminDashboard />
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

/** Tablero del profesional: lo que pide atención hoy y su estado, a un toque de cambiarlo. */
function ProfessionalDashboard({ active }: { active: boolean }) {
  const conversations = useConversations();
  const received = useQuery({ queryKey: workKeys.received, queryFn: listReceived, enabled: active });
  const contracts = useQuery({ queryKey: contractKeys.all, queryFn: listContracts, enabled: active });
  const reviews = useQuery({ queryKey: workKeys.reviewsReceived, queryFn: listReceivedReviews, enabled: active });
  const subscription = useQuery({ queryKey: proKeys.subscription, queryFn: getSubscription });
  const profile = useQuery({ queryKey: proKeys.me, queryFn: getMyProfile });
  const notifications = useUnreadNotifications(true);

  const fresh = received.data?.filter((r) => r.status === "OPEN" && r.targets[0]?.status === "PENDING").length;
  const working = contracts.data?.filter((c) => OPEN_CONTRACT_STATUSES.includes(c.status)).length;
  const unread = totalUnread(conversations.data);
  const sub = subscription.data;
  const days = sub?.status === "TRIAL" ? sub.trialDaysLeft : sub?.periodDaysLeft;
  const attention = profile.data?.attention.effective;

  const tiles: TileProps[] = [
    ...(active
      ? ([
          { href: "/panel/solicitudes", icon: Inbox, title: "Pedidos nuevos", count: fresh, detail: "sin responder", highlight: (fresh ?? 0) > 0, loading: received.isPending },
          { href: "/panel/mensajes", icon: MessagesSquare, title: "Mensajes", count: unread, detail: "sin leer", highlight: unread > 0, loading: conversations.isPending },
          { href: "/panel/trabajos", icon: Briefcase, title: "Trabajos", count: working, detail: "en curso", loading: contracts.isPending },
          { href: "/panel/resenas", icon: Star, title: "Reseñas", count: reviews.data?.length, detail: "recibidas", loading: reviews.isPending },
        ] satisfies TileProps[])
      : []),
    { href: "/panel/plan", icon: Crown, title: sub?.status === "TRIAL" ? "Días de prueba" : "Días de plan", count: days ?? 0, detail: sub?.plan?.name ?? "Sin plan", highlight: !!sub && (days ?? 0) <= 5, loading: subscription.isPending },
    { href: "/panel/notificaciones", icon: Bell, title: "Notificaciones", count: notifications.data, detail: "sin leer", highlight: (notifications.data ?? 0) > 0, loading: notifications.isPending },
  ];

  return (
    <>
      {attention && (
        <section data-reveal aria-label="Tu estado" className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-line bg-surface p-5 shadow-card">
          <span className="flex items-center gap-3">
            <span className={cn("size-3 rounded-full", attention === "AVAILABLE" ? "animate-pulse bg-success-600" : attention === "WORKING" ? "bg-amber-500" : "bg-line-strong")} aria-hidden="true" />
            <span className="flex flex-col">
              <span className="text-sm text-muted-strong">Los clientes te ven</span>
              <span className="font-display text-2xl font-bold text-ink">{attentionOptions.find((o) => o.value === attention)?.label}</span>
            </span>
          </span>
          <Link href="/panel/agenda" className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50">
            Cambiar estado
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      )}
      <ul className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 sm:gap-4 xl:grid-cols-[repeat(3,minmax(0,1fr))]">
        {tiles.map((tile, index) => (
          <li key={tile.href} data-reveal style={revealDelay(index % 3, 70)}>
            <Tile {...tile} />
          </li>
        ))}
      </ul>
      {profile.data && (
        <section
          data-reveal
          aria-labelledby="tu-pagina"
          className="relative isolate flex flex-col items-start gap-5 overflow-hidden rounded-3xl bg-brand-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8"
        >
          <span aria-hidden="true" className="absolute -top-24 -right-16 -z-1 size-72 rounded-full bg-[radial-gradient(closest-side,rgb(244_163_64/0.3),transparent)]" />
          <div className="flex flex-col gap-1.5">
            <h2 id="tu-pagina" className="font-display text-2xl font-bold sm:text-3xl">
              Tu página es tu vidriera
            </h2>
            <p className="text-brand-200">Fotos de trabajos, descripción y horarios completos te traen más pedidos.</p>
          </div>
          <ShineLink href="/panel/perfil" className="shrink-0">
            Mejorar mi perfil
          </ShineLink>
        </section>
      )}
    </>
  );
}
