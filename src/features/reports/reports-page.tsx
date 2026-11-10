"use client";

import { useQuery } from "@tanstack/react-query";
import { Flag, ShieldCheck } from "lucide-react";
import { revealDelay } from "@/components/motion/reveal";
import { Alert, Badge, EmptyState, Skeleton } from "@/components/ui/feedback";
import { PanelTitle } from "@/features/account/settings-section";
import { errorMessage } from "@/lib/api/errors";
import { formatDate } from "@/lib/format";
import { listMyReports, reasonLabel, reportKeys, statusLabel, targetLabel } from "./api";

/** Mis reportes y su estado (E-132). Por privacidad no se muestra a quién se reportó ni qué medida se tomó. */
export function ReportsPage() {
  const reports = useQuery({ queryKey: reportKeys.mine, queryFn: listMyReports });

  return (
    <div className="flex flex-col gap-8">
      <PanelTitle title="Mis reportes" description="Lo que nos avisaste y en qué quedó. Nadie sabe quién hizo el reporte." />
      {reports.isPending ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Cargando reportes">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      ) : reports.isError ? (
        <Alert tone="danger" title="No pudimos cargar tus reportes">
          {errorMessage(reports.error)}
        </Alert>
      ) : reports.data.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No hiciste reportes"
          description="Si algo no está bien en un perfil, un mensaje, el foro o una reseña, tocá “Reportar” y lo revisamos."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {reports.data.map((report, index) => {
            const status = statusLabel[report.status];
            return (
              <li key={report.id} data-reveal style={revealDelay(index % 4, 60)}>
                <article className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <Flag className="size-5" aria-hidden="true" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <h2 className="font-semibold text-ink">
                      {targetLabel[report.targetType]} · {reasonLabel[report.reason]}
                    </h2>
                    <p className="text-sm text-muted">Enviado el {formatDate(report.createdAt)}</p>
                  </div>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
