import { ArrowRight, BadgeCheck, Check, Plus, Search } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { HeroSlides } from "@/components/home/hero-slides";
import { revealDelay } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { about, customerBenefits, faqs, plans } from "@/content/home";
import { photos } from "@/content/photos";
import { getProfessions } from "@/features/catalog/data";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";

/*
 * Portada. Todo lo que se promete acá existe en el backend (ver docs/BACKEND_BUSINESS_FLOWS.md y
 * src/content/home.ts). Sin cifras, personas ni reseñas inventadas; las fotos son ilustrativas
 * (src/content/photos.ts). Dirección: docs/design/auditoria.md ("oficio verificado").
 */

export default function HomePage() {
  return (
    <>
      <Hero />
      <CustomerBenefits />
      <HowItWorks />
      <ForProfessionals />
      <Plans />
      <About />
      <Faq />
      <FinalCta />
    </>
  );
}

function Hero() {
  return (
    <section aria-labelledby="inicio-titulo" className="relative isolate overflow-hidden border-b border-line">
      <div className="lg:container-page grid lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-14 lg:py-14">
        {/* En celular, las fotos van arriba a lo ancho; en escritorio, a la derecha. */}
        <HeroSlides className="aspect-[5/4] sm:aspect-[16/10] lg:order-2 lg:aspect-auto lg:h-[min(40rem,76vh)] lg:rounded-3xl" />
        <div className="container-page flex flex-col items-start gap-6 py-8 sm:py-10 lg:order-1 lg:max-w-none lg:px-0 lg:py-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-brand-700 animate-fade-up">
            <BadgeCheck className="size-4 text-electric-500" aria-hidden="true" />
            Identidad verificada en cada perfil
          </p>
          <h1
            id="inicio-titulo"
            className="max-w-[15ch] text-[2.35rem] leading-[0.98] font-bold tracking-[-0.02em] text-brand-900 animate-fade-up [animation-delay:60ms] sm:text-6xl xl:text-[4.25rem]"
          >
            Oficios de confianza en Córdoba, a un mensaje.
          </h1>
          <p className="max-w-[48ch] text-lg leading-relaxed text-muted-strong animate-fade-up [animation-delay:120ms]">
            Electricistas, plomeros, gasistas y más, revisados por nuestro equipo. Pedí presupuesto por chat, compará y elegí
            sin compromiso.
          </p>
          <div className="flex w-full flex-col items-stretch gap-3 animate-fade-up [animation-delay:180ms] sm:w-auto sm:flex-row sm:items-center sm:gap-5">
            <ButtonLink href="/profesionales" variant="accent" size="lg">
              <Search className="size-5" aria-hidden="true" />
              Buscar un profesional
            </ButtonLink>
            <Link
              href="/registro?rol=profesional"
              className="group inline-flex h-11 items-center justify-center gap-1.5 font-semibold text-brand-700"
            >
              Soy profesional
              <ArrowRight className="size-4 transition-transform duration-200 ease-out-soft group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
          <Suspense fallback={null}>
            <Trades />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

/** Los oficios reales del backend como accesos directos al catálogo filtrado. */
async function Trades() {
  const professions = await getProfessions();
  if (professions.length === 0) return null;
  return (
    <nav aria-label="Oficios" className="mt-1 w-full animate-fade-up [animation-delay:240ms]">
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

function CustomerBenefits() {
  return (
    <section aria-labelledby="beneficios" className="bg-surface">
      <div className="container-page grid gap-12 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-20">
        <div className="flex flex-col gap-8">
          <div data-reveal className="flex flex-col gap-4">
            <h2 id="beneficios" className="max-w-[18ch] text-4xl leading-[1.02] font-bold text-brand-900 sm:text-5xl">
              Creá tu cuenta gratis y resolvé todo desde un lugar.
            </h2>
            <p className="max-w-[50ch] text-lg leading-relaxed text-muted-strong">
              Con tu cuenta de cliente tenés esto, sin pagar nada:
            </p>
          </div>
          <dl className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {customerBenefits.map((benefit, index) => (
              <div key={benefit.title} data-reveal style={revealDelay(index, 70)} className="flex flex-col gap-1.5 border-l-2 border-amber-400 pl-4">
                <dt className="font-display text-lg font-bold text-ink">{benefit.title}</dt>
                <dd className="leading-relaxed text-muted-strong">{benefit.text}</dd>
              </div>
            ))}
          </dl>
          <div data-reveal>
            <ButtonLink href="/registro" variant="primary" size="lg">
              Crear mi cuenta gratis
            </ButtonLink>
          </div>
        </div>
        <div data-reveal="right" className="px-2 pt-8 lg:pt-0">
          <WorkOrder />
        </div>
      </div>
    </section>
  );
}

const orderSteps = ["Le escribís al profesional", "Te responde por el chat", "Aceptás su presupuesto", "Seguís el trabajo hasta el final"];

/**
 * Una "orden de trabajo" que resume cómo funciona, con el sello de identidad verificada. Es una
 * ilustración: no muestra datos reales, personas ni montos.
 */
function WorkOrder() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-sm">
      <div className="relative rounded-2xl border border-line bg-surface shadow-raised">
        <div className="border-b border-dashed border-line-strong/50 px-6 py-4">
          <span className="font-display text-sm font-bold tracking-wide text-brand-900 uppercase font-stretch-80%">Orden de trabajo</span>
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
        {/* Sello arriba a la derecha, sobre el encabezado: no tapa los pasos. */}
        <div className="absolute -top-10 -right-2 grid size-24 rotate-[-12deg] place-items-center rounded-full border-2 border-dashed border-electric-500 bg-surface text-center sm:-right-6 sm:size-28">
          <span className="flex flex-col items-center gap-0.5 px-3">
            <BadgeCheck className="size-6 text-electric-500" />
            <span className="font-display text-[0.7rem] leading-tight font-bold tracking-wide text-brand-800 uppercase font-stretch-80%">
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
    <section aria-labelledby="como-funciona" className="border-y border-line">
      <div className="container-page py-16 sm:py-24">
        <div data-reveal className="grid gap-4 lg:grid-cols-2 lg:items-end">
          <h2 id="como-funciona" className="text-4xl leading-[1.02] font-bold text-brand-900 sm:text-5xl">
            De la búsqueda al trabajo terminado.
          </h2>
          <p className="max-w-[46ch] text-lg leading-relaxed text-muted-strong lg:justify-self-end">
            La conversación, el presupuesto y el seguimiento del trabajo, en un solo lugar.
          </p>
        </div>
        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((step, index) => (
            <li key={step.title} data-reveal style={revealDelay(index, 90)} className="flex flex-col gap-3 border-t-2 border-brand-700 pt-5">
              <span className="font-display text-5xl leading-none font-bold text-brand-200 font-stretch-75%" aria-hidden="true">
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
              className="grid gap-1 border-t border-white/15 py-5 last:border-b sm:grid-cols-[14rem_1fr] sm:gap-6"
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

function Plans() {
  return (
    <section id="planes" aria-labelledby="planes-titulo" className="scroll-mt-20 bg-canvas">
      <div className="container-page py-16 sm:py-24">
        <div data-reveal className="grid gap-4 lg:grid-cols-2 lg:items-end">
          <h2 id="planes-titulo" className="text-4xl leading-[1.02] font-bold text-brand-900 sm:text-5xl">
            Planes para profesionales.
          </h2>
          <p className="max-w-[46ch] text-lg leading-relaxed text-muted-strong lg:justify-self-end">
            Empezás con 30 días de prueba con las funciones de Basic. Después elegís tu plan y lo pagás mes a mes.
          </p>
        </div>
        <ul className="mt-12 grid gap-4 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const featured = plan.code === "MEDIUM";
            return (
              <li
                key={plan.code}
                data-reveal
                style={revealDelay(index, 90)}
                className={cn(
                  "flex flex-col gap-6 rounded-2xl border p-6 sm:p-8",
                  featured ? "border-brand-900 bg-brand-900 text-white" : "border-line bg-surface",
                )}
              >
                <div className="flex flex-col gap-1">
                  <h3 className={cn("font-display text-2xl font-bold", featured ? "text-white" : "text-brand-900")}>{plan.name}</h3>
                  <p className={featured ? "text-brand-200" : "text-muted-strong"}>{plan.pitch}</p>
                </div>
                <p className="flex items-baseline gap-1.5">
                  <span className={cn("font-display text-5xl font-bold font-stretch-85%", featured ? "text-white" : "text-ink")}>
                    {formatMoney(plan.price)}
                  </span>
                  <span className={featured ? "text-brand-200" : "text-muted"}>por mes</span>
                </p>
                <ul className="flex flex-1 flex-col gap-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check
                        className={cn("mt-0.5 size-4 shrink-0", featured ? "text-amber-400" : "text-brand-600")}
                        strokeWidth={3}
                        aria-hidden="true"
                      />
                      <span className={featured ? "text-brand-100" : "text-ink"}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <ButtonLink href="/registro?rol=profesional" variant={featured ? "accent" : "secondary"} fullWidth>
                  Empezar con la prueba
                </ButtonLink>
              </li>
            );
          })}
        </ul>
        <p data-reveal className="mt-6 text-sm text-muted-strong">
          Precios en pesos argentinos. Sin permanencia: si no pagás el mes siguiente, tu perfil deja de mostrarse hasta que
          renueves.
        </p>
      </div>
    </section>
  );
}

function About() {
  return (
    <section aria-labelledby="quienes-somos" className="border-y border-line bg-surface">
      <div className="container-page grid gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div data-reveal="left" className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-brand-100 lg:aspect-[4/5]">
          <Image
            src={photos.equipo.src}
            alt={photos.equipo.alt}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out-soft hover:scale-[1.02]"
          />
        </div>
        <div className="flex flex-col gap-10">
          <div data-reveal className="flex flex-col gap-4">
            <h2 id="quienes-somos" className="text-4xl leading-[1.02] font-bold text-brand-900 sm:text-5xl">
              Quiénes somos
            </h2>
            <p className="text-lg leading-relaxed text-muted-strong">{about.who}</p>
          </div>
          <div data-reveal className="flex flex-col gap-4 border-l-2 border-amber-400 pl-5">
            <h3 className="font-display text-2xl font-bold text-brand-900">Nuestro objetivo</h3>
            <p className="text-lg leading-relaxed text-ink">{about.goal}</p>
          </div>
          <dl className="grid gap-6 sm:grid-cols-3">
            {about.values.map((value, index) => (
              <div key={value.title} data-reveal style={revealDelay(index, 70)} className="flex flex-col gap-1.5">
                <dt className="font-display text-lg font-bold text-ink">{value.title}</dt>
                <dd className="text-sm leading-relaxed text-muted-strong">{value.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section aria-labelledby="preguntas" className="bg-canvas">
      <div className="container-page grid gap-10 py-16 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div data-reveal className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
          <h2 id="preguntas" className="text-4xl leading-[1.02] font-bold text-brand-900 sm:text-5xl">
            Preguntas frecuentes
          </h2>
          <p className="text-lg leading-relaxed text-muted-strong">
            ¿No encontrás tu respuesta?{" "}
            <Link href="/contacto" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
              Escribinos
            </Link>
            .
          </p>
        </div>
        <div data-reveal className="flex flex-col border-t border-line">
          {faqs.map((faq) => (
            // <details> nativo: se abre con teclado y lector de pantalla sin JavaScript.
            <details key={faq.q} className="group border-b border-line">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-lg font-bold text-ink [&::-webkit-details-marker]:hidden">
                {faq.q}
                <Plus
                  className="size-5 shrink-0 text-brand-600 transition-transform duration-200 ease-out-soft group-open:rotate-45"
                  aria-hidden="true"
                />
              </summary>
              <p className="max-w-[62ch] pb-5 leading-relaxed text-muted-strong">{faq.a}</p>
            </details>
          ))}
        </div>
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
          <p className="text-lg text-muted-strong">Crear tu cuenta es gratis para clientes.</p>
        </div>
        <ButtonLink href="/profesionales" variant="primary" size="lg">
          Ver profesionales
          <ArrowRight className="size-5" aria-hidden="true" />
        </ButtonLink>
      </div>
    </section>
  );
}
