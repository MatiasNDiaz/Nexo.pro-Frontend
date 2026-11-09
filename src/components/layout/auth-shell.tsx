import { BadgeCheck } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { photos } from "@/content/photos";
import { cn } from "@/lib/cn";

const highlights = ["Profesionales con identidad verificada", "Presupuestos y coordinación por chat", "Reseñas de trabajos terminados"];

/**
 * Marco de las pantallas de cuenta (ingresar, registrarse, enlaces de email): el formulario y una
 * foto de oficio. En celular, la foto es una franja baja arriba; desde escritorio, un panel al costado.
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
  const photo = photos.electricista;
  return (
    <div className="relative isolate flex flex-1 flex-col bg-canvas lg:flex-row">
      <div aria-hidden="true" className="relative h-32 overflow-hidden bg-brand-950 sm:h-40 lg:hidden">
        <Image src={photo.src} alt="" fill sizes="100vw" className="object-cover opacity-80" />
        <div className="absolute inset-0 bg-linear-to-t from-canvas to-transparent" />
      </div>
      <div
        className={cn(
          "container-page grid flex-1 items-start gap-10 pb-10 sm:pb-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:py-16",
          !wide && "lg:items-center",
        )}
      >
        <aside
          aria-hidden="true"
          className={cn(
            "relative hidden overflow-hidden rounded-3xl bg-brand-950 text-white lg:flex lg:min-h-[34rem] lg:flex-col lg:justify-end",
            // Con formularios largos, el panel acompaña el scroll en vez de quedar flotando al medio.
            wide && "lg:sticky lg:top-24",
          )}
        >
          <Image src={photo.src} alt="" fill sizes="40vw" className="object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-brand-950/95 via-brand-950/55 to-brand-950/10" />
          <div className="relative flex flex-col gap-6 p-10">
            <p className="max-w-[18ch] font-display text-4xl leading-[1.02] font-bold">Tus arreglos, con gente que da la cara.</p>
            <ul className="flex flex-col gap-2.5">
              {highlights.map((text) => (
                <li key={text} className="flex items-center gap-2.5 text-brand-100">
                  <BadgeCheck className="size-5 shrink-0 text-electric-400" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className={`mx-auto -mt-6 flex w-full flex-col gap-6 animate-fade-up lg:mt-0 ${wide ? "max-w-2xl" : "max-w-md"}`}>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl leading-[1.02] font-bold text-brand-900">{title}</h1>
            {description && <p className="text-muted-strong">{description}</p>}
          </div>
          <div className="rounded-3xl border border-line bg-surface p-5 sm:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
