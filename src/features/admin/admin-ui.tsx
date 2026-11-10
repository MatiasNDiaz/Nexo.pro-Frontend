"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { Alert } from "@/components/ui/feedback";
import { cn } from "@/lib/cn";

/** Pestañas de filtro (botones con aria-pressed), como las del buscador de usuarios. */
export function FilterTabs<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <span id={id} className="text-sm font-medium text-ink">
        {label}
      </span>
      <div role="group" aria-labelledby={id} className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn("h-10 rounded-xl px-4 text-sm font-semibold transition-colors", value === option.value ? "bg-brand-700 text-white" : "text-brand-800 hover:bg-brand-50")}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Anterior / siguiente para las colas (el estado vive en la pantalla). */
export function PageControls({ page, total, pageSize, onPage }: { page: number; total: number; pageSize: number; onPage: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const button = "inline-flex h-11 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-brand-800 hover:bg-brand-50 disabled:pointer-events-none disabled:opacity-40";
  return (
    <nav aria-label="Páginas" className="flex items-center justify-center gap-2">
      <button type="button" className={button} disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <ChevronLeft className="size-4" aria-hidden="true" />
        Anterior
      </button>
      <span className="text-sm text-muted-strong tabular-nums">
        Página {page} de {pages}
      </span>
      <button type="button" className={button} disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Siguiente
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  );
}

/** Aviso de que una acción salió bien: se lleva el foco para que el lector de pantalla lo lea. */
export function Notice({ message }: { message: string | null }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (message) ref.current?.focus();
  }, [message]);
  if (!message) return null;
  return (
    <div ref={ref} tabIndex={-1} className="outline-none">
      <Alert tone="success">{message}</Alert>
    </div>
  );
}
