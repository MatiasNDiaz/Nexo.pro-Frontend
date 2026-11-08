"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Alert } from "@/components/ui/feedback";
import { Field, Textarea } from "@/components/ui/form-controls";
import { formatDate, formatMoney } from "@/lib/format";
import { REASON_MAX, type Quote } from "./api";

/** Presupuesto: importe, detalle y fecha propuesta (texto del profesional, siempre como texto). */
export function QuoteSummary({ quote, title = "Presupuesto" }: { quote: Quote; title?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100">
      <p className="text-sm font-medium text-amber-800">{title}</p>
      <p className="text-2xl font-bold text-brand-900">{formatMoney(quote.amount) ?? `${quote.amount} ${quote.currency}`}</p>
      {quote.description && <p className="text-sm whitespace-pre-line text-ink [overflow-wrap:anywhere]">{quote.description}</p>}
      {quote.proposedDate && <p className="text-sm text-muted">Fecha propuesta: {formatDate(quote.proposedDate)}</p>}
    </div>
  );
}

interface ReasonDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  pending: boolean;
  error: string | null;
  onConfirm: (reason: string) => void;
}

/** Confirmar una cancelación con un motivo opcional (ReasonDto: hasta 300 caracteres). */
export function ReasonDialog({ open, onClose, title, description, confirmLabel, pending, error, onConfirm }: ReasonDialogProps) {
  const id = useId();
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onClose={onClose} title={title} description={description}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onConfirm(reason);
        }}
        className="flex flex-col gap-4"
      >
        {error && <Alert tone="danger">{error}</Alert>}
        <Field id={`${id}-motivo`} label="Motivo (opcional)" hint={`${reason.length}/${REASON_MAX}`}>
          {(a11y) => (
            <Textarea {...a11y} value={reason} onChange={(event) => setReason(event.target.value)} maxLength={REASON_MAX} rows={3} />
          )}
        </Field>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Volver
          </Button>
          <Button type="submit" variant="danger" loading={pending}>
            {confirmLabel}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
