"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BellOff, BellRing, CheckCheck, ChevronLeft, ChevronRight, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, EmptyState, Skeleton } from "@/components/ui/feedback";
import { PanelTitle, SettingsSection } from "@/features/account/settings-section";
import { errorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { categoryLabel, getPreferences, notificationKeys, updatePreferences, type AppNotification, type PushPreference } from "./api";
import { NotificationItem } from "./notification-item";
import { disablePush, enablePush, readPushState, type PushState } from "./push";
import { useMarkAllRead, useMarkRead, useNotificationsPage } from "./queries";

/** Notificaciones del panel: la lista completa, paginada, y los avisos al celular. */
export function NotificationsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PanelTitle title="Notificaciones" description="Lo que pasó con tus mensajes, pedidos, trabajos y tu cuenta." />
      <NotificationList />
      <PushSettings />
    </div>
  );
}

function NotificationList() {
  const [page, setPage] = useState(1);
  const list = useNotificationsPage(page);
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const onOpen = (notification: AppNotification) => {
    if (!notification.read) markRead.mutate(notification.id);
  };

  if (list.isPending) {
    return (
      <div className="flex flex-col gap-2" aria-busy="true" aria-label="Cargando notificaciones">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }
  if (list.isError) return <Alert tone="danger" title="No pudimos cargar tus notificaciones">{errorMessage(list.error)}</Alert>;

  const { data, total, limit, unread } = list.data;
  const pages = Math.max(1, Math.ceil(total / limit));
  if (total === 0) {
    return <EmptyState icon={BellOff} title="No tenés notificaciones" description="Cuando pase algo con tus pedidos, mensajes o tu cuenta, te avisamos acá." />;
  }

  return (
    <section aria-labelledby="lista-notificaciones" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="lista-notificaciones" className="text-sm font-medium text-muted-strong" aria-live="polite">
          {unread > 0 ? `${unread} sin leer de ${total}` : `${total} notificaciones, todas leídas`}
        </h2>
        {unread > 0 && (
          <Button variant="secondary" size="sm" onClick={() => markAll.mutate()} loading={markAll.isPending}>
            <CheckCheck className="size-4" aria-hidden="true" />
            Marcar todas como leídas
          </Button>
        )}
      </div>
      <ul className={cn("flex flex-col gap-1 rounded-3xl border border-line bg-surface p-2 shadow-card transition-opacity", list.isPlaceholderData && "opacity-60")}>
        {data.map((notification) => (
          <li key={notification.id}>
            <NotificationItem notification={notification} onOpen={onOpen} />
          </li>
        ))}
      </ul>
      {pages > 1 && (
        <nav aria-label="Páginas de notificaciones" className="flex items-center justify-center gap-3">
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="size-4" aria-hidden="true" />
            Anteriores
          </Button>
          <span className="text-sm text-muted-strong">
            Página {page} de {pages}
          </span>
          <Button variant="ghost" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Siguientes
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </nav>
      )}
    </section>
  );
}

const pushStateText: Record<PushState, string> = {
  unsupported: "Este navegador no permite avisos. Probá desde Chrome, Edge, Firefox o Safari actualizados.",
  "disabled-server": "Los avisos al celular todavía no están activados en Repara Ya. Mientras tanto, mirá la campana de arriba.",
  denied: "Bloqueaste los avisos para este sitio. Para activarlos, permitilos desde la configuración del navegador (el candado junto a la dirección).",
  off: "Recibí un aviso en este dispositivo cuando te escriben o cambia un pedido, aunque no tengas la página abierta.",
  on: "Este dispositivo recibe avisos. Llegan mientras tengas la sesión abierta acá.",
};

function PushSettings() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<PushState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const preferences = useQuery({ queryKey: notificationKeys.preferences, queryFn: getPreferences });

  useEffect(() => {
    let cancelled = false;
    readPushState()
      .then((value) => !cancelled && setState(value))
      .catch(() => !cancelled && setState("unsupported"));
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleDevice = useMutation({
    mutationFn: () => (state === "on" ? disablePush() : enablePush()),
    onMutate: () => setError(null),
    onSuccess: setState,
    onError: (err) => setError(errorMessage(err)),
  });

  const savePreferences = useMutation({
    mutationFn: updatePreferences,
    onMutate: (next) => {
      const previous = queryClient.getQueryData<PushPreference[]>(notificationKeys.preferences);
      queryClient.setQueryData(notificationKeys.preferences, next);
      return { previous };
    },
    onError: (err, _next, context) => {
      queryClient.setQueryData(notificationKeys.preferences, context?.previous);
      setError(errorMessage(err));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.preferences }),
  });

  const canToggle = state === "on" || state === "off";

  return (
    <SettingsSection id="avisos" title="Avisos al celular" description="Funcionan en el navegador donde los actives.">
      <div className="flex flex-col gap-4 rounded-2xl bg-canvas p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", state === "on" ? "bg-success-600 text-white" : "bg-brand-100 text-brand-700")}>
            {state === "on" ? <BellRing className="size-5" aria-hidden="true" /> : <Smartphone className="size-5" aria-hidden="true" />}
          </span>
          <p className="text-sm leading-relaxed text-muted-strong" aria-live="polite">
            {state ? pushStateText[state] : "Revisando este dispositivo…"}
          </p>
        </div>
        {canToggle && (
          <Button variant={state === "on" ? "secondary" : "primary"} onClick={() => toggleDevice.mutate()} loading={toggleDevice.isPending} className="shrink-0">
            {state === "on" ? "Desactivar en este dispositivo" : "Activar en este dispositivo"}
          </Button>
        )}
      </div>

      {error && <Alert tone="danger" title="No se pudo guardar">{error}</Alert>}

      {preferences.data && preferences.data.length > 0 && (
        <fieldset className="flex flex-col gap-1">
          <legend className="mb-2 text-sm font-semibold text-ink">Qué avisos querés recibir</legend>
          {preferences.data.map((preference) => {
            const label = categoryLabel[preference.category];
            return (
              <label
                key={preference.category}
                className="flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-xl px-3 py-2 transition-colors hover:bg-canvas has-focus-visible:outline-2 has-focus-visible:outline-electric-500"
              >
                <span className="flex flex-col">
                  <span className="font-medium text-ink">{label.title}</span>
                  <span className="text-sm text-muted">{label.detail}</span>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  className="peer sr-only"
                  checked={preference.push}
                  onChange={(event) =>
                    savePreferences.mutate(
                      preferences.data.map((p) => (p.category === preference.category ? { ...p, push: event.target.checked } : p)),
                    )
                  }
                />
                <span
                  aria-hidden="true"
                  className="relative h-6 w-11 shrink-0 rounded-full bg-line-strong transition-colors after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow-xs after:transition-transform peer-checked:bg-success-600 peer-checked:after:translate-x-5"
                />
              </label>
            );
          })}
        </fieldset>
      )}
    </SettingsSection>
  );
}
