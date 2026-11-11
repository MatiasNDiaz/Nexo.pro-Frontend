"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle, Clock, Fingerprint, ShieldCheck, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert, Skeleton } from "@/components/ui/feedback";
import { ResendButton } from "@/features/session/email-links";
import { useSessionActions } from "@/features/session/session-provider";
import { errorMessage } from "@/lib/api/errors";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import { accountKeys, getVerification, startVerification, type Verification } from "./api";
import { PanelTitle, SettingsSection } from "./settings-section";
import { useMe } from "./use-me";

/** Máximo de intentos del backend (IDENTITY_MAX_ATTEMPTS, por defecto 3). */
const MAX_ATTEMPTS = 3;

/**
 * Verificación de identidad (docs/BACKEND_BUSINESS_FLOWS.md §2). El proveedor actual es MANUAL: no
 * hay redirección ni widget; el intento queda en revisión y lo decide el equipo. Requisitos que
 * controla el backend (422 PROFILE_INCOMPLETE): email verificado y foto de perfil.
 */
export function VerificationPage() {
  const me = useMe();
  const verification = useQuery({ queryKey: accountKeys.verification, queryFn: getVerification });
  const hasPhoto = !!me.avatarUrl || !!me.pendingAvatarUrl;

  return (
    <div className="flex flex-col gap-6">
      <PanelTitle
        title="Verificación de identidad"
        description="Todas las cuentas de Repara Ya tienen la identidad verificada. Es lo que da confianza a clientes y profesionales."
      />
      <SettingsSection title="Antes de empezar">
        <ul className="flex flex-col gap-3">
          <Requirement done={me.emailVerified} label="Email verificado" action={!me.emailVerified && <ResendButton />} />
          <Requirement
            done={hasPhoto}
            label="Foto de perfil cargada"
            action={
              !hasPhoto && (
                <ButtonLink href="/panel/cuenta" variant="secondary" size="sm">
                  Cargar foto
                </ButtonLink>
              )
            }
          />
        </ul>
      </SettingsSection>
      <SettingsSection title="Estado">
        {verification.isPending ? (
          <Skeleton className="h-24 w-full" />
        ) : verification.isError ? (
          <Alert tone="danger">{errorMessage(verification.error)}</Alert>
        ) : (
          <VerificationState verification={verification.data} ready={me.emailVerified && hasPhoto} />
        )}
      </SettingsSection>
    </div>
  );
}

function Requirement({ done, label, action }: { done: boolean; label: string; action?: ReactNode }) {
  const Icon = done ? CheckCircle2 : Circle;
  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-line p-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="flex items-center gap-2.5 font-medium text-ink">
        <Icon className={cn("size-5", done ? "text-success-600" : "text-line-strong")} aria-hidden="true" />
        {label}
        <span className="sr-only">{done ? ": listo" : ": pendiente"}</span>
      </span>
      {action}
    </li>
  );
}

function VerificationState({ verification, ready }: { verification: Verification; ready: boolean }) {
  const queryClient = useQueryClient();
  const { refreshSession } = useSessionActions();
  const start = useMutation({
    mutationFn: startVerification,
    meta: { success: { title: "Recibimos tu pedido de verificación", description: "Nuestro equipo lo revisa y te avisamos por notificación." } },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: accountKeys.verification });
      await refreshSession();
    },
  });

  const { status, attemptNumber } = verification;
  const isChange = verification.kind === "PROFILE_CHANGE";
  const attemptsLeft = Math.max(MAX_ATTEMPTS - attemptNumber, 0);
  const canStart = (status === "NOT_STARTED" || status === "REJECTED" || status === "REVOKED") && attemptsLeft > 0;

  if (status === "PENDING" || status === "REQUIRES_REVIEW") {
    return (
      <StateBox icon={Clock} tone="amber" title={isChange ? "Revisando tu foto o nombre nuevos" : "Tu identidad está en revisión"}>
        <p>
          {isChange
            ? "Nuestro equipo revisa el cambio. Mientras tanto, en público se ve lo anterior."
            : "Nuestro equipo revisa tus datos y puede contactarte. Te avisamos cuando esté lista."}
        </p>
        {verification.submittedAt && <p className="text-xs">Enviada el {formatDate(verification.submittedAt)}.</p>}
      </StateBox>
    );
  }

  if (status === "APPROVED") {
    return (
      <StateBox icon={ShieldCheck} tone="success" title="Tu identidad está verificada">
        {verification.decidedAt && <p>Aprobada el {formatDate(verification.decidedAt)}.</p>}
      </StateBox>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {(status === "REJECTED" || status === "REVOKED") && (
        <StateBox icon={XCircle} tone="danger" title={status === "REJECTED" ? "No pudimos aprobar tu identidad" : "Tu verificación fue revocada"}>
          <p>
            {attemptsLeft > 0
              ? `Podés intentarlo de nuevo. Te ${attemptsLeft === 1 ? "queda 1 intento" : `quedan ${attemptsLeft} intentos`}.`
              : "Ya usaste todos los intentos. Escribinos desde Contacto y te ayudamos."}
          </p>
        </StateBox>
      )}
      {status === "NOT_STARTED" && (
        <p className="text-sm text-muted">
          Al iniciarla, nuestro equipo revisa tus datos y tu foto. Puede contactarte para confirmarlos.
        </p>
      )}
      {start.isError && <Alert tone="danger">{errorMessage(start.error)}</Alert>}
      {canStart && (
        <Button onClick={() => start.mutate()} loading={start.isPending} disabled={!ready} className="self-start">
          <Fingerprint className="size-4" aria-hidden="true" />
          {status === "NOT_STARTED" ? "Iniciar verificación" : "Volver a intentarlo"}
        </Button>
      )}
      {canStart && !ready && <p className="text-sm text-muted">Completá los pasos de arriba para poder iniciarla.</p>}
    </div>
  );
}

function StateBox({
  icon: Icon,
  tone,
  title,
  children,
}: {
  icon: typeof Clock;
  tone: "amber" | "success" | "danger";
  title: string;
  children?: ReactNode;
}) {
  const tones = {
    amber: "border-amber-100 bg-amber-50 text-amber-800",
    success: "border-success-600/20 bg-success-50 text-success-800",
    danger: "border-danger-600/20 bg-danger-50 text-danger-600",
  };
  return (
    <div role="status" className={cn("flex gap-3 rounded-2xl border p-4", tones[tone])}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="flex flex-col gap-1 text-sm">
        <p className="font-semibold">{title}</p>
        {children}
      </div>
    </div>
  );
}
