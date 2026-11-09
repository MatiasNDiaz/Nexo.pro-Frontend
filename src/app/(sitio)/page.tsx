import { ArrowRight, BadgeCheck, Check, Search } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { revealDelay } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { getProfessions } from "@/features/catalog/data";

/*
 * Portada. Todo lo que se promete acá existe en el backend (ver docs/BACKEND_BUSINESS_FLOWS.md):
 * catálogo solo con identidad aprobada, filtros por oficio y zona, chat y pedidos, reseñas solo de
 * trabajos terminados y prueba de 30 días para profesionales. Sin cifras, personas ni reseñas
 * inventadas. Dirección: docs/design/auditoria.md ("oficio verificado").
 */

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <ForProfessionals />
      <FinalCta />
    </>
  );
}

function Hero() {
  return (
    <section aria-labelledby="inicio-titulo" className="relative isolate overflow-hidden border-b border-line">
      <div className="container-page grid items-center gap-12 pt-10 pb-14 sm:pt-16 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20 lg:pt-20 lg:pb-24">
        <div className="flex flex-col items-start gap-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-brand-700 animate-fade-up">
            <BadgeCheck className="size-4 text-electric-500" aria-hidden="true" />
            Identidad verificada en cada perfil
          </p>
          <h1
            id="inicio-titulo"
            className="max-w-[16ch] text-[2.6rem] leading-[0.98] font-bold tracking-[-0.02em] text-brand-900 animate-fade-up [animation-delay:60ms] sm:text-6xl lg:text-[4.5rem]"
          >
            Oficios de confianza en Córdoba, a un mensaje.
          </h1>
          <p className="max-w-[52ch] text-lg leading-relaxed text-muted-strong animate-fade-up [animation-delay:120ms]">
            Electricistas, plomeros, gasistas y más, revisados por nuestro equipo. Pedí presupuesto por chat, compará y elegí
            sin compromiso.
          </p>
          <div className="flex w-full flex-col items-stretch gap-4 animate-fade-up [animation-delay:180ms] sm:w-auto sm:flex-row sm:items-center">
            <ButtonLink href="/profesionales" variant="accent" size="lg">
              <Search className="size-5" aria-hidden="true" />
              Buscar un profesional
            </ButtonLink>
            <Link
              href="/registro?rol=profesional"
              className="group inline-flex h-11 items-center justify-center gap-1.5 font-semibold text-brand-700 sm:justify-start"
            >
              Soy profesional
              <ArrowRight className="size-4 transition-transform duration-200 ease-out-soft group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
          <Suspense fallback={null}>
            <Trades />
          </Suspense>
        </div>
        <WorkOrder />
      </div>
    </section>
  );
}

/** Los oficios reales del backend como accesos directos al catálogo filtrado. */
async function Trades() {
  const professions = await getProfessions();
  if (professions.length === 0) return null;
  return (
    <nav aria-label="Oficios" className="mt-2 w-full animate-fade-up [animation-delay:240ms]">
      <ul className="flex flex-wrap gap-2">
        {professions.map((profession) => (
          <li key={profession.id}>
            <Link
              href={`/profesionales?oficio=${profession.slug}` as Route}
              className="inline-flex h-9 items-center rounded-lg border border-line bg-surface px-3 text-sm font-medium text-ink transition-colors duration-150 hover:border-brand-300 hover:text-brand-700"
            >
              {profession.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

const orderSteps = ["Le escribís al profesional", "Te responde por el chat", "Aceptás su presupuesto", "Seguís el trabajo hasta el final"];

/**
 * Una "orden de trabajo" que resume cómo funciona, con el sello de identidad verificada. Es una
 * ilustración: no muestra datos reales, personas ni montos.
 */
function WorkOrder() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-sm animate-fade-up [animation-delay:200ms] lg:max-w-none">
      <div className="relative rounded-2xl border border-line bg-surface shadow-raised">
        <div className="border-b border-dashed border-line-strong/50 px-6 py-4">
          <span className="font-display text-sm font-bold tracking-wide text-brand-900 uppercase [font-stretch:80%]">Orden de trabajo</span>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 px-6 pt-5 text-sm">
          <dt className="text-muted">Oficio</dt>
          <dd className="font-semibold text-ink">Electricista</dd>
          <dt className="text-muted">Urgencia</dt>
          <dd className="font-semibold text-ink">Lo antes posible</dd>
        </dl>
        <ol className="flex flex-col gap-3 px-6 pt-5 pb-7">
          {orderSteps.map((step, index) => (
            <li key={step} className="flex items-center gap-3 text-sm">
              <span
                className={
                  index < 3
                    ? "grid size-6 shrink-0 place-items-center rounded-full bg-brand-700 text-white"
                    : "grid size-6 shrink-0 place-items-center rounded-full border-2 border-line-strong/60"
                }
              >
                {index < 3 && <Check className="size-3.5" strokeWidth={3} />}
              </span>
              <span className={index < 3 ? "text-ink" : "text-muted"}>{step}</span>
            </li>
          ))}
        </ol>
        {/* Sello: la verificación de identidad es lo que distingue a Repara Ya. Arriba a la derecha, sobre el encabezado: no tapa los pasos. */}
        <div className="absolute -top-10 -right-2 grid size-24 rotate-[-12deg] place-items-center rounded-full border-2 border-dashed border-electric-500 bg-surface text-center sm:-right-6 sm:size-28">
          <span className="flex flex-col items-center gap-0.5 px-3">
            <BadgeCheck className="size-6 text-electric-500" />
            <span className="font-display text-[0.7rem] leading-tight font-bold tracking-wide text-brand-800 uppercase [font-stretch:80%]">
              Identidad verificada
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

const steps: { title: string; text: string }[] = [
  {
    title: "Buscá en tu zona",
    text: "Filtrá por oficio, localidad y barrio, o mirá quién está disponible en este momento.",
  },
  {
    title: "Conversá y pedí presupuesto",
    text: "Escribile por el chat o mandale tu pedido, y compará las propuestas antes de decidir.",
  },
  {
    title: "Contratá y calificá",
    text: "Seguí el trabajo desde que se agenda hasta que termina, y dejá tu reseña para ayudar a otros.",
  },
];

function HowItWorks() {
  return (
    <section aria-labelledby="como-funciona" className="bg-surface">
      <div className="container-page py-16 sm:py-24">
        <div data-reveal className="grid gap-4 lg:grid-cols-[1fr_1fr] lg:items-end">
          <h2 id="como-funciona" className="text-4xl leading-[1.02] font-bold text-brand-900 sm:text-5xl">
            De la búsqueda al trabajo terminado.
          </h2>
          <p className="max-w-[46ch] text-lg leading-relaxed text-muted-strong lg:justify-self-end">
            Todo en un solo lugar: la conversación, el presupuesto y el seguimiento del trabajo.
          </p>
        </div>
        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((step, index) => (
            <li key={step.title} data-reveal style={revealDelay(index, 90)} className="flex flex-col gap-3 border-t-2 border-brand-700 pt-5">
              <span className="font-display text-5xl leading-none font-bold text-brand-200 [font-stretch:75%]" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-xl font-bold text-ink">{step.title}</h3>
              <p className="leading-relaxed text-muted-strong">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const proBenefits: { title: string; text: string }[] = [
  { title: "Tu perfil como vidriera", text: "Fotos, videos y certificados de tus trabajos." },
  { title: "Tus oficios y tus zonas", text: "Elegís qué hacés y en qué barrios trabajás." },
  { title: "Pedidos por chat", text: "Respondés y mandás tu presupuesto desde el celular." },
  { title: "Reseñas que suman", text: "Solo de clientes con un trabajo terminado." },
];

function ForProfessionals() {
  return (
    <section aria-labelledby="para-profesionales" className="bg-brand-900 text-white">
      <div className="container-page grid gap-12 py-16 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div data-reveal className="flex flex-col items-start gap-5">
          <p className="text-sm font-semibold text-amber-400">30 días de prueba</p>
          <h2 id="para-profesionales" className="text-4xl leading-[1.02] font-bold sm:text-5xl">
            ¿Sos profesional? Conseguí clientes en tu zona.
          </h2>
          <p className="max-w-[44ch] text-lg leading-relaxed text-brand-200">
            Creá tu perfil, verificá tu identidad y empezá a recibir pedidos. Probalo 30 días antes de elegir tu plan.
          </p>
          <ButtonLink href="/registro?rol=profesional" variant="accent" size="lg" className="mt-2">
            Crear mi perfil profesional
          </ButtonLink>
        </div>
        <dl className="flex flex-col">
          {proBenefits.map((benefit, index) => (
            <div
              key={benefit.title}
              data-reveal
              style={revealDelay(index, 80)}
              className="grid gap-1 border-t border-white/15 py-5 sm:grid-cols-[14rem_1fr] sm:gap-6 last:border-b"
            >
              <dt className="font-display text-lg font-bold text-white">{benefit.title}</dt>
              <dd className="leading-relaxed text-brand-200">{benefit.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section aria-labelledby="empeza" className="container-page py-16 sm:py-24">
      <div data-reveal className="flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3">
          <h2 id="empeza" className="max-w-[18ch] text-4xl leading-[1.02] font-bold text-brand-900 sm:text-5xl">
            ¿Tenés algo para arreglar?
          </h2>
          <p className="text-lg text-muted-strong">
            Crear tu cuenta es gratis para clientes.{" "}
            <Link href="/contacto" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
              ¿Dudas? Escribinos
            </Link>
            .
          </p>
        </div>
        <ButtonLink href="/profesionales" variant="primary" size="lg">
          Ver profesionales
          <ArrowRight className="size-5" aria-hidden="true" />
        </ButtonLink>
      </div>
    </section>
  );
}
