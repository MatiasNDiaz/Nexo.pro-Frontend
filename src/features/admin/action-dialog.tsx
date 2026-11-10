"use client";

import { useMutation } from "@tanstack/react-query";
import { useId, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Alert } from "@/components/ui/feedback";
import { Field, Textarea } from "@/components/ui/form-controls";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { REASON_MAX, REASON_MIN } from "./api";

/** Errores del backend con un texto mejor que el suyo (el suyo nombra estados en inglés). */
export function adminErrorMessage(error: unknown): string {
  if (isApiError(error, "INVALID_STATE_TRANSITION")) return "La cuenta cambió mientras tanto y esta acción ya no corresponde. Recargá la ficha.";
  if (isApiError(error, "CANNOT_MODIFY_ADMIN")) return "Esta acción no se puede aplicar a una cuenta de administración.";
  if (isApiError(error, "INVALID_END_DATE")) return "La fecha de fin tiene que ser en el futuro.";
  if (isApiError(error, "DELETION_ALREADY_SCHEDULED")) return "La cuenta ya tiene una baja en curso.";
  return errorMessage(error);
}

/**
 * Diálogo de una acción del admin: campos propios (opcionales) + motivo obligatorio, que queda en la
 * auditoría. `validate` devuelve un error para frenar el envío; `run` recibe el motivo ya recortado.
 * Al terminar bien cierra y avisa con `onDone(mensaje)`.
 */
export function ActionDialog({
  title,
  description,
  confirmLabel,
  tone = "primary",
  reasonLabel = "Motivo",
  reasonHint = "Queda en el registro de auditoría.",
  minReason = REASON_MIN,
  children,
  validate,
  run,
  errorFor,
  done,
  onClose,
  onDone,
}: {
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  tone?: "primary" | "danger";
  reasonLabel?: string;
  reasonHint?: string;
  minReason?: number;
  children?: ReactNode;
  validate?: () => string | null;
  run: (reason: string) => Promise<unknown>;
  /** Mensaje propio para algún error (null: el común). */
  errorFor?: (error: unknown) => string | null;
  /** Lo que se le muestra al admin cuando sale bien. */
  done: string;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const id = useId();
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const action = useMutation({
    mutationFn: () => run(reason.trim()),
    onSuccess: () => onDone(done),
  });

  const trimmed = reason.trim().length;
  const reasonError = touched && trimmed < minReason ? `Escribí el motivo (al menos ${minReason} caracteres).` : undefined;

  return (
    <Dialog open onClose={onClose} title={title} description={description}>
      <form
        noValidate
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          setTouched(true);
          const problem = validate?.() ?? null;
          setFormError(problem);
          if (problem || trimmed < minReason) return;
          action.mutate();
        }}
      >
        {children}
        <Field id={`${id}-motivo`} label={reasonLabel} required error={reasonError} hint={`${reasonHint} ${reason.length}/${REASON_MAX}`}>
          {(a11y) => <Textarea {...a11y} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={REASON_MAX} rows={3} />}
        </Field>
        {formError && <Alert tone="danger">{formError}</Alert>}
        {action.isError && <Alert tone="danger">{errorFor?.(action.error) ?? adminErrorMessage(action.error)}</Alert>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant={tone} loading={action.isPending}>
            {confirmLabel}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
