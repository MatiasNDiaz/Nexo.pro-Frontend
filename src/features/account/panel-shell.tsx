"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useRef, type ReactNode } from "react";
import { RemoteImage } from "@/components/catalog/remote-image";
import { totalUnread } from "@/features/chat/cache";
import { useConversations } from "@/features/chat/inbox";
import { useUnreadNotifications } from "@/features/notifications/queries";
import type { Me } from "@/features/session/api";
import { RequireSession, SessionSkeleton } from "@/features/session/require-session";
import { cn } from "@/lib/cn";
import { activeHref, panelGroupsFor } from "./panel-nav";

const roleLabel: Record<Me["role"], string> = { CUSTOMER: "Cliente", PROFESSIONAL: "Profesional", ADMIN: "Administración" };

const statusLabel: Partial<Record<Me["status"], string>> = {
  ACTIVE: "Cuenta activa",
  PENDING_VERIFICATION: "Cuenta por activar",
  SUSPENDED: "Cuenta suspendida",
  BANNED: "Cuenta bloqueada",
};

export function PanelShell({ children }: { children: ReactNode }) {
  // Suspense: RequireSession lee la URL, que en las rutas con parámetros ([id]) recién existe al pedirla.
  return (
    <Suspense fallback={<SessionSkeleton />}>
      <RequireSession>{(user) => <PanelFrame user={user}>{children}</PanelFrame>}</RequireSession>
    </Suspense>
  );
}

/**
 * Marco del panel ("modo trabajo"), pedido del fundador del 2026-11-11: en escritorio, el menú pegado
 * a la izquierda, de alto completo y fijo al bajar (entre el 20 y el 30 % del ancho), y el contenido
 * ocupando todo el resto de la pantalla. En celular, el menú es una fila que se desplaza arriba.
 */
function PanelFrame({ user, children }: { user: Me; children: ReactNode }) {
  const pathname = usePathname();
  const groups = panelGroupsFor(user);
  const current = activeHref(groups, pathname);
  const row = useRef<HTMLDivElement>(null);

  // Celular: la fila muestra la sección actual. Se mueve solo la fila (scrollLeft), nunca la página.
  useEffect(() => {
    const container = row.current;
    const link = container?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!container || !link || container.scrollWidth <= container.clientWidth) return;
    const left = link.getBoundingClientRect().left - container.getBoundingClientRect().left + container.scrollLeft;
    if (left < container.scrollLeft || left + link.offsetWidth > container.scrollLeft + container.clientWidth) {
      container.scrollTo({ left: left - 16, behavior: "smooth" });
    }
  }, [pathname]);

  return (
    // minmax(0, …): ninguna columna se estira con su contenido (la fila del celular se desplaza adentro).
    // 4rem = alto del encabezado del sitio (sticky): el menú arranca justo debajo.
    <div data-panel-frame className="grid grid-cols-[minmax(0,1fr)] lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-[clamp(16.5rem,23%,24rem)_minmax(0,1fr)]">
      <nav
        aria-label="Panel"
        className={cn(
          "min-w-0 px-4 pt-4 sm:px-6 sm:pt-6",
          "lg:sticky lg:top-16 lg:h-[calc(100dvh-4rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:bg-brand-950 lg:p-0",
          "lg:[scrollbar-color:rgb(255_255_255/0.18)_transparent] lg:scrollbar-thin",
        )}
      >
        <div className="rounded-2xl bg-brand-950 p-2 text-white lg:rounded-none lg:px-4 lg:pt-5 lg:pb-8 xl:px-6">
          <div className="hidden items-center gap-3 px-2 pb-5 lg:flex">
            <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-brand-700 ring-2 ring-white/15">
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
              <span className="truncate text-sm text-brand-200">
                {roleLabel[user.role]}
                {user.role !== "ADMIN" && statusLabel[user.status] && ` · ${statusLabel[user.status]}`}
              </span>
            </span>
          </div>

          {/*
            Celular: una sola fila que se desplaza. Escritorio: grupos en columna. `relative`: la fila es
            el bloque contenedor de lo que va con position absolute adentro (el texto sr-only de los
            contadores); sin eso, ese texto queda fuera del recorte y agranda la página en el celular.
          */}
          <div
            ref={row}
            className="relative -mx-2 flex gap-1 overflow-x-auto px-2 scrollbar-none lg:mx-0 lg:flex-col lg:gap-5 lg:overflow-visible lg:border-t lg:border-white/10 lg:px-0 lg:pt-5"
          >
            {groups.map((group) => (
              <div key={group.label} className="flex shrink-0 lg:flex-col lg:gap-0.5">
                {/* El grupo que solo tiene el inicio no necesita título. */}
                {group.links.some((link) => link.href !== "/panel") && (
                  <p className="hidden px-3 pb-1 text-xs font-semibold tracking-wide text-brand-300 uppercase lg:block">{group.label}</p>
                )}
                <ul className="flex gap-1 lg:flex-col lg:gap-0.5">
                  {group.links.map((link) => {
                    const active = link.href === current;
                    return (
                      <li key={link.href} className="shrink-0">
                        <Link
                          href={link.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "group/link flex h-11 items-center gap-3 rounded-xl px-3.5 lg:h-10 text-sm font-semibold whitespace-nowrap transition-[background-color,color] duration-200 ease-out-soft lg:text-[0.9375rem]",
                            active ? "bg-white text-brand-900 shadow-xs" : "text-brand-100 hover:bg-white/8 hover:text-white",
                          )}
                        >
                          <link.icon
                            className={cn(
                              "size-[1.1rem] shrink-0 transition-transform duration-200 ease-out-soft group-hover/link:scale-110",
                              active ? "text-brand-700" : "text-brand-300 group-hover/link:text-amber-400",
                            )}
                            aria-hidden="true"
                          />
                          <span className="flex-1 truncate">{link.label}</span>
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
      <div className="min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 2xl:px-14">{children}</div>
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
