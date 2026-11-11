import { ArrowRight, ClipboardCheck, MessageSquareText, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { scenes } from "@/content/photos";

const delay = (ms: number) => ({ "--stage-delay": `${ms}ms` }) as CSSProperties;

const steps = [
  { icon: Search, label: "Buscá" },
  { icon: MessageSquareText, label: "Pedí presupuesto" },
  { icon: ClipboardCheck, label: "Seguí el trabajo" },
] as const;

/**
 * Cierre del inicio (pedido del fundador: más vida). Una banda ámbar —el color de los botones del
 * sitio— con la foto cortada en diagonal: entra al aparecer en pantalla, los tres pasos se encienden
 * uno detrás de otro y quedan los dos caminos. Texto azul noche sobre ámbar: 8,9:1.
 */
export function FinalCta() {
  return (
    <section aria-labelledby="empeza" className="bg-surface py-16 sm:py-24">
      <div className="container-page">
        <div data-reveal="stage" className="relative isolate overflow-hidden rounded-[2rem] bg-amber-400 text-brand-900">
          {/* La foto: a la derecha en escritorio (corte diagonal), arriba en celular. */}
          {/* Afuera el corte en diagonal (fijo); adentro la entrada (otro clip-path, no se pisan). */}
          <div className="relative h-56 sm:h-72 lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[46%] lg:[clip-path:polygon(18%_0,100%_0,100%_100%,0_100%)]">
            <div className="stage-clip absolute inset-0" style={delay(150)}>
              <Image src={scenes.lampara.src} alt={scenes.lampara.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" quality={75} className="object-cover" style={{ objectPosition: "60% 35%" }} />
            </div>
          </div>

          <div className="relative flex flex-col items-start gap-7 p-7 sm:p-12 lg:w-[58%] lg:p-16">
            <h2 id="empeza" className="stage-in max-w-[13ch] text-4xl leading-[1.02] font-bold sm:text-6xl" style={delay(0)}>
              ¿Tenés algo para arreglar?
            </h2>
            <p className="stage-in max-w-[42ch] text-lg leading-relaxed font-medium text-brand-900/85" style={delay(120)}>
              Encontrá a alguien de confianza cerca tuyo. Crear tu cuenta es gratis y no pagás nada por pedir presupuestos.
            </p>

            <ol className="flex flex-wrap items-center gap-2">
              {steps.map((step, index) => (
                <li key={step.label} className="flex items-center gap-2">
                  <span className="stage-glow inline-flex items-center gap-2 rounded-full bg-brand-900 px-4 py-2 text-sm font-semibold text-white" style={delay(450 + index * 260)}>
                    <step.icon className="size-4 text-amber-400" aria-hidden="true" />
                    {step.label}
                  </span>
                  {index < steps.length - 1 && <ArrowRight className="size-4 shrink-0 text-brand-900/60" aria-hidden="true" />}
                </li>
              ))}
            </ol>

            <div className="stage-in flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center" style={delay(1250)}>
              <Link
                href="/profesionales"
                className="group inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-brand-900 px-7 font-semibold text-white shadow-[0_14px_30px_-14px_rgb(7_21_42/0.8)] transition-[background-color,translate] duration-200 ease-out-soft hover:-translate-y-0.5 hover:bg-brand-800 active:translate-y-0"
              >
                Buscar un profesional
                <ArrowRight className="size-5 transition-transform duration-200 ease-out-soft group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link
                href="/registro"
                className="inline-flex h-13 items-center justify-center rounded-xl px-7 font-semibold text-brand-900 ring-2 ring-brand-900/80 transition-[background-color,color] duration-200 ease-out-soft ring-inset hover:bg-brand-900 hover:text-white"
              >
                Crear mi cuenta gratis
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
