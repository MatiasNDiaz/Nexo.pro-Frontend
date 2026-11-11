import { ArrowRight, ArrowUpRight, MapPin, Plus, Search, Wrench } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AccountStory } from "@/components/home/account-story";
import { HeroSlides } from "@/components/home/hero-slides";
import { Opinions } from "@/components/home/opinions";
import { PlansTable } from "@/components/home/plans-table";
import { ShineLink } from "@/components/home/shine-link";
import { WordsUp } from "@/components/motion/words-up";
import { ButtonLink } from "@/components/ui/button";
import { Listbox } from "@/components/ui/listbox";
import { about, faqs } from "@/content/home";
import { scenes, tradePhotos } from "@/content/photos";
import { getLocalities, getProfessions } from "@/features/catalog/data";
import { cn } from "@/lib/cn";

/*
 * Portada. Todo lo que se promete existe en el backend (docs/BACKEND_BUSINESS_FLOWS.md y
 * src/content/home.ts); las fotos son ilustrativas (src/content/photos.ts).
 * Cada sección tiene su propia composición (docs/design/interfacesserias.md, Impeccable): héroe de
 * lado a lado con buscador, mosaico de oficios, la historia de la cuenta (el momento animado),
 * profesionales y planes, una frase editorial, preguntas y un cierre con foto.
 */

export default function HomePage() {
  return (
    <>
      <Hero />
      <Trades />
      <section aria-labelledby="tu-cuenta" className="bg-canvas">
        <div className="container-page py-20 sm:py-28">
          <h2 id="tu-cuenta" className="max-w-[16ch] text-4xl leading-[1.02] font-bold text-brand-900 sm:text-6xl">
            Lo que tenés con tu cuenta gratis.
          </h2>
          <div className="mt-10 lg:mt-4">
            <AccountStory
              cta={
                <ButtonLink href="/registro" variant="primary" size="lg">
                  Crear mi cuenta gratis
                  <ArrowRight className="size-5" aria-hidden="true" />
                </ButtonLink>
              }
            />
          </div>
        </div>
      </section>
      <Professionals />
      <About />
      {/* Opiniones reales publicadas; sin ninguna, no aparece. */}
      <Suspense fallback={null}>
        <Opinions />
      </Suspense>
      <Faq />
      <FinalCta />
    </>
  );
}

function Hero() {
  return (
    <section aria-labelledby="inicio-titulo">
      <HeroSlides>
        {/* Contenido centrado y alto en la pantalla (pedido del fundador), con el buscador a lo ancho. */}
        {/*
          Por encima de los controles del carrusel (z-5) para que las listas del buscador los tapen; el
          contenedor deja pasar los clics (pointer-events) y solo sus hijos los reciben.
        */}
        <div className="container-page pointer-events-none relative z-5 flex min-h-[calc(100svh-4rem)] *:pointer-events-auto flex-col items-center justify-center pt-24 pb-28 text-center sm:pt-20 lg:min-h-[min(calc(100svh-4rem),58rem)] lg:pb-32">
          <h1
            id="inicio-titulo"
            className="max-w-[22ch] text-[2.5rem] leading-[0.95] font-bold tracking-[-0.025em] text-balance text-white sm:text-6xl lg:text-[5.25rem]"
          >
            <WordsUp text="Oficios de confianza en Córdoba, a un mensaje." />
          </h1>
          {/* Tan ancho como el buscador; blanco puro con una sombra suave para que se lea sobre cualquier foto. */}
          <p className="mt-6 max-w-5xl text-lg leading-relaxed font-medium text-white [text-shadow:0_1px_12px_rgb(7_21_42/0.55)] animate-fade-up [animation-delay:500ms] sm:text-xl">
            Electricistas, plomeros, gasistas, carpinteros, pintores y más oficios, con la identidad revisada por nuestro equipo.
            Contale tu problema por chat, recibí presupuestos sin compromiso y seguí el trabajo desde que lo aceptás hasta que
            termina.
          </p>
          {/* z-10: la animación de entrada crea una capa propia; sin esto, las listas quedarían bajo el botón de abajo. */}
          <div className="relative z-10 mt-9 w-full max-w-5xl text-left animate-fade-up [animation-delay:650ms]">
            <Suspense fallback={<SearchSkeleton />}>
              <HeroSearch />
            </Suspense>
          </div>
          <div className="mt-7 animate-fade-up [animation-delay:750ms]">
            <ShineLink href="/registro?rol=profesional" pace="slow">
              ¿Sos profesional? Sumate
            </ShineLink>
          </div>
        </div>
      </HeroSlides>
    </section>
  );
}

function SearchSkeleton() {
  return <div className="h-[8.5rem] rounded-2xl bg-white/90 sm:h-[4.5rem]" />;
}

/** Buscador real: un formulario GET al catálogo con los parámetros que lee (oficio por slug, localidad por id). */
async function HeroSearch() {
  const [professions, localities] = await Promise.all([getProfessions(), getLocalities()]);
  return (
    <form action="/profesionales" method="get" className="flex flex-col gap-1 rounded-2xl bg-white p-1.5 shadow-raised sm:flex-row sm:items-stretch">
      <Listbox
        variant="hero"
        name="oficio"
        label="Oficio"
        icon={<Wrench className="size-5" aria-hidden="true" />}
        className="flex-1"
        options={[{ value: "", label: "Todos los oficios" }, ...professions.map((p) => ({ value: p.slug, label: p.name }))]}
      />
      <span aria-hidden="true" className="mx-4 h-px bg-line sm:mx-0 sm:my-3 sm:h-auto sm:w-px" />
      <Listbox
        variant="hero"
        name="localidad"
        label="Localidad"
        icon={<MapPin className="size-5" aria-hidden="true" />}
        className="flex-1"
        options={[{ value: "", label: "Toda Córdoba" }, ...localities.map((l) => ({ value: l.id, label: l.name }))]}
      />
      <button
        type="submit"
        className="inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-amber-400 px-7 font-semibold text-brand-900 transition-[background-color,transform] duration-150 hover:bg-amber-500 active:scale-[0.97]"
      >
        <Search className="size-5" aria-hidden="true" />
        Buscar
      </button>
    </form>
  );
}

/** Tamaños del mosaico en escritorio (se acomodan con grid-flow-dense): 16 celdas en 4 × 4. */
const tileSpans = ["lg:col-span-2 lg:row-span-2", "", "", "", "lg:col-span-2", "", "", "lg:row-span-2", "", "lg:col-span-2"];

async function Trades() {
  const professions = (await getProfessions()).filter((profession) => tradePhotos[profession.slug]);
  if (professions.length === 0) return null;
  return (
    <section aria-labelledby="oficios" className="bg-surface">
      <div className="container-page py-20 sm:py-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="oficios" className="max-w-[20ch] text-4xl leading-[1.02] font-bold text-brand-900 sm:text-6xl">
            ¿Tenés un problema?… ¿a quién llamás?
          </h2>
          <Link href="/profesionales" className="group inline-flex h-11 items-center gap-1.5 font-semibold text-brand-700">
            Ver todos los profesionales
            <ArrowRight className="size-4 transition-transform duration-200 ease-out-soft group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
        <ul className="-mx-4 mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:auto-rows-[14rem] lg:grid-flow-dense lg:grid-cols-4 lg:overflow-visible lg:px-0 lg:pb-0">
          {professions.map((profession, index) => {
            const photo = tradePhotos[profession.slug]!;
            return (
              <li key={profession.id} className={cn("w-[68%] shrink-0 snap-start sm:w-[40%] lg:w-auto", tileSpans[index])}>
                <Link
                  href={`/profesionales?oficio=${profession.slug}` as Route}
                  className="group relative block aspect-[3/4] h-full overflow-hidden rounded-2xl bg-brand-900 lg:aspect-auto"
                >
                  <Image
                    src={photo.src}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 40vw, 68vw"
                    className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
                  />
                  <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-brand-950/85 via-brand-950/10 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
                    <span className="font-display text-2xl leading-none font-bold text-white sm:text-3xl">{profession.name}</span>
                    <ArrowUpRight
                      className="size-6 shrink-0 text-white opacity-0 transition-[opacity,translate] duration-300 ease-out-soft group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Professionals() {
  return (
    <section id="planes" aria-labelledby="para-profesionales" className="scroll-mt-16 bg-brand-950 text-white">
      <div className="container-page py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20">
          <div className="flex flex-col items-start gap-6">
            <h2 id="para-profesionales" className="max-w-[15ch] text-4xl leading-[1.02] font-bold sm:text-6xl">
              ¿Sos profesional? Que te encuentren los que te buscan.
            </h2>
            <p className="max-w-[46ch] text-lg leading-relaxed text-brand-200">
              Mostrá tus trabajos, elegí tus oficios y tus zonas, y respondé pedidos por chat. Empezás con 30 días de prueba con las
              funciones de Basic; después elegís tu plan y lo pagás mes a mes.
            </p>
            <ShineLink href="/registro?rol=profesional">Crear mi perfil profesional</ShineLink>
          </div>
          <div className="relative aspect-[4/5] max-h-[34rem] w-full overflow-hidden rounded-3xl sm:aspect-[4/3] lg:aspect-[4/5]">
            <Image src={scenes.escalera.src} alt={scenes.escalera.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          </div>
        </div>
        <div className="mt-20 sm:mt-28">
          <PlansTable />
          <p className="mt-6 text-sm text-brand-300">
            Sin permanencia: si no renovás el mes siguiente, tu perfil deja de mostrarse en el catálogo hasta que lo hagas.
          </p>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section aria-labelledby="quienes-somos" className="bg-surface">
      <div className="container-page grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
        <div className="flex flex-col gap-8">
          <h2 id="quienes-somos" className="text-4xl leading-[1.02] font-bold text-brand-900 sm:text-6xl">
            Quiénes somos
          </h2>
          <p className="max-w-[52ch] text-lg leading-relaxed text-muted-strong">{about.who}</p>
          <dl className="grid gap-6 border-t border-line pt-8 sm:grid-cols-3">
            {about.values.map((value) => (
              <div key={value.title} className="flex flex-col gap-1.5">
                <dt className="font-display text-lg font-bold text-ink">{value.title}</dt>
                <dd className="text-sm leading-relaxed text-muted-strong">{value.text}</dd>
              </div>
            ))}
          </dl>
        </div>
        {/* La foto y, encastrado abajo, el objetivo: una sola pieza. */}
        <figure className="overflow-hidden rounded-3xl bg-brand-700">
          <div className="relative aspect-[16/10]">
            <Image src={scenes.obraLuz.src} alt={scenes.obraLuz.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </div>
          <figcaption className="flex flex-col gap-3 p-6 sm:p-8">
            <h3 className="font-display text-xl font-bold text-amber-400">Nuestro objetivo</h3>
            <p className="font-display text-2xl leading-snug font-bold text-white sm:text-3xl">{about.goal}</p>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section aria-labelledby="preguntas" className="bg-canvas">
      <div className="container-page max-w-3xl py-20 sm:py-28">
        <h2 id="preguntas" className="text-center text-4xl leading-[1.02] font-bold text-brand-900 sm:text-5xl">
          Preguntas frecuentes
        </h2>
        <div className="mt-12 flex flex-col gap-2">
          {faqs.map((faq) => (
            // <details> nativo: se abre con teclado y lector de pantalla sin JavaScript; el alto se anima en CSS.
            <details key={faq.q} className="group rounded-2xl border border-line bg-surface open:border-brand-200">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {faq.q}
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-canvas transition-[background-color,rotate] duration-300 ease-out-soft group-open:rotate-45 group-open:bg-brand-700 group-open:text-white">
                  <Plus className="size-4" aria-hidden="true" />
                </span>
              </summary>
              <p className="max-w-[62ch] px-5 pb-5 leading-relaxed text-muted-strong">{faq.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-8 text-center text-muted-strong">
          ¿Te quedó otra duda?{" "}
          <Link href="/contacto" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
            Escribinos
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

/** Cierre en blanco (hace de pausa clara antes del pie oscuro), con un collage de dos fotos. */
function FinalCta() {
  return (
    <section aria-labelledby="empeza" className="border-t border-line bg-surface">
      <div className="container-page grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
        <div data-reveal className="flex flex-col items-start gap-6">
          <h2 id="empeza" className="max-w-[14ch] text-4xl leading-[1.02] font-bold text-brand-900 sm:text-6xl">
            ¿Tenés algo para arreglar?
          </h2>
          <p className="max-w-[44ch] text-lg leading-relaxed text-muted-strong">
            Encontrá a alguien de confianza cerca tuyo, pedile presupuesto por chat y seguí el trabajo hasta el final. Crear tu
            cuenta es gratis.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-5">
            <ButtonLink href="/profesionales" variant="accent" size="lg">
              Buscar un profesional
            </ButtonLink>
            <ButtonLink href="/registro" variant="secondary" size="lg">
              Crear mi cuenta
            </ButtonLink>
          </div>
        </div>
        <div aria-hidden="true" className="relative mx-auto h-[22rem] w-full max-w-lg sm:h-[26rem]">
          <div className="absolute top-0 left-0 h-[78%] w-[62%] overflow-hidden rounded-3xl shadow-raised">
            <Image src={scenes.pasillo.src} alt="" fill sizes="(min-width: 1024px) 28vw, 60vw" className="object-cover" />
          </div>
          <div className="absolute right-0 bottom-0 h-[62%] w-[52%] overflow-hidden rounded-3xl shadow-raised ring-8 ring-surface">
            <Image src={tradePhotos.pintor!.src} alt="" fill sizes="(min-width: 1024px) 24vw, 50vw" className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
