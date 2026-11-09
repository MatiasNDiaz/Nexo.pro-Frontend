"use client";

import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/cn";
import type { AppNotification } from "./api";
import { NotificationItem } from "./notification-item";
import { useMarkAllRead, useMarkRead, useNotificationsPage, useUnreadNotifications } from "./queries";

/** Cuántas se muestran en el desplegable; el resto, en el panel. */
const PREVIEW = 6;

/**
 * Campana del encabezado: cantidad sin leer y un panel con las últimas (patrón disclosure, como el
 * menú de la cuenta: Esc, tocar afuera o elegir una la cierran). La lista se pide al abrirla.
 */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const unread = useUnreadNotifications(true);
  const list = useNotificationsPage(1, open);
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const count = unread.data ?? 0;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const onOpen = (notification: AppNotification) => {
    if (!notification.read) markRead.mutate(notification.id);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="relative grid size-10 place-items-center rounded-xl text-brand-800 transition-colors hover:bg-brand-50"
      >
        <Bell className={cn("size-5", count > 0 && "motion-safe:animate-[bell-ring_1.4s_var(--ease-out-soft)_1]")} aria-hidden="true" />
        <span className="sr-only">Notificaciones{count > 0 ? ` (${count} sin leer)` : ""}</span>
        {count > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-amber-400 px-1 text-[0.7rem] font-bold text-brand-900 ring-2 ring-surface"
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute top-full right-0 z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] origin-top-right animate-[pop-in_160ms_var(--ease-out-soft)] rounded-2xl border border-line bg-surface shadow-raised"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <p className="font-display text-lg font-bold text-ink">Notificaciones</p>
          {count > 0 && (
            <button
              type="button"
              onClick={() => markAll.mutate()}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
            >
              <CheckCheck className="size-4" aria-hidden="true" />
              Marcar leídas
            </button>
          )}
        </div>
        <div className="max-h-[min(26rem,60vh)] overflow-y-auto p-2">
          {list.isPending ? (
            <div className="grid place-items-center py-10">
              <Spinner className="size-6 text-brand-600" />
            </div>
          ) : list.data && list.data.data.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {list.data.data.slice(0, PREVIEW).map((notification) => (
                <li key={notification.id}>
                  <NotificationItem notification={notification} onOpen={onOpen} compact />
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-10 text-center text-sm text-muted-strong">No tenés notificaciones todavía.</p>
          )}
        </div>
        <div className="border-t border-line p-2">
          <Link
            href="/panel/notificaciones"
            onClick={() => setOpen(false)}
            className="flex h-10 items-center justify-center rounded-xl text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
          >
            Ver todas
          </Link>
        </div>
      </div>
    </div>
  );
}
