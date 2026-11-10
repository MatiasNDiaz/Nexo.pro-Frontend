"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Flag } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Alert } from "@/components/ui/feedback";
import { Field, Textarea } from "@/components/ui/form-controls";
import { Listbox } from "@/components/ui/listbox";
import { MediaPicker } from "@/components/ui/media-picker";
import { useViewer } from "@/features/session/viewer";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import {
  createReport,
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  MAX_EVIDENCE,
  reasonLabel,
  reportKeys,
  type ReportReason,
  type ReportTarget,
} from "./api";

/** Motivos que tienen sentido según lo que se reporta (el backend acepta cualquiera). */
const reasonsFor: Record<ReportTarget, ReportReason[]> = {
  PROFILE: ["FRAUD", "NO_SHOW", "NOT_AS_AGREED", "DISRESPECT", "HARASSMENT", "DISCRIMINATION", "THREATS", "SPAM", "OTHER"],
  MESSAGE: ["HARASSMENT", "DISRESPECT", "THREATS", "DISCRIMINATION", "FRAUD", "SPAM", "OFFENSIVE_CONTENT", "OTHER"],
  FORUM_POST: ["OFFENSIVE_CONTENT", "SPAM", "DISCRIMINATION", "HARASSMENT", "FRAUD", "OTHER"],
  FORUM_REPLY: ["OFFENSIVE_CONTENT", "SPAM", "DISCRIMINATION", "HARASSMENT", "FRAUD", "OTHER"],
  REVIEW: ["OFFENSIVE_CONTENT", "DISCRIMINATION", "FRAUD", "SPAM", "OTHER"],
};

/**
 * "Reportar": botón discreto que abre el formulario (motivo, qué pasó y hasta 3 fotos). Solo para
 * clientes y profesionales con sesión (el backend lo exige); al resto no se le muestra.
 */
export function ReportButton({
  targetType,
  targetId,
  subject,
  className,
  compact = false,
}: {
  targetType: ReportTarget;
  targetId: string;
  /** Qué se reporta, para el título: "el perfil de Ana", "este mensaje". */
  subject: string;
  className?: string;
  compact?: boolean;
}) {
  const viewer = useViewer();
  const [open, setOpen] = useState(false);
  if (viewer.status !== "authenticated" || viewer.user.role === "ADMIN") return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-muted transition-colors hover:text-danger-600",
          compact ? "h-8 px-1.5" : "h-9 px-2",
          className,
        )}
      >
        <Flag className="size-4" aria-hidden="true" />
        <span className={compact ? "sr-only" : undefined}>Reportar</span>
        {compact && <span className="sr-only"> {subject}</span>}
      </button>
      {open && <ReportDialog targetType={targetType} targetId={targetId} subject={subject} onClose={() => setOpen(false)} />}
    </>
  );
}

function ReportDialog({ targetType, targetId, subject, onClose }: { targetType: ReportTarget; targetId: string; subject: string; onClose: () => void }) {
  const id = useId();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState<ReportReason | "">("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState<{ fileIds: string[]; busy: boolean }>({ fileIds: [], busy: false });
  const [touched, setTouched] = useState(false);

  const report = useMutation({
    mutationFn: () =>
      createReport({
        targetType,
        targetId,
        reason: reason as ReportReason,
        description: description.trim(),
        ...(evidence.fileIds.length ? { evidenceFileIds: evidence.fileIds } : {}),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reportKeys.mine }),
  });

  const reasonError = touched && !reason ? "Elegí un motivo." : undefined;
  const descriptionError =
    touched && description.trim().length < DESCRIPTION_MIN ? `Contanos qué pasó (al menos ${DESCRIPTION_MIN} caracteres).` : undefined;

  return (
    <Dialog open onClose={onClose} title={report.isSuccess ? "Gracias por avisarnos" : `Reportar ${subject}`}>
      {report.isSuccess ? (
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-success-50 text-success-600 animate-[pop-in_260ms_var(--ease-out-soft)]">
            <CheckCircle2 className="size-8" aria-hidden="true" />
          </span>
          <p className="text-muted-strong">Nuestro equipo lo va a revisar. Podés seguir el estado en “Mis reportes” de tu panel.</p>
          <Button onClick={onClose}>Listo</Button>
        </div>
      ) : (
        <form
          noValidate
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            setTouched(true);
            if (!reason || description.trim().length < DESCRIPTION_MIN || evidence.busy) return;
            report.mutate();
          }}
        >
          <p className="text-sm text-muted-strong">La persona no sabe quién la reportó. Si hay un peligro inmediato, llamá al 911.</p>
          <Field id={`${id}-motivo`} label="Motivo" required error={reasonError}>
            {(a11y) => (
              <Listbox
                {...a11y}
                value={reason}
                onChange={(value) => setReason(value as ReportReason)}
                placeholder="Elegí el motivo"
                options={reasonsFor[targetType].map((value) => ({ value, label: reasonLabel[value] }))}
              />
            )}
          </Field>
          <Field id={`${id}-detalle`} label="¿Qué pasó?" required error={descriptionError} hint={`${description.length}/${DESCRIPTION_MAX}`}>
            {(a11y) => <Textarea {...a11y} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={DESCRIPTION_MAX} rows={4} />}
          </Field>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ink">Fotos (opcional)</span>
            <MediaPicker purpose="EVIDENCE" maxImages={MAX_EVIDENCE} onChange={setEvidence} label="Agregar captura" />
          </div>
          {report.isError && (
            <Alert tone="danger">
              {isApiError(report.error, "REPORT_ALREADY_OPEN") ? "Ya reportaste esto y lo estamos revisando." : errorMessage(report.error)}
            </Alert>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="danger" loading={report.isPending} disabled={evidence.busy}>
              {evidence.busy ? "Subiendo fotos…" : "Enviar reporte"}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
