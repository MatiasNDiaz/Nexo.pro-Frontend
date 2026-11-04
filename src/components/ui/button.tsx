import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./spinner";

export type ButtonVariant = "primary" | "accent" | "secondary" | "ghost" | "danger" | "inverse";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap " +
  "transition-[background-color,box-shadow,transform,color] duration-200 ease-out-soft select-none " +
  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-55";

const variants: Record<ButtonVariant, string> = {
  // Acción principal de una pantalla: azul profesional.
  primary: "bg-brand-700 text-white shadow-xs hover:bg-brand-800 hover:shadow-card",
  // Llamado a la acción destacado (uno por vista): ámbar con texto azul noche (7,99:1).
  accent: "bg-amber-400 text-brand-900 shadow-xs hover:bg-amber-500 hover:shadow-cta",
  secondary: "border border-line bg-surface text-brand-800 shadow-xs hover:border-brand-200 hover:bg-brand-50",
  ghost: "text-brand-700 hover:bg-brand-50",
  danger: "bg-danger-600 text-white shadow-xs hover:brightness-95",
  // Sobre fondos azul noche.
  inverse: "bg-white text-brand-900 hover:bg-brand-50",
};

// Alturas mínimas de 44 px en md/lg: áreas táctiles cómodas (WCAG 2.5.8 pide 24 px; 44 es lo recomendado).
const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-13 px-7 text-base",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
}: { variant?: ButtonVariant; size?: ButtonSize; fullWidth?: boolean } = {}): string {
  return cn(base, variants[variant], sizes[size], fullWidth && "w-full");
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Muestra un indicador y bloquea el botón (evita el doble envío). */
  loading?: boolean;
};

export function Button({
  variant,
  size,
  fullWidth,
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonClasses({ variant, size, fullWidth }), className)}
      {...props}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

/** Un enlace con aspecto de botón (navega: no es un <button>). */
export function ButtonLink({ variant, size, fullWidth, className, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonClasses({ variant, size, fullWidth }), className)} {...props} />;
}
