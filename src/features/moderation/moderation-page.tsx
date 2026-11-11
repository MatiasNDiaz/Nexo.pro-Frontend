"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gavel, ShieldCheck, ShieldAlert } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Alert, Badge, EmptyState, Skeleton } from "@/components/ui/feedback";
import { Field, Textarea } from "@/components/ui/form-controls";
import { PanelTitle, SettingsSection } from "@/features/account/settings-section";
import { api, type Schemas } from "@/lib/api/client";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { formatDate } from "@/lib/format";

/*
 * Sanciones, strikes y apelaciones propias (ADR 0029; docs E-129 y E-130). Disponible también con la
 * cuenta suspendida o bloqueada (para poder apelar). Una apelación abierta por objeto.
 */

type Moderation = Schemas["MyModerationDto"];
type Appeal = Schemas["AppealDto"];

const APPEAL_MIN = 10;
const APPEAL_MAX = 2000;
const moderationKey = ["moderation", "me"] as const;

const sanctionLabel: Record<Schemas["SanctionDto"]["type"], string> = {
  WARNING: "Advertencia",
  SUSPENSION: "Suspensión",
  BAN: "Bloqueo de la cuenta",
  PROFILE_HIDDEN: "Perfil oculto del catálogo",
};

const appealStatus: Record<Appeal["status"], { label: string; tone: "electric" | "success" | "danger" }> = {
  OPEN: { label: "En revisión", tone: "electric" },
  ACCEPTED: { label: "Aceptada", tone: "success" },
  REJECTED: { label: "Rechazada", tone: "danger" },
};

export function ModerationPage() {
  const data = useQuery({ queryKey: moderationKey, queryFn: () => api<Moderation>("/moderation/me") });
  const [appealing, setAppealing] = useState<{ strikeId?: string; sanctionId?: string; title: string } | null>(null);

  if (data.isPending) return <Skeleton className="h-96 w-full rounded-3xl" />;
  if (data.isError) return <Alert tone="danger" title="No pudimos cargar tus sanciones">{errorMessage(data.error)}</Alert>;

  const { sanctions, strikes, appeals } = data.data;
  const openAppealFor = (key: "strikeId" | "sanctionId", id: string) => appeals.some((a) => a[key] === id && a.status === "OPEN");
  const activeStrikes = strikes.filter((s) => !s.voided);

  return (
    <div className="flex flex-col gap-8">
      <PanelTitle title="Sanciones y apelaciones" description="Si creés que una medida fue un error, podés apelarla y la revisa otra persona del equipo." />

      {sanctions.length === 0 && strikes.length === 0 && appeals.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="Tu cuenta está en regla" description="No tenés sanciones ni strikes. ¡Gracias por cuidar la comunidad!" />
      ) : (
        <>
          <SettingsSection title="Sanciones" description="Medidas sobre tu cuenta o tu perfil.">
            {sanctions.length === 0 ? (
              <p className="text-sm text-muted">No tenés sanciones.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {sanctions.map((sanction) => (
                  <li key={sanction.id} className="flex flex-col gap-3 rounded-2xl bg-canvas p-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-3">
                      <ShieldAlert className={sanction.active ? "mt-0.5 size-5 shrink-0 text-danger-600" : "mt-0.5 size-5 shrink-0 text-muted"} aria-hidden="true" />
                      <div className="flex flex-col gap-1">
                        <span className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                          {sanctionLabel[sanction.type]}
                          <Badge tone={sanction.active ? "danger" : "neutral"}>{sanction.active ? "Vigente" : sanction.liftedAt ? "Levantada" : "Terminada"}</Badge>
                        </span>
                        <p className="text-sm text-muted-strong">{sanction.reason}</p>
                        <p className="text-xs text-muted">
                          Desde el {formatDate(sanction.startsAt)}
                          {sanction.endsAt ? ` hasta el ${formatDate(sanction.endsAt)}` : sanction.active ? ", sin fecha de fin" : ""}
                        </p>
                      </div>
                    </div>
                    {sanction.active &&
                      (openAppealFor("sanctionId", sanction.id) ? (
                        <Badge tone="electric">Apelación en revisión</Badge>
                      ) : (
                        <Button size="sm" variant="secondary" className="shrink-0" onClick={() => setAppealing({ sanctionId: sanction.id, title: sanctionLabel[sanction.type] })}>
                          Apelar
                        </Button>
                      ))}
                  </li>
                ))}
              </ul>
            )}
          </SettingsSection>

          <SettingsSection title="Strikes" description={`Tenés ${activeStrikes.reduce((sum, s) => sum + s.weight, 0)} punto(s) vigente(s). Al acumular puntos, la cuenta se puede suspender.`}>
            {strikes.length === 0 ? (
              <p className="text-sm text-muted">No tenés strikes.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {strikes.map((strike) => (
                  <li key={strike.id} className="flex flex-col gap-3 rounded-2xl bg-canvas p-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                        {strike.weight} {strike.weight === 1 ? "punto" : "puntos"}
                        {strike.voided && <Badge tone="success">Anulado</Badge>}
                      </span>
                      <p className="text-sm text-muted-strong">{strike.reason}</p>
                      {strike.voided && strike.voidReason && <p className="text-xs text-muted">Motivo de la anulación: {strike.voidReason}</p>}
                      <p className="text-xs text-muted">{formatDate(strike.createdAt)}</p>
                    </div>
                    {!strike.voided &&
                      (openAppealFor("strikeId", strike.id) ? (
                        <Badge tone="electric">Apelación en revisión</Badge>
                      ) : (
                        <Button size="sm" variant="secondary" className="shrink-0" onClick={() => setAppealing({ strikeId: strike.id, title: `Strike de ${strike.weight} punto(s)` })}>
                          Apelar
                        </Button>
                      ))}
                  </li>
                ))}
              </ul>
            )}
          </SettingsSection>

          {appeals.length > 0 && (
            <SettingsSection title="Tus apelaciones">
              <ul className="flex flex-col gap-3">
                {appeals.map((appeal) => {
                  const status = appealStatus[appeal.status];
                  return (
                    <li key={appeal.id} className="flex flex-col gap-2 rounded-2xl bg-canvas p-4">
                      <span className="flex flex-wrap items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                          <Gavel className="size-4 text-brand-600" aria-hidden="true" />
                          {formatDate(appeal.createdAt)}
                        </span>
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </span>
                      <p className="text-sm whitespace-pre-line text-muted-strong">{appeal.body}</p>
                      {appeal.decisionNote && (
                        <p className="rounded-xl bg-surface px-3 py-2 text-sm text-ink">
                          <span className="font-semibold">Respuesta del equipo:</span> {appeal.decisionNote}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </SettingsSection>
          )}
        </>
      )}

      {appealing && <AppealDialog target={appealing} onClose={() => setAppealing(null)} />}
    </div>
  );
}

function AppealDialog({ target, onClose }: { target: { strikeId?: string; sanctionId?: string; title: string }; onClose: () => void }) {
  const id = useId();
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [touched, setTouched] = useState(false);
  const appeal = useMutation({
    mutationFn: () =>
      api<Appeal>("/moderation/appeals", {
        method: "POST",
        body: { body: body.trim(), ...(target.strikeId ? { strikeId: target.strikeId } : { sanctionId: target.sanctionId }) },
      }),
    meta: { success: { title: "Enviamos tu apelación", description: "Nuestro equipo la revisa y te avisamos lo que decida." } },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: moderationKey });
      onClose();
    },
  });
  return (
    <Dialog open onClose={onClose} title={`Apelar: ${target.title}`} description="Contanos por qué creés que fue un error. Lo revisa otra persona del equipo.">
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setTouched(true);
          if (body.trim().length >= APPEAL_MIN) appeal.mutate();
        }}
      >
        <Field
          id={`${id}-texto`}
          label="Tu apelación"
          required
          error={touched && body.trim().length < APPEAL_MIN ? `Escribí al menos ${APPEAL_MIN} caracteres.` : undefined}
          hint={`${body.length}/${APPEAL_MAX}`}
        >
          {(a11y) => <Textarea {...a11y} value={body} onChange={(e) => setBody(e.target.value)} maxLength={APPEAL_MAX} rows={5} />}
        </Field>
        {appeal.isError && (
          <Alert tone="danger">{isApiError(appeal.error, "APPEAL_ALREADY_OPEN") ? "Ya tenés una apelación en revisión para esto." : errorMessage(appeal.error)}</Alert>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={appeal.isPending}>
            Enviar apelación
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
