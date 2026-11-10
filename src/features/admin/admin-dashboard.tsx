"use client";

import { useQuery } from "@tanstack/react-query";
import { CreditCard, Fingerprint, Flag, Gavel, LifeBuoy, Search, Users } from "lucide-react";
import { revealDelay } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Alert, Skeleton } from "@/components/ui/feedback";
import { Tile, type TileProps } from "@/features/account/dashboard-tile";
import { errorMessage } from "@/lib/api/errors";
import { adminKeys, counts, getDashboard, type Dashboard } from "./api";

/**
 * Inicio del admin (E-005): primero lo que espera una decisión (reportes, apelaciones, soporte,
 * identidades y pagos sin aplicar) y después cómo está la plataforma. Las secciones de moderación,
 * soporte e ingresos llegan en la 7.2 y la 7.3: hasta entonces la tarjeta muestra el número sin enlace.
 */
export function AdminDashboard() {
  const dashboard = useQuery({ queryKey: adminKeys.dashboard, queryFn: getDashboard });

  if (dashboard.isError) {
    return (
      <Alert tone="danger" title="No pudimos cargar el resumen">
        {errorMessage(dashboard.error)}
      </Alert>
    );
  }

  const data = dashboard.data;
  const loading = dashboard.isPending;
  const pending: TileProps[] = [
    { href: "/panel/admin/reportes", icon: Flag, title: "Reportes", count: data?.openReports, detail: "sin resolver", highlight: (data?.openReports ?? 0) > 0, loading },
    { href: "/panel/admin/apelaciones", icon: Gavel, title: "Apelaciones", count: data?.openAppeals, detail: "esperando decisión", highlight: (data?.openAppeals ?? 0) > 0, loading },
    { href: "/panel/admin/soporte", icon: LifeBuoy, title: "Soporte", count: data?.openSupportTickets, detail: "consultas abiertas", highlight: (data?.openSupportTickets ?? 0) > 0, loading },
    { href: "/panel/admin/identidades", icon: Fingerprint, title: "Identidades", count: data?.pendingVerifications, detail: "por revisar", highlight: (data?.pendingVerifications ?? 0) > 0, loading },
    { href: "/panel/admin/ingresos?vista=mercadopago", icon: CreditCard, title: "Pagos", count: data?.paymentsToReview, detail: "aprobados sin aplicar", highlight: (data?.paymentsToReview ?? 0) > 0, loading },
    // Suspensión, bloqueo o perfil oculto vigente (no cuenta advertencias). Sin enlace: el buscador
    // filtra por estado de la cuenta, y un perfil oculto no cambia el estado.
    { icon: Users, title: "Sancionados", count: data?.sanctionedUsers, detail: "con sanción vigente", loading },
  ];

  return (
    <>
      <section aria-labelledby="para-revisar" className="flex flex-col gap-4">
        <h2 id="para-revisar" className="text-xl font-semibold text-brand-900">
          Para revisar
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
          {pending.map((tile, index) => (
            <li key={tile.title} data-reveal style={revealDelay(index % 3, 70)}>
              <Tile {...tile} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="la-plataforma" className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-7" data-reveal>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="la-plataforma" className="text-xl font-semibold text-brand-900">
            La plataforma
          </h2>
          <ButtonLink href="/panel/admin/usuarios" variant="secondary" size="sm">
            <Search className="size-4" aria-hidden="true" />
            Buscar usuarios
          </ButtonLink>
        </div>
        {loading || !data ? <Skeleton className="h-40 w-full" /> : <PlatformNumbers data={data} />}
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
    <div className="grid gap-6 sm:grid-cols-2">
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
