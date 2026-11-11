"use client";

import { Ban, Camera, CheckCircle2, Circle, Clock, Fingerprint, MailCheck, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Alert, Badge } from "@/components/ui/feedback";
import { Card } from "@/components/ui/card";
import type { Me } from "@/features/session/api";
import { ResendButton } from "@/features/session/email-links";
import { cn } from "@/lib/cn";

const roleLabel: Record<Me["role"], string> = { CUSTOMER: "Cliente", PROFESSIONAL: "Profesional", ADMIN: "Administración" };

const verificationLabel: Record<Me["verificationStatus"], string> = {
  NOT_STARTED: "Sin iniciar",
  PENDING: "En revisión",
  REQUIRES_REVIEW: "En revisión",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  REVOKED: "Revocada",
};

/**
 * Estado de la cuenta y el camino a ACTIVE (docs/BACKEND_BUSINESS_FLOWS.md §1): verificar el email,
 * cargar la foto y verificar la identidad. La foto y la identidad se completan en la etapa 4.
 */
export function AccountStatus({ user }: { user: Me }) {
  if (user.status === "SUSPENDED" || user.status === "BANNED") {
    return (
      <Alert tone="danger" title={user.status === "SUSPENDED" ? "Tu cuenta está suspendida" : "Tu cuenta está bloqueada"}>
        {user.statusReason && <p>Motivo: {user.statusReason}</p>}
        <p>Mientras tanto no podés usar las funciones de la plataforma. Muy pronto vas a poder apelar la decisión desde tu panel.</p>
      </Alert>
    );
  }

  if (user.status === "ACTIVE") {
    return (
      <Alert tone="success" title="Tu cuenta está activa">
        Ya podés usar todas las funciones de tu cuenta.
      </Alert>
    );
  }

  const photoDone = !!user.avatarUrl || !!user.pendingAvatarUrl;
  const identityInReview = user.verificationStatus === "PENDING" || user.verificationStatus === "REQUIRES_REVIEW";

  return (
    <Card className="flex flex-col gap-5 p-5 sm:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-brand-900">Activá tu cuenta</h2>
        <p className="text-sm text-muted">Completá estos pasos para empezar a usar Repara Ya.</p>
      </div>
      <ol className="flex flex-col gap-3">
        <Step
          icon={MailCheck}
          done={user.emailVerified}
          title="Verificá tu email"
          detail={user.emailVerified ? "Listo." : "Abrí el enlace que te enviamos al registrarte."}
          action={!user.emailVerified && <ResendButton />}
        />
        <Step
          icon={Camera}
          done={photoDone}
          title="Cargá tu foto de perfil"
          detail={photoDone ? "Listo." : "Una foto donde se vea bien tu cara."}
          action={
            !photoDone && (
              <ButtonLink href="/panel/cuenta" variant="secondary" size="sm" className="self-start">
                Cargar foto
              </ButtonLink>
            )
          }
        />
        <Step
          icon={Fingerprint}
          done={user.verificationStatus === "APPROVED"}
          pending={identityInReview}
          title="Verificá tu identidad"
          detail={
            identityInReview
              ? "Nuestro equipo la está revisando. Te avisamos cuando esté lista."
              : user.verificationStatus === "REJECTED"
                ? "No pudimos aprobarla. Podés intentarlo de nuevo."
                : "Necesitás el email verificado y la foto cargada."
          }
          action={
            !identityInReview &&
            user.verificationStatus !== "APPROVED" && (
              <ButtonLink href="/panel/verificacion" variant="secondary" size="sm" className="self-start">
                Ir a verificación
              </ButtonLink>
            )
          }
        />
      </ol>
    </Card>
  );
}

function Step({
  icon: Icon,
  done,
  pending = false,
  title,
  detail,
  action,
}: {
  icon: LucideIcon;
  done: boolean;
  pending?: boolean;
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  const StateIcon = done ? CheckCircle2 : pending ? Clock : Circle;
  return (
    <li className={cn("flex flex-col gap-3 rounded-2xl border p-4", done ? "border-success-600/20 bg-success-50/60" : "border-line")}>
      <div className="flex items-start gap-3">
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", done ? "bg-success-600 text-white" : "bg-brand-50 text-brand-700")}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="flex flex-1 flex-col gap-0.5">
          <p className="font-semibold text-ink">{title}</p>
          <p className="text-sm text-muted">{detail}</p>
        </div>
        <StateIcon
          className={cn("size-5 shrink-0", done ? "text-success-600" : pending ? "text-amber-800" : "text-line-strong")}
          aria-label={done ? "Completo" : pending ? "En revisión" : "Pendiente"}
        />
      </div>
      {action}
    </li>
  );
}

export function AccountSummary({ user }: { user: Me }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge tone="brand">{roleLabel[user.role]}</Badge>
      {user.role !== "ADMIN" && user.status === "ACTIVE" && (
        <Badge tone="success">
          <CheckCircle2 className="size-3.5" aria-hidden="true" />
          Tu cuenta está activa
        </Badge>
      )}
      {user.role !== "ADMIN" && (
        <Badge tone={user.verificationStatus === "APPROVED" ? "success" : "neutral"}>
          Identidad: {verificationLabel[user.verificationStatus]}
        </Badge>
      )}
      {(user.status === "SUSPENDED" || user.status === "BANNED") && (
        <Badge tone="danger">
          <Ban className="size-3.5" aria-hidden="true" />
          {user.status === "SUSPENDED" ? "Suspendida" : "Bloqueada"}
        </Badge>
      )}
    </div>
  );
}
