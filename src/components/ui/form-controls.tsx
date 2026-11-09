import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Controles de formulario sobre elementos nativos (teclado, autocompletado y teclados móviles
 * funcionan sin JavaScript extra). Fondo blanco y borde line-strong (3,08:1) para que el control se
 * distinga; texto de 16 px para que iOS no haga zoom al enfocar.
 */
const control =
  "w-full rounded-xl border border-line-strong bg-surface px-3.5 text-base text-ink shadow-xs " +
  "placeholder:text-muted transition-[border-color,box-shadow] duration-150 " +
  "hover:border-brand-400 focus:border-electric-500 focus:outline-none focus:ring-4 focus:ring-electric-500/20 " +
  "disabled:cursor-not-allowed disabled:bg-canvas disabled:text-muted " +
  "aria-invalid:border-danger-600 aria-invalid:focus:ring-danger-600/15";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-11", className)} {...props} />;
}

export function Textarea({ className, rows = 4, ...props }: ComponentProps<"textarea">) {
  return <textarea rows={rows} className={cn(control, "min-h-24 py-2.5 leading-relaxed", className)} {...props} />;
}

// Los desplegables son propios (ui/listbox.tsx y ui/form-listbox.tsx), no <select>: el nativo no
// toma la estética de la página.

export function Checkbox({ className, label, ...props }: Omit<ComponentProps<"input">, "type"> & { label: ReactNode }) {
  return (
    <label className={cn("flex min-h-11 cursor-pointer items-start gap-3 py-2 text-sm text-ink", className)}>
      <input type="checkbox" className="mt-0.5 size-5 shrink-0 cursor-pointer accent-brand-700" {...props} />
      <span>{label}</span>
    </label>
  );
}

interface FieldProps {
  /** Id del control: une la etiqueta, la ayuda y el error. */
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  /** Recibe los atributos de accesibilidad que tiene que llevar el control. */
  children: (control: { id: string; "aria-describedby"?: string; "aria-invalid"?: true }) => ReactNode;
}

/**
 * Etiqueta + control + ayuda + error. El error se anuncia (role="alert") y el control queda marcado
 * con aria-invalid y aria-describedby, así el lector de pantalla lee el problema al enfocarlo.
 */
export function Field({ id, label, hint, error, required, className, children }: FieldProps) {
  const hintId = hint ? `${id}-ayuda` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required && (
          <span className="ml-0.5 text-danger-600" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {hint && !error && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="flex items-start gap-1.5 text-sm font-medium text-danger-600">
          {error}
        </p>
      )}
    </div>
  );
}
