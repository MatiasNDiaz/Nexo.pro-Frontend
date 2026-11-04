import { CheckCircle2, CircleAlert, Loader2, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  pending: { icon: Loader2, box: "bg-brand-50 text-brand-700", spin: true },
  success: { icon: CheckCircle2, box: "bg-success-50 text-success-600", spin: false },
  error: { icon: CircleAlert, box: "bg-danger-50 text-danger-600", spin: false },
} satisfies Record<string, { icon: LucideIcon; box: string; spin: boolean }>;

/** Resultado de una acción de enlace de email (verificar, cerrar sesión, vincular). */
export function LinkResult({
  tone,
  title,
  children,
  actions,
}: {
  tone: keyof typeof tones;
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  const { icon: Icon, box, spin } = tones[tone];
  return (
    <div className="flex flex-col items-center gap-4 py-2 text-center" role={tone === "error" ? "alert" : "status"}>
      <span className={cn("grid size-14 place-items-center rounded-2xl", box)}>
        <Icon className={cn("size-7", spin && "animate-spin")} aria-hidden="true" />
      </span>
      <h2 className="text-2xl font-bold text-brand-900">{title}</h2>
      {children && <div className="flex flex-col gap-2 text-muted">{children}</div>}
      {actions && <div className="flex w-full flex-col gap-2 pt-2">{actions}</div>}
    </div>
  );
}
