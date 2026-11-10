import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/**
 * Llamado a la acción para profesionales: azul eléctrico con un brillo que lo cruza cada pocos
 * segundos y un halo azul. Al pasar el mouse se vuelve celeste (con texto azul noche: el blanco sobre
 * celeste no llega a 4,5:1), sube un poco y el halo se agranda. Con movimiento reducido, sin brillo.
 * Contrastes: blanco sobre electric-700 6,7:1 · brand-950 sobre electric-400 7,8:1.
 *
 * `pace="slow"`: las transiciones del hover duran medio segundo más (el del héroe, pedido del fundador).
 */
export function ShineLink({ className, children, pace = "normal", ...props }: ComponentProps<typeof Link> & { pace?: "normal" | "slow" }) {
  const slow = pace === "slow";
  return (
    <Link
      className={cn(
        "group/shine relative isolate inline-flex h-13 items-center justify-center gap-2 overflow-hidden rounded-xl px-7 font-semibold whitespace-nowrap",
        "bg-electric-700 text-white ring-1 ring-electric-400/60 shadow-[0_10px_30px_-12px_rgb(59_130_246/0.9)]",
        "transition-[background-color,color,translate,box-shadow] ease-out-soft",
        slow ? "duration-800" : "duration-300",
        "hover:-translate-y-0.5 hover:bg-electric-400 hover:text-brand-950 hover:shadow-[0_16px_44px_-10px_rgb(96_165_250/0.95)]",
        "active:translate-y-0 active:scale-[0.98]",
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="shine-band -z-1 bg-linear-to-r from-transparent via-white/45 to-transparent [animation:shine-sweep_3.2s_var(--ease-in-out-strong)_infinite]" />
      {/* Al pasar el mouse (o enfocar con teclado) cruza un brillo fuerte al instante. */}
      <span
        aria-hidden="true"
        className={cn(
          "shine-hover -z-1 bg-linear-to-r from-transparent via-white/80 to-transparent",
          slow
            ? "group-hover/shine:[animation:shine-once_1100ms_var(--ease-out-soft)] group-focus-visible/shine:[animation:shine-once_1100ms_var(--ease-out-soft)]"
            : "group-hover/shine:[animation:shine-once_600ms_var(--ease-out-soft)] group-focus-visible/shine:[animation:shine-once_600ms_var(--ease-out-soft)]",
        )}
      />
      {children}
      <ArrowRight className={cn("size-5 transition-transform ease-out-soft group-hover/shine:translate-x-1", slow ? "duration-800" : "duration-300")} aria-hidden="true" />
    </Link>
  );
}
