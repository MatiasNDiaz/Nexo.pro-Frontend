"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { WordsUp } from "@/components/motion/words-up";
import { AdminHome } from "@/features/admin/admin-dashboard";
import { totalUnread } from "@/features/chat/cache";
import { useConversations } from "@/features/chat/inbox";
import { useFavorites } from "@/features/favorites/favorite-button";
import { useUnreadNotifications } from "@/features/notifications/queries";
import { getMyProfile, getSubscription, proKeys } from "@/features/pro-profile/api";
import { attentionOptions, listReceived, listReceivedReviews, workKeys } from "@/features/pro-work/api";
import { contractKeys, listContracts, listRequests, OPEN_CONTRACT_STATUSES, requestKeys } from "@/features/requests/api";
import { listMyReviews, reviewKeys } from "@/features/reviews/api";
import type { Me } from "@/features/session/api";
import { cn } from "@/lib/cn";
import { AccountStatus, AccountSummary } from "./account-status";
import { panelGroupsFor, type PanelGroup } from "./panel-nav";
import { QuickAccess, type AccessStatuses } from "./quick-access";
import { useMe } from "./use-me";

/**
 * Inicio del panel (pedido del fundador del 2026-11-11): el saludo, lo que falta para activar la
 * cuenta si corresponde, y los accesos rápidos a todas las secciones del rol, agrupados por tarea,
 * cada uno con lo que se puede hacer ahí y cuántas cosas esperan.
 */
export function PanelHome() {
  const user = useMe();
  const groups = panelGroupsFor(user);
  const active = user.status === "ACTIVE";
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl leading-[1.02] font-bold text-brand-900 sm:text-5xl">
            <WordsUp text={`Hola, ${user.firstName}`} />
          </h1>
          <div className="animate-fade-up [animation-delay:250ms]">
            <AccountSummary user={user} />
          </div>
        </div>
        {user.role === "PROFESSIONAL" && <AttentionNow />}
      </header>
      {!active && (
        <div data-reveal>
          <AccountStatus user={user} />
        </div>
      )}
      {user.role === "ADMIN" ? (
        <AdminHome groups={groups} />
      ) : user.role === "PROFESSIONAL" ? (
        <ProfessionalAccess groups={groups} active={active} />
      ) : (
        <CustomerAccess groups={groups} user={user} />
      )}
    </div>
  );
}

/** Cliente: mensajes, pedidos y trabajos en curso, reseñas por dejar y favoritos. Todo exige la cuenta activa. */
function CustomerAccess({ groups, user }: { groups: PanelGroup[]; user: Me }) {
  const active = user.status === "ACTIVE";
  const conversations = useConversations(active);
  const requests = useQuery({ queryKey: requestKeys.all, queryFn: listRequests, enabled: active });
  const contracts = useQuery({ queryKey: contractKeys.all, queryFn: listContracts, enabled: active });
  const reviews = useQuery({ queryKey: reviewKeys.mine, queryFn: listMyReviews, enabled: active });
  const { query: favorites } = useFavorites();
  const notifications = useUnreadNotifications(true);

  const unread = totalUnread(conversations.data);
  const reviewed = new Set(reviews.data?.map((r) => r.contractId));
  const toReview = contracts.data && reviews.data ? contracts.data.filter((c) => c.status === "COMPLETED" && !reviewed.has(c.id)).length : undefined;

  const statuses: AccessStatuses = {
    "/panel/notificaciones": { count: notifications.data, detail: "sin leer", highlight: true, loading: notifications.isPending },
    ...(active && {
      "/panel/mensajes": { count: unread, detail: "sin leer", highlight: true, loading: conversations.isPending },
      "/panel/pedidos": { count: requests.data?.filter((r) => r.status === "OPEN").length, detail: "abiertos", loading: requests.isPending },
      "/panel/trabajos": { count: contracts.data?.filter((c) => OPEN_CONTRACT_STATUSES.includes(c.status)).length, detail: "en curso", loading: contracts.isPending },
      "/panel/resenas": { count: toReview, detail: "por dejar", highlight: true, loading: toReview === undefined },
      "/panel/favoritos": { count: favorites.data?.length, detail: "guardados", loading: favorites.isPending },
    }),
  };
  return <QuickAccess groups={groups} statuses={statuses} />;
}

/** Profesional: pedidos sin responder, mensajes, trabajos en curso, reseñas y los días de su plan. */
function ProfessionalAccess({ groups, active }: { groups: PanelGroup[]; active: boolean }) {
  const conversations = useConversations(active);
  const received = useQuery({ queryKey: workKeys.received, queryFn: listReceived, enabled: active });
  const contracts = useQuery({ queryKey: contractKeys.all, queryFn: listContracts, enabled: active });
  const reviews = useQuery({ queryKey: workKeys.reviewsReceived, queryFn: listReceivedReviews, enabled: active });
  const subscription = useQuery({ queryKey: proKeys.subscription, queryFn: getSubscription });
  const notifications = useUnreadNotifications(true);

  const sub = subscription.data;
  const days = sub?.status === "TRIAL" ? sub.trialDaysLeft : sub?.periodDaysLeft;
  const statuses: AccessStatuses = {
    "/panel/notificaciones": { count: notifications.data, detail: "sin leer", highlight: true, loading: notifications.isPending },
    ...((subscription.isPending || sub) && {
      "/panel/plan": {
        count: days ?? 0,
        detail: sub?.status === "TRIAL" ? "días de prueba" : "días de plan",
        highlight: (days ?? 0) <= 5,
        loading: subscription.isPending,
      },
    }),
    ...(active && {
      "/panel/solicitudes": {
        count: received.data?.filter((r) => r.status === "OPEN" && r.targets[0]?.status === "PENDING").length,
        detail: "sin responder",
        highlight: true,
        loading: received.isPending,
      },
      "/panel/mensajes": { count: totalUnread(conversations.data), detail: "sin leer", highlight: true, loading: conversations.isPending },
      "/panel/trabajos": { count: contracts.data?.filter((c) => OPEN_CONTRACT_STATUSES.includes(c.status)).length, detail: "en curso", loading: contracts.isPending },
      "/panel/resenas": { count: reviews.data?.length, detail: "recibidas", loading: reviews.isPending },
    }),
  };
  return <QuickAccess groups={groups} statuses={statuses} />;
}

/** Cómo lo ven los clientes ahora, a un toque de cambiarlo. */
function AttentionNow() {
  const profile = useQuery({ queryKey: proKeys.me, queryFn: getMyProfile });
  const attention = profile.data?.attention.effective;
  if (!attention) return null;
  return (
    <section aria-label="Tu estado" className="flex items-center gap-4 self-start rounded-2xl border border-line bg-surface py-3 pr-3 pl-5 shadow-card animate-fade-up xl:self-auto">
      <span className={cn("size-3 shrink-0 rounded-full", attention === "AVAILABLE" ? "animate-pulse bg-success-600" : attention === "WORKING" ? "bg-amber-500" : "bg-line-strong")} aria-hidden="true" />
      <span className="flex flex-col">
        <span className="text-sm text-muted-strong">Los clientes te ven</span>
        <span className="font-display text-xl font-bold text-ink">{attentionOptions.find((o) => o.value === attention)?.label}</span>
      </span>
      <Link href="/panel/agenda" className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50">
        Cambiar
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
