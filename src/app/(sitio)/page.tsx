import {
  BadgeCheck,
  CalendarCheck,
  Clock,
  Images,
  MapPin,
  MessagesSquare,
  Search,
  ShieldCheck,
  Star,
  type LucideIcon,
} from "lucide-react";
import { revealDelay } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/feedback";

/*
 * Portada. Todo lo que se promete acá existe en el backend (ver docs/BACKEND_BUSINESS_FLOWS.md):
 * catálogo solo con identidad aprobada, filtros por oficio/zona/"Disponible ya", chat y pedidos a
 * varios profesionales, reseñas solo de trabajos terminados y prueba de 30 días para profesionales.
 * Las secciones con datos reales del catálogo llegan en la etapa 3.
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
    <section className="relative isolate overflow-hidden">
      {/* Fondo: degradado muy suave y una grilla tenue que da textura sin competir con el texto. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-b from-brand-50 via-canvas to-canvas" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 [background-image:linear-gradient(to_right,rgb(18_59_122/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(18_59_122/0.06)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
      />
      <div className="container-page grid items-center gap-12 pt-12 pb-16 sm:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:pt-24 lg:pb-24">
        <div className="flex flex-col items-start gap-6 animate-fade-up">
          <Badge tone="electric">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Profesionales con identidad verificada
          </Badge>
          <h1 className="text-[2.25rem] leading-[1.08] font-bold text-brand-900 sm:text-5xl lg:text-[3.5rem]">
            Lo que necesitás arreglar, <span className="text-brand-600">resuelto con confianza.</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-strong">
            Buscá por oficio y zona, compará perfiles y reseñas, pedí presupuestos por chat y coordiná el trabajo
            en un solo lugar.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <ButtonLink href="/profesionales" variant="accent" size="lg">
              <Search className="size-5" aria-hidden="true" />
              Buscar profesionales
            </ButtonLink>
            <ButtonLink href="/registro?rol=profesional" variant="secondary" size="lg">
              Soy profesional
            </ButtonLink>
          </div>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

/** Composición ilustrativa de la experiencia (no muestra datos reales ni personas inventadas). */
function HeroVisual() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-md animate-fade-in [animation-delay:150ms] lg:max-w-none">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-linear-to-br from-electric-500/15 via-brand-500/10 to-transparent blur-2xl" />
      {/* Abajo queda espacio libre para el aviso flotante, así no tapa la última fila. */}
      <div className="rounded-3xl bg-brand-900 p-5 shadow-raised ring-1 ring-white/10 sm:p-6 sm:pb-12">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-brand-200">Tu pedido</span>
          <span className="rounded-full bg-electric-500/15 px-2.5 py-1 text-xs font-semibold text-electric-400">
            3 profesionales respondieron
          </span>
        </div>
        <div className="mt-5 flex flex-col gap-3">
          <VisualRow icon={BadgeCheck} title="Identidad verificada" detail="Perfil revisado por el equipo" />
          <VisualRow icon={MessagesSquare} title="Presupuesto por chat" detail="Comparás antes de elegir" accent />
          <VisualRow icon={Star} title="Reseñas de trabajos terminados" detail="Opiniones de clientes reales" />
        </div>
      </div>
      <div className="absolute -bottom-5 left-6 hidden items-center gap-3 rounded-2xl bg-surface px-4 py-3 shadow-raised ring-1 ring-line sm:flex">
        <span className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-800">
          <Clock className="size-5" />
        </span>
        <span className="text-sm font-semibold text-ink">Disponible ya</span>
      </div>
    </div>
  );
}

function VisualRow({ icon: Icon, title, detail, accent = false }: { icon: LucideIcon; title: string; detail: string; accent?: boolean }) {
  return (
    <div className={`flex items-center gap-4 rounded-2xl p-4 ring-1 ${accent ? "bg-white/10 ring-white/15" : "bg-white/5 ring-white/10"}`}>
      <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${accent ? "bg-amber-400 text-brand-900" : "bg-brand-700 text-white"}`}>
        <Icon className="size-5" />
      </span>
      <span className="flex flex-col">
        <span className="font-semibold text-white">{title}</span>
        <span className="text-sm text-brand-200">{detail}</span>
      </span>
    </div>
  );
}

const steps: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: MapPin,
    title: "Buscá en tu zona",
    text: "Filtrá por oficio, localidad y barrio, o mirá quién está disponible en este momento.",
  },
  {
    icon: MessagesSquare,
    title: "Conversá y pedí presupuestos",
    text: "Escribile por chat o mandá tu pedido a varios profesionales a la vez y compará las propuestas.",
  },
  {
    icon: CalendarCheck,
    title: "Contratá y calificá",
    text: "Seguí el trabajo desde que se agenda hasta que termina, y dejá tu reseña para ayudar a otros.",
  },
];

function HowItWorks() {
  return (
    <section aria-labelledby="como-funciona" className="border-y border-line bg-surface">
      <div className="container-page py-16 sm:py-20">
        <div data-reveal className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <p className="text-sm font-semibold tracking-wide text-brand-600 uppercase">Cómo funciona</p>
          <h2 id="como-funciona" className="text-3xl font-bold text-brand-900 sm:text-4xl">
            De la búsqueda al trabajo terminado
          </h2>
        </div>
        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              data-reveal
              style={revealDelay(index, 120)}
              className="group relative flex flex-col gap-4 rounded-2xl border border-line bg-canvas/60 p-6 transition-[border-color,box-shadow,background-color] duration-300 hover:border-brand-200 hover:bg-surface hover:shadow-card"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-700 text-white shadow-card transition-transform duration-300 ease-out-soft group-hover:-translate-y-0.5 group-hover:rotate-[-4deg]">
                  <step.icon className="size-6" aria-hidden="true" />
                </span>
                <span className="font-display text-sm font-bold text-brand-600">Paso {index + 1}</span>
              </div>
              <h3 className="text-xl font-semibold text-ink">{step.title}</h3>
              <p className="leading-relaxed text-muted-strong">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const proBenefits: { icon: LucideIcon; text: string }[] = [
  { icon: Images, text: "Perfil con fotos, videos y certificados de tus trabajos." },
  { icon: MapPin, text: "Elegís los oficios y las zonas donde trabajás." },
  { icon: MessagesSquare, text: "Recibís pedidos y respondés con tu presupuesto por chat." },
  { icon: Star, text: "Sumás reseñas de cada trabajo que terminás." },
];

function ForProfessionals() {
  return (
    <section aria-labelledby="para-profesionales" className="container-page py-16 sm:py-24">
      <div
        data-reveal="scale"
        className="grid items-center gap-10 overflow-hidden rounded-3xl bg-brand-900 p-6 shadow-raised sm:p-10 lg:grid-cols-2 lg:p-14"
      >
        <div data-reveal="left" style={revealDelay(1, 150)} className="flex flex-col items-start gap-5">
          <Badge tone="amber">30 días de prueba</Badge>
          <h2 id="para-profesionales" className="text-3xl font-bold text-white sm:text-4xl">
            ¿Sos profesional? Mostrá tu trabajo y conseguí clientes en tu zona.
          </h2>
          <p className="text-lg leading-relaxed text-brand-200">
            Creá tu perfil, verificá tu identidad y empezá a recibir pedidos. Probalo 30 días antes de elegir tu plan.
          </p>
          <ButtonLink href="/registro?rol=profesional" variant="accent" size="lg">
            Crear mi perfil profesional
          </ButtonLink>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {proBenefits.map((benefit, index) => (
            <li
              key={benefit.text}
              data-reveal="right"
              style={revealDelay(index + 2, 110)}
              className="flex flex-col gap-3 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 transition-colors duration-300 hover:bg-white/10"
            >
              <benefit.icon className="size-6 text-electric-400" aria-hidden="true" />
              <p className="leading-relaxed text-brand-100">{benefit.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section aria-labelledby="empeza" className="container-page pb-20">
      <div
        data-reveal
        className="flex flex-col items-center gap-5 rounded-3xl border border-line bg-surface px-6 py-12 text-center shadow-card sm:py-16"
      >
        <h2 id="empeza" className="max-w-2xl text-3xl font-bold text-brand-900 sm:text-4xl">
          Encontrá a la persona indicada para tu próximo arreglo
        </h2>
        <p className="max-w-xl text-lg text-muted">Crear tu cuenta es gratis para clientes.</p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <ButtonLink href="/profesionales" variant="primary" size="lg">
            Ver profesionales
          </ButtonLink>
          <ButtonLink href="/contacto" variant="secondary" size="lg">
            Hacer una consulta
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
