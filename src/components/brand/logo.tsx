import { cn } from "@/lib/cn";

/** Isotipo: un techo (el hogar) con un tilde ámbar (resuelto). */
export function LogoMark({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  // Un id de degradado por variante: el header y el footer muestran el logo a la vez y los ids
  // del documento no se pueden repetir.
  const gradientId = `logo-bg-${tone}`;
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={tone === "light" ? "#1d4a91" : "#2e5ea8"} />
          <stop offset="1" stopColor={tone === "light" ? "#0b1f3a" : "#123b7a"} />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gradientId})`} />
      <path d="M7.5 15.5 16 8.5l8.5 7" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m11.5 18.8 3.3 3.2 6-6.2" fill="none" stroke="#f4a340" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Isotipo + nombre. `tone="dark"` para fondos azul noche. */
export function Logo({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark tone={tone} />
      <span
        className={cn(
          "font-display text-lg font-bold tracking-tight",
          tone === "light" ? "text-brand-900" : "text-white",
        )}
      >
        Repara <span className={tone === "light" ? "text-brand-600" : "text-electric-400"}>Ya</span>
      </span>
    </span>
  );
}
