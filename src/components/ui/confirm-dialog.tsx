"use client";

import type { ReactNode } from "react";
import { Button } from "./button";
import { Dialog } from "./dialog";
import { Alert } from "./feedback";
import { FeedbackIcon } from "./feedback-icon";

/**
 * Confirmación de una acción (estilo SweetAlert, con la interfaz del sitio): ícono animado, la
 * pregunta y dos botones. `danger` para lo que no se deshace (borrar, rechazar); `primary` para
 * confirmar un paso importante.
 */
export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel,
  cancelLabel = "Volver",
  onConfirm,
  pending = false,
  error,
  tone = "danger",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  pending?: boolean;
  error?: string | null;
  tone?: "danger" | "primary";
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      role="alertdialog"
      icon={
        <FeedbackIcon
          tone={tone === "danger" ? "warning" : "question"}
          size="lg"
        />
      }
    >
      <div className="flex flex-col gap-4">
        {error && (
          <Alert tone="danger" className="text-left">
            {error}
          </Alert>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <Button variant="ghost" onClick={onClose} className="sm:min-w-32">
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            loading={pending}
            className="sm:min-w-32"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
