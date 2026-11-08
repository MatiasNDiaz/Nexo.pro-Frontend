"use client";

import {
  Briefcase,
  FileText,
  Fingerprint,
  LayoutDashboard,
  MessagesSquare,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { totalUnread } from "@/features/chat/cache";
import { useConversations } from "@/features/chat/inbox";
import type { Me } from "@/features/session/api";
import { RequireSession, SessionSkeleton } from "@/features/session/require-session";
import { cn } from "@/lib/cn";

interface PanelLink {
  href: Route;
  label: string;
  icon: LucideIcon;
}

/**
 * Secciones del panel según el rol y el estado de la cuenta (solo experiencia: el backend autoriza).
 * - Suspendida o bloqueada: el backend solo le permite ver su cuenta, sus dispositivos y apelar.
 * - Admin: datos personales y verificación son de clientes y profesionales; su panel es otro.
 */
export function panelLinksFor(user: Me): PanelLink[] {
  const home: PanelLink = { href: "/panel", label: "Inicio", icon: LayoutDashboard };
  const security: PanelLink = { href: "/panel/seguridad", label: "Seguridad", icon: ShieldCheck };
  if (user.status === "SUSPENDED" || user.status === "BANNED" || user.role === "ADMIN") return [home, security];
  // Chat, pedidos y trabajos exigen la cuenta activa. Los del profesional llegan en la etapa 6.
  const customerWork: PanelLink[] =
    user.role === "CUSTOMER" && user.status === "ACTIVE"
      ? [
          { href: "/panel/mensajes", label: "Mensajes", icon: MessagesSquare },
          { href: "/panel/pedidos", label: "Pedidos", icon: FileText },
          { href: "/panel/trabajos", label: "Trabajos", icon: Briefcase },
        ]
      : [];
  return [
    home,
    ...customerWork,
    { href: "/panel/cuenta", label: "Mi cuenta", icon: UserRound },
    { href: "/panel/verificacion", label: "Verificación", icon: Fingerprint },
    security,
  ];
}

export function PanelShell({ children }: { children: ReactNode }) {
  // Suspense: RequireSession lee la URL, que en las rutas con parámetros ([id]) recién existe al pedirla.
  return (
    <Suspense fallback={<SessionSkeleton />}>
      <RequireSession>{(user) => <PanelFrame user={user}>{children}</PanelFrame>}</RequireSession>
    </Suspense>
  );
}

function PanelFrame({ user, children }: { user: Me; children: ReactNode }) {
  const pathname = usePathname();
  const links = panelLinksFor(user);
  return (
    // minmax(0, …): la columna no se estira con el menú horizontal (que se desplaza dentro de su espacio).
    <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-6 py-6 sm:py-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10">
      <nav aria-label="Panel" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
          {links.map((link) => {
            const active = link.href === "/panel" ? pathname === "/panel" : pathname.startsWith(link.href);
            return (
              <li key={link.href} className="shrink-0">
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-11 items-center gap-2.5 rounded-xl px-3.5 text-sm font-semibold whitespace-nowrap transition-colors",
                    active ? "bg-brand-700 text-white shadow-xs" : "text-brand-800 hover:bg-brand-50",
                  )}
                >
                  <link.icon className="size-4" aria-hidden="true" />
                  {link.label}
                  {link.href === "/panel/mensajes" && <UnreadCount />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Mensajes sin leer, sumados de la lista de chats (la mantiene al día el tiempo real). */
function UnreadCount() {
  const conversations = useConversations();
  const unread = totalUnread(conversations.data);
  if (unread === 0) return null;
  return (
    <span className="grid min-w-5 place-items-center rounded-full bg-amber-400 px-1.5 text-xs font-bold text-brand-900">
      {unread > 99 ? "99+" : unread}
      <span className="sr-only"> sin leer</span>
    </span>
  );
}
