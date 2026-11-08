"use client";

import { Briefcase, ChevronRight, FileText, Hammer, MessagesSquare, type LucideIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui/feedback";
import { totalUnread } from "@/features/chat/cache";
import { useConversations } from "@/features/chat/inbox";
import { plural } from "@/lib/format";
import { AccountStatus, AccountSummary } from "./account-status";
import { useMe } from "./use-me";

/** Inicio del panel. El trabajo del profesional llega en la etapa 6. */
export function PanelHome() {
  const user = useMe();
  const customerActive = user.role === "CUSTOMER" && user.status === "ACTIVE";
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3 animate-fade-up">
        <h1 className="text-3xl font-bold text-brand-900 sm:text-4xl">Hola, {user.firstName}</h1>
        <AccountSummary user={user} />
      </header>
      <div data-reveal>
        <AccountStatus user={user} />
      </div>
      <div data-reveal>
        {customerActive ? (
          <CustomerShortcuts />
        ) : (
          <EmptyState
            icon={Hammer}
            title="Tus pedidos y conversaciones llegan pronto"
            description="Muy pronto vas a ver acá tus pedidos, conversaciones y trabajos."
          />
        )}
      </div>
    </div>
  );
}

function CustomerShortcuts() {
  const conversations = useConversations();
  const unread = totalUnread(conversations.data);
  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      <Shortcut
        href="/panel/mensajes"
        icon={MessagesSquare}
        title="Mensajes"
        detail={unread > 0 ? `${plural(unread, "mensaje sin leer", "mensajes sin leer")}` : "Tus conversaciones con profesionales"}
        highlight={unread > 0}
      />
      <Shortcut href="/panel/pedidos" icon={FileText} title="Pedidos" detail="Presupuestos que pediste" />
      <Shortcut href="/panel/trabajos" icon={Briefcase} title="Trabajos" detail="Los profesionales que elegiste" />
    </ul>
  );
}

function Shortcut({
  href,
  icon: Icon,
  title,
  detail,
  highlight = false,
}: {
  href: Route;
  icon: LucideIcon;
  title: string;
  detail: string;
  highlight?: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex h-full items-center gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card transition-colors hover:border-brand-200"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-semibold text-ink">{title}</span>
          <span className={highlight ? "text-sm font-semibold text-amber-800" : "text-sm text-muted"}>{detail}</span>
        </span>
        <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden="true" />
      </Link>
    </li>
  );
}
