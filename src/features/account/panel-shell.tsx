"use client";

import {
  Bell,
  Briefcase,
  FileText,
  Fingerprint,
  Flag,
  Gavel,
  Heart,
  LayoutDashboard,
  LifeBuoy,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { RemoteImage } from "@/components/catalog/remote-image";
import { totalUnread } from "@/features/chat/cache";
import { useConversations } from "@/features/chat/inbox";
import { useUnreadNotifications } from "@/features/notifications/queries";
import type { Me } from "@/features/session/api";
import { RequireSession, SessionSkeleton } from "@/features/session/require-session";
import { cn } from "@/lib/cn";

type Counter = "messages" | "notifications";

interface PanelLink {
  href: Route;
  label: string;
  icon: LucideIcon;
  counter?: Counter;
}

interface PanelGroup {
  label: string;
  links: PanelLink[];
}

const roleLabel: Record<Me["role"], string> = { CUSTOMER: "Cliente", PROFESSIONAL: "Profesional", ADMIN: "Administración" };

/**
 * Secciones del panel según el rol y el estado de la cuenta (solo experiencia: el backend autoriza).
 * - Suspendida o bloqueada: el backend solo le permite ver su cuenta, sus dispositivos y apelar.
 * - Admin: datos personales y verificación son de clientes y profesionales; su panel es otro.
 * - Notificaciones: cuenta activa o por verificar (como el backend).
 */
export function panelGroupsFor(user: Me): PanelGroup[] {
  const home: PanelLink = { href: "/panel", label: "Inicio", icon: LayoutDashboard };
  const security: PanelLink = { href: "/panel/seguridad", label: "Seguridad", icon: ShieldCheck };
  const moderation: PanelLink = { href: "/panel/moderacion", label: "Sanciones", icon: Gavel };
  // Con la cuenta suspendida o bloqueada, el backend permite ver las sanciones y apelar.
  if (user.status === "SUSPENDED" || user.status === "BANNED") return [{ label: "Tu cuenta", links: [home, moderation, security] }];

  const notifications: PanelLink = { href: "/panel/notificaciones", label: "Notificaciones", icon: Bell, counter: "notifications" };
  if (user.role === "ADMIN") return [{ label: "Tu cuenta", links: [home, notifications, security] }];

  // Chat, pedidos, trabajos, favoritos y reseñas exigen la cuenta activa. Los del profesional llegan en la etapa 6.
  const activity: PanelLink[] =
    user.role === "CUSTOMER" && user.status === "ACTIVE"
      ? [
          { href: "/panel/mensajes", label: "Mensajes", icon: MessagesSquare, counter: "messages" },
          { href: "/panel/pedidos", label: "Pedidos", icon: FileText },
          { href: "/panel/trabajos", label: "Trabajos", icon: Briefcase },
          { href: "/panel/favoritos", label: "Favoritos", icon: Heart },
          { href: "/panel/resenas", label: "Mis reseñas", icon: Star },
        ]
      : [];
  // Soporte, reportes y opinión exigen la cuenta activa; las sanciones se ven también por verificar.
  const help: PanelLink[] =
    user.status === "ACTIVE"
      ? [
          { href: "/panel/soporte", label: "Soporte", icon: LifeBuoy },
          { href: "/panel/reportes", label: "Mis reportes", icon: Flag },
          moderation,
          { href: "/panel/opinion", label: "Tu opinión", icon: Sparkles },
        ]
      : [moderation];
  return [
    { label: "Tu actividad", links: [home, ...activity, notifications] },
    { label: "Ayuda", links: help },
    {
      label: "Tu cuenta",
      links: [
        { href: "/panel/cuenta", label: "Mi cuenta", icon: UserRound },
        { href: "/panel/verificacion", label: "Verificación", icon: Fingerprint },
        security,
      ],
    },
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

/**
 * Marco del panel ("modo trabajo"): barra lateral azul noche con la persona arriba y los accesos
 * agrupados; en celular, una fila que se desplaza. El contenido va a la derecha sobre el fondo claro.
 */
function PanelFrame({ user, children }: { user: Me; children: ReactNode }) {
  const pathname = usePathname();
  const groups = panelGroupsFor(user);
  const isActive = (href: string) => (href === "/panel" ? pathname === "/panel" : pathname.startsWith(href));

  return (
    // minmax(0, …): la columna no se estira con el menú horizontal (que se desplaza dentro de su espacio).
    <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-6 py-6 sm:py-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
      <nav aria-label="Panel" className="min-w-0 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-3xl bg-brand-950 p-2 text-white shadow-raised lg:p-3">
          <div className="hidden items-center gap-3 border-b border-white/10 px-2 pt-2 pb-4 lg:flex">
            <span className="relative size-12 shrink-0 overflow-hidden rounded-2xl bg-brand-700 ring-2 ring-white/15">
              {user.avatarUrl ? (
                <RemoteImage src={user.avatarUrl} alt="" fill sizes="48px" className="object-cover" />
              ) : (
                <span aria-hidden="true" className="grid size-full place-items-center font-display text-lg font-bold">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </span>
              )}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-semibold">
                {user.firstName} {user.lastName}
              </span>
              <span className="text-sm text-brand-200">{roleLabel[user.role]}</span>
            </span>
          </div>

          {/* Celular: una sola fila que se desplaza. Escritorio: grupos en columna. */}
          <div className="-mx-2 flex gap-1 overflow-x-auto px-2 [scrollbar-width:none] lg:mx-0 lg:mt-3 lg:flex-col lg:gap-4 lg:overflow-visible lg:px-0">
            {groups.map((group) => (
              <div key={group.label} className="flex shrink-0 lg:flex-col lg:gap-1">
                <p className="hidden px-3 pb-1 text-xs font-semibold text-brand-300 lg:block">{group.label}</p>
                <ul className="flex gap-1 lg:flex-col">
                  {group.links.map((link) => {
                    const active = isActive(link.href);
                    return (
                      <li key={link.href} className="shrink-0">
                        <Link
                          href={link.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "group/link flex h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold whitespace-nowrap transition-[background-color,color] duration-200 ease-out-soft",
                            active ? "bg-white text-brand-900 shadow-xs" : "text-brand-100 hover:bg-white/[0.08] hover:text-white",
                          )}
                        >
                          <link.icon
                            className={cn(
                              "size-[1.1rem] shrink-0 transition-transform duration-200 ease-out-soft group-hover/link:scale-110",
                              active ? "text-brand-700" : "text-brand-300 group-hover/link:text-amber-400",
                            )}
                            aria-hidden="true"
                          />
                          <span className="flex-1">{link.label}</span>
                          {link.counter === "messages" && <MessagesCount />}
                          {link.counter === "notifications" && <NotificationsCount />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function CountBadge({ count, label }: { count: number; label: string }) {
  if (count === 0) return null;
  return (
    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-amber-400 px-1.5 text-xs font-bold text-brand-900">
      {count > 99 ? "99+" : count}
      <span className="sr-only"> {label}</span>
    </span>
  );
}

/** Mensajes sin leer, sumados de la lista de chats (la mantiene al día el tiempo real). */
function MessagesCount() {
  const conversations = useConversations();
  return <CountBadge count={totalUnread(conversations.data)} label="sin leer" />;
}

function NotificationsCount() {
  const unread = useUnreadNotifications(true);
  return <CountBadge count={unread.data ?? 0} label="sin leer" />;
}
