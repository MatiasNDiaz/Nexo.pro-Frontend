import { BadgeCheck, CalendarCheck, Images, Inbox, MessageSquareText, Star } from "lucide-react";
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { scenes } from "@/content/photos";
import { cn } from "@/lib/cn";
import { ShineLink } from "./shine-link";

const delay = (ms: number) => ({ "--stage-delay": `${ms}ms` }) as CSSProperties;

/** El recorrido del profesional: lo que pasa, en orden (todo existe hoy en la plataforma). */
const steps = [
  {
    icon: Images,
    title: "Armás tu página",
    text: "Tus fotos de trabajos, tus oficios, las zonas donde trabajás y tus horarios. Con Medium y Premium, también tus colores.",
  },
  {
    icon: MessageSquareText,
    title: "Te llegan pedidos de tu zona",
    text: "Los clientes te escriben por chat con fotos del problema. Respondés con tu presupuesto, sin compartir tu número.",
  },
  {
    icon: Star,
    title: "Cada trabajo suma",
    text: "Agendás, empezás y terminás desde tu panel. Al final, el cliente deja su reseña: solo opinan quienes te contrataron.",
  },
] as const;

/**
 * "¿Sos profesional?" (pedido del fundador: que no sea plano). Un solo momento animado al entrar en
 * pantalla: el retrato se descubre de abajo hacia arriba, el recorrido se dibuja paso a paso y
 * alrededor del retrato aparecen piezas de la plataforma (un pedido, el estado, una reseña) que
 * después flotan despacio. Las piezas son ilustrativas (aria-hidden): lo que dicen está en el texto.
 */
export function ProIntro() {
  return (
    <div data-reveal="stage" className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20">
      <div className="flex flex-col items-start gap-7">
        <h2 id="para-profesionales" className="max-w-[15ch] text-4xl leading-[1.02] font-bold text-balance sm:text-6xl">
          <span className="stage-in block" style={delay(0)}>
            ¿Sos profesional?
          </span>
          <span className="stage-in block text-amber-400" style={delay(120)}>
            Que te encuentren los que te buscan.
          </span>
        </h2>
        <p className="stage-in max-w-[46ch] text-lg leading-relaxed text-brand-200" style={delay(240)}>
          Repara Ya te muestra a los clientes de tus zonas que necesitan tu oficio, con tu identidad verificada y tus trabajos a la vista.
        </p>

        {/* El recorrido: la línea une los pasos y se dibuja de arriba hacia abajo. */}
        <ol className="relative flex flex-col gap-6 pl-1">
          <span aria-hidden="true" className="stage-line absolute top-3 bottom-3 left-[1.375rem] w-px origin-top bg-linear-to-b from-amber-400 via-electric-400/70 to-transparent" style={delay(300)} />
          {steps.map((step, index) => (
            <li key={step.title} className="stage-in relative flex gap-4" style={delay(380 + index * 160)}>
              <span className="relative z-1 grid size-11 shrink-0 place-items-center rounded-full bg-brand-900 text-amber-400 ring-1 ring-white/15">
                <step.icon className="size-5" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1 pt-1.5">
                <h3 className="font-display text-xl font-bold text-white">{step.title}</h3>
                <p className="max-w-[44ch] leading-relaxed text-brand-200">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="stage-in flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center" style={delay(900)}>
          <ShineLink href="/registro?rol=profesional">Crear mi perfil profesional</ShineLink>
          <p className="flex items-center gap-2 text-sm font-medium text-brand-100">
            <CalendarCheck className="size-5 shrink-0 text-amber-400" aria-hidden="true" />
            30 días de prueba con las funciones de Basic
          </p>
        </div>
      </div>

      {/* El retrato y las piezas de la plataforma alrededor. */}
      <div aria-hidden="true" className="relative mx-auto w-full max-w-md lg:max-w-none">
        <div className="stage-clip relative aspect-[4/5] overflow-hidden rounded-3xl bg-brand-900 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7)]" style={delay(150)}>
          <Image src={scenes.artesano.src} alt="" fill sizes="(min-width: 1024px) 40vw, 90vw" quality={75} className="object-cover" style={{ objectPosition: "50% 30%" }} />
          <div className="absolute inset-0 bg-linear-to-t from-brand-950/60 via-transparent to-transparent" />
        </div>

        <Chip className="-left-3 top-8 sm:-left-10" enter={700} float="0s">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-800">
            <Inbox className="size-5" />
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-semibold text-ink">Nuevo pedido de presupuesto</span>
            <span className="text-xs text-muted-strong">Pérdida de agua en el baño · tu zona</span>
          </span>
          <span className="absolute -top-1 -right-1 size-3 rounded-full bg-amber-400 ring-2 ring-surface motion-safe:animate-pulse" />
        </Chip>

        <Chip className="top-[44%] -right-2 sm:-right-8" enter={900} float="1.4s">
          <span className="size-2.5 rounded-full bg-success-600 ring-4 ring-success-600/20" />
          <span className="text-sm font-semibold text-success-800">Disponible ya</span>
        </Chip>

        <Chip className="bottom-10 -left-2 sm:-left-12" enter={1100} float="2.6s">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <BadgeCheck className="size-5" />
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-semibold text-ink">Reseña nueva</span>
            <span className="flex gap-0.5 text-amber-400">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className="size-3.5 fill-current" />
              ))}
            </span>
          </span>
        </Chip>
      </div>
    </div>
  );
}

/** Pieza flotante de la plataforma: entra (stage-in) y después flota (stage-float, otra propiedad). */
function Chip({ className, enter, float, children }: { className?: string; enter: number; float: string; children: ReactNode }) {
  return (
    <div className={cn("stage-in absolute z-1", className)} style={delay(enter)}>
      <div
        className="stage-float relative flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 shadow-[0_18px_40px_-16px_rgb(0_0_0/0.55)]"
        style={{ "--float-delay": float } as CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}
