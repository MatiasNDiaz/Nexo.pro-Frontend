import { Check } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { WordsUp } from "@/components/motion/words-up";
import { tradePhotos, type Photo } from "@/content/photos";
import { cn } from "@/lib/cn";

export interface AuthSide {
  photo: Photo;
  /** Frase grande sobre la foto (entra palabra por palabra). */
  heading: string;
  points: string[];
}

const defaultSide: AuthSide = {
  photo: tradePhotos.electricista!,
  heading: "Tus arreglos, con gente que da la cara.",
  points: ["Profesionales con identidad verificada", "Presupuestos y coordinación por chat", "Reseñas de trabajos terminados"],
};

/**
 * Marco de las pantallas de cuenta (ingresar, registrarse, enlaces de email), con el lenguaje del
 * inicio: una foto de oficio a toda la altura con un acercamiento lento, velo azul noche y una frase
 * blanca que entra palabra por palabra; el formulario al lado. En celular la foto es una franja arriba
 * y el formulario se apoya encima. La foto acompaña el scroll en formularios largos (registro).
 */
export function AuthShell({
  title,
  description,
  children,
  wide = false,
  side = defaultSide,
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  wide?: boolean;
  side?: AuthSide;
}) {
  return (
    <div className="relative isolate flex flex-1 flex-col bg-canvas lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <aside
        aria-hidden="true"
        className="relative h-60 overflow-hidden bg-brand-950 text-white sm:h-72 lg:sticky lg:top-16 lg:h-[calc(100svh-4rem)]"
      >
        <Image
          src={side.photo.src}
          alt=""
          fill
          preload
          sizes="(min-width: 1024px) 42vw, 100vw"
          className="object-cover motion-safe:animate-[ken-burns_22s_var(--ease-in-out-strong)_infinite_alternate]"
        />
        <div className="absolute inset-0 bg-brand-950/40" />
        <div className="absolute inset-0 bg-linear-to-t from-brand-950 via-brand-950/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-6 p-6 pb-14 sm:p-10 sm:pb-16 lg:p-12 xl:p-16">
          <p className="max-w-[16ch] font-display text-3xl leading-[0.98] font-bold tracking-[-0.02em] text-white font-stretch-88% sm:text-5xl xl:text-6xl">
            <WordsUp text={side.heading} delay={120} />
          </p>
          <ul className="hidden flex-col gap-3 lg:flex">
            {side.points.map((text, index) => (
              <li
                key={text}
                className="flex items-center gap-3 text-lg text-white animate-fade-up"
                style={{ animationDelay: `${520 + index * 90}ms` }}
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-amber-400 text-brand-900">
                  <Check className="size-4" strokeWidth={3} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className={cn("flex justify-center px-4 pb-12 sm:px-6 lg:px-12 lg:py-16 xl:px-20", !wide && "lg:items-center")}>
        <div className={cn("relative z-1 -mt-10 flex w-full flex-col gap-6 animate-fade-up lg:mt-0", wide ? "max-w-2xl" : "max-w-md")}>
          <div className="flex flex-col gap-2 rounded-t-3xl bg-canvas pt-6 lg:rounded-none lg:bg-transparent lg:pt-0">
            <h1 className="text-4xl leading-[1.02] font-bold text-brand-900 sm:text-5xl">{title}</h1>
            {description && <p className="text-lg text-muted-strong">{description}</p>}
          </div>
          <div className="rounded-3xl border border-line bg-surface p-5 shadow-raised sm:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
