"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  Crown,
  KeyRound,
  LogOut,
  Mail,
  Pencil,
  Repeat,
  RotateCcw,
  ShieldAlert,
  Trash2,
  TriangleAlert,
  UserX,
  type LucideIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Alert, Badge, EmptyState, Skeleton } from "@/components/ui/feedback";
import { SettingsSection } from "@/features/account/settings-section";
import { MetricsBoard } from "@/features/pro-work/metrics-page";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import {
  accountActions,
  adminKeys,
  fullName,
  getUser,
  getUserMetrics,
  paymentLabel,
  roleLabel,
  sanctionLabel,
  statusLabel,
  subscriptionLabel,
  verificationLabel,
  type AdminUserDetail,
  type VerificationStatus,
} from "./api";
import { Notice } from "./admin-ui";
import { ProContent } from "./pro-content";
import { UserActionDialog, type UserDialog } from "./user-actions";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Ficha de un usuario (E-045) con todas las acciones del admin. Cada acción pide motivo, se confirma en
 * un diálogo y vuelve a pedir la ficha: lo que se ve siempre es lo que dice el backend.
 */
export function UserDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const valid = UUID.test(id);
  // Llegando desde un reporte (?reporte=…), el strike o la sanción quedan vinculados a ese reporte.
  const fromReport = useSearchParams().get("reporte");
  const reportId = fromReport && UUID.test(fromReport) ? fromReport : undefined;
  const queryClient = useQueryClient();
  const user = useQuery({
    queryKey: adminKeys.user(id),
    queryFn: () => getUser(id),
    enabled: valid,
    retry: (count, error) => !isApiError(error) && count < 2,
  });
  const [dialog, setDialog] = useState<UserDialog | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!valid || (user.isError && isApiError(user.error) && user.error.status === 404)) {
    return (
      <EmptyState
        icon={UserX}
        headingLevel={1}
        title="No encontramos esa cuenta"
        action={
          <Link href="/panel/admin/usuarios" className="font-semibold text-brand-700 hover:underline">
            Volver a usuarios
          </Link>
        }
      />
    );
  }

  const done = (message: string) => {
    setDialog(null);
    setNotice(message);
    void queryClient.invalidateQueries({ queryKey: adminKeys.user(id) });
    void queryClient.invalidateQueries({ queryKey: adminKeys.usersAll });
    void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard });
  };
  const open = (next: UserDialog) => {
    setNotice(null);
    setDialog(next);
  };

  return (
    <div className="flex flex-col gap-6">
      <Link href="/panel/admin/usuarios" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Usuarios
      </Link>

      {user.isPending ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-56 rounded-3xl" />
        </div>
      ) : user.isError ? (
        <Alert tone="danger" title="No pudimos cargar la ficha">
          {errorMessage(user.error)}
        </Alert>
      ) : (
        <>
          <Header user={user.data} />
          {reportId && (
            <Alert tone="info" title="Estás actuando por un reporte">
              El strike o la sanción que apliques quedan vinculados a ese reporte.{" "}
              <Link href={`/panel/admin/reportes/${reportId}` as Route} className="font-semibold underline">
                Volver al reporte
              </Link>
            </Alert>
          )}
          <Notice message={notice} />
          <Actions user={user.data} onOpen={open} />
          <Moderation user={user.data} onOpen={open} />
          {user.data.role === "PROFESSIONAL" && !user.data.deletedAt && <ProContent userId={user.data.id} />}
          {user.data.role === "PROFESSIONAL" && <Subscription user={user.data} onOpen={open} />}
          {user.data.role === "PROFESSIONAL" && <Metrics userId={user.data.id} />}
          {dialog && <UserActionDialog dialog={dialog} user={user.data} reportId={reportId} onClose={() => setDialog(null)} onDone={done} />}
        </>
      )}
    </div>
  );
}

function Header({ user }: { user: AdminUserDetail }) {
  const status = statusLabel[user.status];
  const anonymized = user.deletedAt !== null;
  return (
    <header className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-7">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={user.role === "PROFESSIONAL" ? "electric" : "neutral"}>{roleLabel[user.role]}</Badge>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        <h1 className="text-3xl font-bold break-words text-brand-900">{anonymized ? "Usuario eliminado" : fullName(user)}</h1>
      </div>
      {anonymized ? (
        <Alert tone="info">La cuenta se anonimizó el {formatDate(user.deletedAt!)}: ya no tiene datos personales. Solo queda su historial.</Alert>
      ) : (
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Email">
            <a href={`mailto:${user.email}`} className="break-all text-brand-700 hover:underline">
              {user.email}
            </a>
          </Detail>
          <Detail label="Teléfono">{user.phone}</Detail>
          <Detail label="Identidad">{verificationLabel[user.verificationStatus as VerificationStatus] ?? user.verificationStatus}</Detail>
          <Detail label="Cuenta creada">{formatDate(user.createdAt)}</Detail>
          <Detail label="Reportes">
            {user.reportsAgainst} en contra ({user.validReportsAgainst} válidos) · {user.reportsMade} hechos
          </Detail>
          <Detail label="Strikes vigentes">Suman {user.activeStrikeWeight}</Detail>
        </dl>
      )}
      {user.statusReason && (user.status === "SUSPENDED" || user.status === "BANNED") && <Alert tone="danger">Motivo: {user.statusReason}</Alert>}
      {user.deletionScheduledFor && !anonymized && (
        <Alert tone="warning">Baja en curso: se anonimiza el {formatDate(user.deletionScheduledFor)}. Hasta entonces la podés restaurar.</Alert>
      )}
    </header>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-strong">{label}</dt>
      <dd className="font-medium text-ink">{children}</dd>
    </div>
  );
}

interface ActionItem {
  kind: Exclude<UserDialog["kind"], "lift" | "void">;
  label: string;
  icon: LucideIcon;
  show: boolean;
  danger?: boolean;
}

/** Las acciones que corresponden al estado de la cuenta, en tres grupos. */
function Actions({ user, onOpen }: { user: AdminUserDetail; onOpen: (dialog: UserDialog) => void }) {
  const can = accountActions(user);
  const groups: { title: string; items: ActionItem[] }[] = [
    {
      title: "Cuenta",
      items: [
        { kind: "message", label: "Mandar un mensaje", icon: Mail, show: can.message },
        { kind: "edit", label: "Editar datos", icon: Pencil, show: can.edit },
        { kind: "role", label: user.role === "PROFESSIONAL" ? "Pasar a cliente" : "Pasar a profesional", icon: Repeat, show: can.changeRole },
        { kind: "restore", label: can.pendingDeletion ? "Cancelar la baja" : "Restaurar la cuenta", icon: RotateCcw, show: can.restore },
        { kind: "delete", label: "Dar de baja", icon: Trash2, show: can.delete, danger: true },
      ],
    },
    {
      title: "Seguridad",
      items: [
        { kind: "password", label: "Enlace para nueva contraseña", icon: KeyRound, show: can.passwordReset },
        { kind: "sessions", label: "Cerrar todas sus sesiones", icon: LogOut, show: can.sessions, danger: true },
      ],
    },
    {
      title: "Moderación",
      items: [
        { kind: "strike", label: "Agregar un strike", icon: TriangleAlert, show: !user.deletedAt },
        { kind: "sanction", label: "Sancionar", icon: Ban, show: can.sanction, danger: true },
      ],
    },
  ];
  const visible = groups.map((group) => ({ ...group, items: group.items.filter((item) => item.show) })).filter((group) => group.items.length > 0);
  if (visible.length === 0) return null;

  return (
    <SettingsSection title="Acciones" description="Todas piden motivo y quedan en el registro de auditoría.">
      <div className="grid gap-5 md:grid-cols-3">
        {visible.map((group) => (
          <div key={group.title} className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-muted-strong">{group.title}</h3>
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => (
                <li key={item.kind}>
                  <button
                    type="button"
                    onClick={() => onOpen({ kind: item.kind })}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left text-sm font-semibold transition-colors",
                      item.danger ? "text-danger-600 hover:bg-danger-50" : "text-brand-800 hover:bg-brand-50",
                    )}
                  >
                    <item.icon className="size-4 shrink-0" aria-hidden="true" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SettingsSection>
  );
}

function Moderation({ user, onOpen }: { user: AdminUserDetail; onOpen: (dialog: UserDialog) => void }) {
  return (
    <SettingsSection title="Sanciones y strikes" description="Lo más reciente primero. La persona ve el motivo de cada uno.">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-muted-strong">Sanciones</h3>
          {user.sanctions.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-muted-strong">
              <CheckCircle2 className="size-4 text-success-600" aria-hidden="true" />
              Sin sanciones.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {user.sanctions.map((sanction) => (
                <li key={sanction.id} className="flex flex-col gap-1.5 py-3">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink">{sanctionLabel[sanction.type].label}</span>
                    {sanction.active ? <Badge tone="danger">Vigente</Badge> : <Badge>{sanction.liftedAt ? "Levantada" : "Terminada"}</Badge>}
                  </span>
                  <span className="text-sm break-words text-ink">{sanction.reason}</span>
                  <span className="text-sm text-muted-strong">
                    Desde el {formatDateTime(sanction.startsAt)}
                    {sanction.endsAt && ` · hasta el ${formatDateTime(sanction.endsAt)}`}
                    {sanction.liftedAt && ` · levantada el ${formatDateTime(sanction.liftedAt)}`}
                  </span>
                  {sanction.active && (
                    <Button variant="secondary" size="sm" className="self-start" onClick={() => onOpen({ kind: "lift", sanction })}>
                      Levantar
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-muted-strong">Strikes (suman {user.activeStrikeWeight})</h3>
          {user.strikes.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-muted-strong">
              <CheckCircle2 className="size-4 text-success-600" aria-hidden="true" />
              Sin strikes.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {user.strikes.map((strike) => (
                <li key={strike.id} className="flex flex-col gap-1.5 py-3">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink">Peso {strike.weight}</span>
                    {strike.voided ? <Badge>Anulado</Badge> : <Badge tone="amber">Suma</Badge>}
                  </span>
                  <span className="text-sm break-words text-ink">{strike.reason}</span>
                  <span className="text-sm text-muted-strong">
                    {formatDateTime(strike.createdAt)}
                    {strike.voidReason && ` · anulado: ${strike.voidReason}`}
                  </span>
                  {!strike.voided && (
                    <Button variant="secondary" size="sm" className="self-start" onClick={() => onOpen({ kind: "void", strike })}>
                      Anular
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </SettingsSection>
  );
}

function Subscription({ user, onOpen }: { user: AdminUserDetail; onOpen: (dialog: UserDialog) => void }) {
  const sub = user.subscription;
  const until = sub?.status === "TRIAL" ? sub.trialEndsAt : sub?.currentPeriodEnd;
  const live = !!sub && sub.status !== "EXPIRED" && !!until && new Date(until) > new Date();
  return (
    <SettingsSection title="Plan y pagos" description="Los últimos 20 pagos, el más reciente primero.">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-canvas p-4">
        <span className="flex items-center gap-3">
          <Crown className="size-5 text-amber-500" aria-hidden="true" />
          <span className="flex flex-col">
            <span className="font-semibold text-ink">
              {sub ? `${sub.planCode ? sub.planCode.charAt(0) + sub.planCode.slice(1).toLowerCase() : "Sin plan"} · ${subscriptionLabel[sub.status] ?? sub.status}` : "Nunca tuvo plan"}
            </span>
            {until && <span className="text-sm text-muted-strong">{live ? `Rige hasta el ${formatDate(until)}` : `Venció el ${formatDate(until)}`}</span>}
          </span>
        </span>
        {live && !user.deletedAt && (
          <Button variant="secondary" size="sm" onClick={() => onOpen({ kind: "plan" })}>
            Cambiar el plan
          </Button>
        )}
      </div>
      {user.payments.length === 0 ? (
        <p className="text-sm text-muted-strong">Todavía no hizo pagos.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {user.payments.map((payment) => {
            const status = paymentLabel[payment.status] ?? { label: payment.status, tone: "neutral" as const };
            return (
              <li key={payment.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="flex flex-1 flex-col">
                  <span className="font-medium text-ink">
                    {payment.planCode.charAt(0) + payment.planCode.slice(1).toLowerCase()} · {payment.purpose === "UPGRADE_DIFFERENCE" ? "diferencia por cambio de plan" : "mes"}
                  </span>
                  <span className="text-sm text-muted-strong">
                    {formatDate(payment.createdAt)}
                    {payment.status === "APPROVED" && !payment.applied && " · aprobado sin aplicar"}
                    {payment.reverted && " · revertido"}
                  </span>
                </span>
                <span className="font-display text-lg font-bold text-ink">{formatMoney(payment.amount)}</span>
                <Badge tone={status.tone}>{status.label}</Badge>
              </li>
            );
          })}
        </ul>
      )}
    </SettingsSection>
  );
}

/** Métricas del profesional (E-050): el admin las ve aunque no tenga Premium. Solo lectura. */
function Metrics({ userId }: { userId: string }) {
  return (
    <SettingsSection title="Métricas" description="Lo mismo que ve el profesional con Premium. Se cuentan personas distintas por día.">
      <MetricsBoard
        queryKey={adminKeys.metrics(userId)}
        load={getUserMetrics(userId)}
        errorTitle="No pudimos cargar las métricas"
        replaceOnError={(error) =>
          isApiError(error, "PROFILE_NOT_FOUND") ? (
            <p className="flex items-center gap-2 text-sm text-muted-strong">
              <ShieldAlert className="size-4" aria-hidden="true" />
              No tiene perfil profesional activo.
            </p>
          ) : null
        }
      />
    </SettingsSection>
  );
}
