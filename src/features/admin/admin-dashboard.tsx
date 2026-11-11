"use client";

import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Alert, Skeleton } from "@/components/ui/feedback";
import type { PanelGroup } from "@/features/account/panel-nav";
import { QuickAccess, type AccessStatuses } from "@/features/account/quick-access";
import { errorMessage } from "@/lib/api/errors";
import { adminKeys, counts, getDashboard, type Dashboard } from "./api";

/**
 * Inicio del admin (E-005): los accesos rápidos, empezando por lo que espera una decisión (reportes,
 * apelaciones, identidades y soporte, con cuántos esperan) y después cómo está la plataforma.
 */
export function AdminHome({ groups }: { groups: PanelGroup[] }) {
  const dashboard = useQuery({ queryKey: adminKeys.dashboard, queryFn: getDashboard });
  const data = dashboard.data;
  const loading = dashboard.isPending;
  const waiting = (count: number | undefined, detail: string) => ({ count, detail, highlight: true, loading });
  const statuses: AccessStatuses = dashboard.isError
    ? {}
    : {
        "/panel/admin/reportes": waiting(data?.openReports, "sin resolver"),
        "/panel/admin/apelaciones": waiting(data?.openAppeals, "sin decidir"),
        "/panel/admin/identidades": waiting(data?.pendingVerifications, "por revisar"),
        "/panel/admin/soporte": waiting(data?.openSupportTickets, "abiertas"),
        "/panel/admin/ingresos": waiting(data?.paymentsToReview, "pagos sin aplicar"),
        // Suspensión, bloqueo o perfil oculto vigente (no cuenta advertencias).
        "/panel/admin/usuarios": { count: data?.sanctionedUsers, detail: "con sanción", loading },
      };

  return (
    <>
      {dashboard.isError && (
        <Alert tone="danger" title="No pudimos cargar lo pendiente">
          {errorMessage(dashboard.error)}
        </Alert>
      )}
      <QuickAccess groups={groups} statuses={statuses} />

      <section aria-labelledby="la-plataforma" className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-7" data-reveal>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="la-plataforma" className="text-xl font-semibold text-brand-900">
            La plataforma
          </h2>
          <ButtonLink href="/panel/admin/usuarios" variant="secondary" size="sm">
            <Search className="size-4" aria-hidden="true" />
            Buscar usuarios
          </ButtonLink>
        </div>
        {dashboard.isError ? null : loading || !data ? <Skeleton className="h-40 w-full" /> : <PlatformNumbers data={data} />}
      </section>
    </>
  );
}

function PlatformNumbers({ data }: { data: Dashboard }) {
  const byRole = counts(data.usersByRole);
  const byStatus = counts(data.usersByStatus);
  const byPlan = counts(data.professionalsByPlan);
  const groups: { title: string; items: { label: string; value: number | undefined }[] }[] = [
    {
      title: "Personas",
      items: [
        { label: "Clientes", value: byRole.CUSTOMER },
        { label: "Profesionales", value: byRole.PROFESSIONAL },
        { label: "Nuevas en 7 días", value: data.newUsersLast7Days },
      ],
    },
    {
      title: "Cuentas",
      items: [
        { label: "Activas", value: byStatus.ACTIVE },
        { label: "Por verificar", value: byStatus.PENDING_VERIFICATION },
        { label: "Suspendidas", value: byStatus.SUSPENDED },
        { label: "Bloqueadas", value: byStatus.BANNED },
        { label: "Dadas de baja", value: byStatus.DEACTIVATED },
      ],
    },
    {
      title: "Profesionales con plan vigente",
      items: [
        { label: "Basic (incluye la prueba)", value: byPlan.BASIC },
        { label: "Medium", value: byPlan.MEDIUM },
        { label: "Premium", value: byPlan.PREMIUM },
      ],
    },
    {
      title: "Últimos 7 días",
      items: [
        { label: "Publicaciones en el foro", value: data.newForumPostsLast7Days },
        { label: "Reportes nuevos", value: data.newReportsLast7Days },
      ],
    },
  ];
  return (
    <div className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-4">
      {groups.map((group) => (
        <div key={group.title} className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-muted-strong">{group.title}</h3>
          <dl className="flex flex-col divide-y divide-line">
            {group.items.map((item) => (
              <div key={item.label} className="flex items-baseline justify-between gap-3 py-2">
                <dt className="text-sm text-ink">{item.label}</dt>
                <dd className="font-display text-lg font-bold text-brand-900 tabular-nums">{item.value ?? 0}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
