import { AlertTriangle, CheckCircle2, Info, XCircle, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "info" | "success" | "warning" | "danger";

const alertTones: Record<Tone, { box: string; icon: LucideIcon; iconColor: string }> = {
  info: { box: "border-brand-100 bg-brand-50 text-brand-900", icon: Info, iconColor: "text-brand-600" },
  success: { box: "border-success-600/20 bg-success-50 text-success-800", icon: CheckCircle2, iconColor: "text-success-600" },
  warning: { box: "border-amber-100 bg-amber-50 text-amber-800", icon: AlertTriangle, iconColor: "text-amber-800" },
  danger: { box: "border-danger-600/20 bg-danger-50 text-danger-600", icon: XCircle, iconColor: "text-danger-600" },
};

/**
 * Mensaje en línea. Los errores se anuncian de inmediato (role="alert"); el resto, con cortesía
 * (role="status"), para no interrumpir al lector de pantalla.
 */
export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const { box, icon: Icon, iconColor } = alertTones[tone];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("flex gap-3 rounded-xl border p-4 text-sm", box, className)}>
      <Icon className={cn("mt-0.5 size-5 shrink-0", iconColor)} aria-hidden="true" />
      <div className="flex flex-col gap-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}

const badgeTones = {
  neutral: "bg-brand-50 text-brand-800 ring-brand-100",
  brand: "bg-brand-700 text-white ring-brand-700",
  electric: "bg-electric-50 text-electric-700 ring-electric-100",
  amber: "bg-amber-50 text-amber-800 ring-amber-100",
  success: "bg-success-50 text-success-800 ring-success-600/20",
  danger: "bg-danger-50 text-danger-600 ring-danger-600/20",
} as const;

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: keyof typeof badgeTones;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Lugar reservado mientras carga: mantiene el tamaño final y evita saltos de layout. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-lg bg-brand-100/70", className)} />;
}

/**
 * Estado vacío: explica qué pasa y cuál es el siguiente paso. `headingLevel={1}` cuando es el
 * contenido principal de la página (p. ej. "no encontrado"): toda página necesita su h1.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  headingLevel = 2,
}: {
  icon: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  headingLevel?: 1 | 2;
}) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-surface px-6 py-12 text-center",
        className,
      )}
    >
      <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <Heading className="text-lg font-semibold text-ink">{title}</Heading>
      {description && <p className="max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
