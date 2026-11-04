import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/**
 * Superficie blanca con borde y sombra suave. `interactive` agrega la elevación al pasar el mouse
 * (para tarjetas que son un enlace entero).
 */
export function Card({ className, interactive = false, ...props }: ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-surface shadow-card",
        interactive &&
          "transition-[transform,box-shadow,border-color] duration-300 ease-out-soft hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-raised",
        className,
      )}
      {...props}
    />
  );
}

/** Iniciales sobre azul cuando no hay foto (la foto real llega con la subida de archivos). */
export function Avatar({ name, size = "md", className }: { name: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const sizes = { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-14 text-lg" };
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full bg-linear-to-br from-brand-600 to-brand-800 font-semibold text-white",
        sizes[size],
        className,
      )}
    >
      {initials || "?"}
    </span>
  );
}
