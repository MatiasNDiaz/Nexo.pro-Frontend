import { BadgeCheck, MessagesSquare, Star } from "lucide-react";
import type { ReactNode } from "react";
import { revealDelay } from "@/components/motion/reveal";
import { cn } from "@/lib/cn";

const highlights = [
  { icon: BadgeCheck, text: "Profesionales con identidad verificada" },
  { icon: MessagesSquare, text: "Presupuestos y coordinación por chat" },
  { icon: Star, text: "Reseñas de trabajos terminados" },
];

/**
 * Marco de las pantallas de cuenta (ingresar, registrarse, enlaces de email). En celular, solo la
 * tarjeta del formulario; desde escritorio, un panel de marca al costado.
 */
export function AuthShell({
  title,
  description,
  children,
  wide = false,
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="relative isolate flex flex-1 bg-linear-to-b from-brand-50 to-canvas">
      <div
        className={cn(
          "container-page grid flex-1 items-start gap-10 py-8 sm:py-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-16",
          !wide && "lg:items-center",
        )}
      >
        <aside
          aria-hidden="true"
          className={cn(
            "relative hidden overflow-hidden rounded-3xl bg-brand-900 p-10 text-white shadow-raised lg:flex lg:min-h-[32rem] lg:flex-col lg:justify-between",
            // Con formularios largos, el panel acompaña el scroll en vez de quedar flotando al medio.
            wide && "lg:sticky lg:top-24 lg:mt-24",
          )}
        >
          <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-electric-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-16 size-72 rounded-full bg-brand-500/30 blur-3xl" />
          <p className="relative font-display text-3xl leading-tight font-bold">
            Todo lo que necesitás para resolver tus arreglos, <span className="text-electric-400">en un solo lugar.</span>
          </p>
          <ul className="relative flex flex-col gap-3">
            {highlights.map((item, index) => (
              <li
                key={item.text}
                data-reveal="left"
                style={revealDelay(index, 120)}
                className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-brand-700">
                  <item.icon className="size-5" />
                </span>
                <span className="font-medium text-brand-100">{item.text}</span>
              </li>
            ))}
          </ul>
        </aside>

        <div className={`mx-auto flex w-full flex-col gap-6 animate-fade-up ${wide ? "max-w-2xl" : "max-w-md"}`}>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-brand-900">{title}</h1>
            {description && <p className="text-muted-strong">{description}</p>}
          </div>
          <div className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
