import { env } from "@/config/env";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/** "G" de Google con sus colores (marca de Google, usada según sus pautas para el botón de acceso). */
export function GoogleMark({ className = "size-5", label }: { className?: string; label?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}>
      {label && <title>{label}</title>}
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.56-5.17 3.56-8.81z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.27v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.28 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.27a12 12 0 0 0 0 10.76l4.01-3.1z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.94 11.94 0 0 0 12 0 12 12 0 0 0 1.27 6.62l4.01 3.1C6.22 6.88 8.87 4.77 12 4.77z" />
    </svg>
  );
}

/**
 * Ingresar o registrarse con Google. Es una NAVEGACIÓN a la API (no un fetch): la API redirige a
 * Google y, a la vuelta, a /ingresar/google con el resultado. No se muestra si Google está apagado.
 */
export function GoogleButton({ label = "Continuar con Google" }: { label?: string }) {
  if (!env.googleLogin) return null;
  return (
    <a href={`${env.apiBaseUrl}/auth/google`} className={cn(buttonClasses({ variant: "secondary", fullWidth: true }))}>
      <GoogleMark />
      {label}
    </a>
  );
}

/** Separador "o" entre el acceso con Google y el formulario. */
export function AuthDivider() {
  if (!env.googleLogin) return null;
  return (
    <div className="flex items-center gap-3 text-sm text-muted" role="separator">
      <span className="h-px flex-1 bg-line" />o<span className="h-px flex-1 bg-line" />
    </div>
  );
}
