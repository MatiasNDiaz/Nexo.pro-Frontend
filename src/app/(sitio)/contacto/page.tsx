import { ArrowUpRight, Clock, Flag, LifeBuoy, Mail, MailCheck, MessageCircle, MessagesSquare } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { WhatsappIcon } from "@/components/brand/social-icons";
import { PageHeader } from "@/components/layout/page-header";
import { site, whatsappUrl } from "@/config/site";
import { banners } from "@/content/photos";
import { ContactForm } from "@/features/support/contact-form";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escribinos tu consulta, sugerencia, reclamo o el problema que encontraste en Repara Ya.",
  alternates: { canonical: "/contacto" },
};

/**
 * Contacto (rediseño pedido por el fundador). A la izquierda, los canales directos y atajos para lo
 * que tiene un lugar propio (soporte de un trabajo, preguntas frecuentes, reportes); a la derecha, el
 * formulario en un panel destacado.
 */
export default function ContactPage() {
  return (
    <>
      <PageHeader
        photo={banners.contacto}
        focus="50% 30%"
        title="Contacto"
        description="Contanos tu consulta, sugerencia o el problema que encontraste. Leemos todos los mensajes y te respondemos por el canal que elijas."
        highlights={[
          { icon: Clock, label: "Respuesta en 48 a 72 h hábiles" },
          { icon: MessageCircle, label: "WhatsApp y email" },
          { icon: MailCheck, label: "Leemos todos los mensajes" },
        ]}
      />
      <div className="container-page grid gap-10 py-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14 lg:py-16">
        <div className="flex flex-col gap-8" data-reveal>
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-3xl leading-tight font-bold text-brand-900 sm:text-4xl">¿En qué te ayudamos?</h2>
            <p className="max-w-[44ch] text-lg leading-relaxed text-muted-strong">
              Escribinos por el canal que te quede más cómodo. Si es sobre un trabajo o tu cuenta, desde tu panel lo resolvemos más rápido.
            </p>
          </div>

          <ul className="flex flex-col gap-3">
            <li>
              <Channel
                href={whatsappUrl("Hola, quiero hacer una consulta sobre Repara Ya.")}
                external
                tile="bg-success-50 text-success-800"
                icon={<WhatsappIcon className="size-6" />}
                title="WhatsApp"
                text={site.contact.phoneDisplay}
              />
            </li>
            <li>
              <Channel href={`mailto:${site.contact.email}`} tile="bg-brand-50 text-brand-700" icon={<Mail className="size-6" aria-hidden="true" />} title="Email" text={site.contact.email} />
            </li>
          </ul>

          <p className="flex items-center gap-3 rounded-2xl bg-canvas px-5 py-4 text-sm text-ink">
            <Clock className="size-5 shrink-0 text-brand-600" aria-hidden="true" />
            Respondemos dentro de las 48 a 72 horas hábiles.
          </p>

          <section aria-labelledby="atajos" className="flex flex-col gap-3">
            <h2 id="atajos" className="font-display text-lg font-bold text-ink">
              Quizás te sirva
            </h2>
            <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface">
              <Shortcut href="/panel/soporte" icon={<LifeBuoy className="size-5" aria-hidden="true" />} title="Soporte desde tu panel" text="Para problemas con un trabajo, un pago o tu cuenta: queda todo en un solo lugar." />
              <Shortcut href="/#preguntas" icon={<MessagesSquare className="size-5" aria-hidden="true" />} title="Preguntas frecuentes" text="Cómo funciona, cuánto cuesta y cómo se paga el trabajo." />
              <li className="flex gap-3 p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-danger-50 text-danger-600">
                  <Flag className="size-5" aria-hidden="true" />
                </span>
                <p className="text-sm leading-relaxed text-muted-strong">
                  <span className="block font-semibold text-ink">¿Viste algo que no corresponde?</span>
                  Reportalo desde el perfil, el mensaje o la publicación con el botón “Reportar”.
                </p>
              </li>
            </ul>
          </section>
        </div>

        <section aria-labelledby="escribinos" className="relative self-start rounded-3xl border border-line bg-surface p-5 shadow-raised sm:p-8 lg:sticky lg:top-24">
          <h2 id="escribinos" className="mb-1 font-display text-2xl font-bold text-brand-900">
            Escribinos
          </h2>
          <p className="mb-6 text-muted-strong">Completá el formulario y te respondemos al email que nos dejes.</p>
          <ContactForm />
        </section>
      </div>
    </>
  );
}

/** Canal directo: toda la fila es el enlace. */
function Channel({ href, external = false, tile, icon, title, text }: { href: string; external?: boolean; tile: string; icon: ReactNode; title: string; text: string }) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card transition-[border-color,box-shadow,translate] duration-300 ease-out-soft hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-raised"
    >
      <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${tile}`}>{icon}</span>
      <span className="flex min-w-0 flex-col">
        <span className="font-semibold text-ink">{title}</span>
        <span className="text-sm [overflow-wrap:anywhere] text-muted-strong">{text}</span>
      </span>
      <ArrowUpRight className="ml-auto size-5 shrink-0 text-brand-700 transition-transform duration-300 ease-out-soft group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
      {external && <span className="sr-only"> (se abre en otra pestaña)</span>}
    </a>
  );
}

function Shortcut({ href, icon, title, text }: { href: string; icon: ReactNode; title: string; text: string }) {
  return (
    <li>
      <Link href={href as Route} className="group flex gap-3 p-4 transition-colors first:rounded-t-2xl hover:bg-brand-50">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-surface">{icon}</span>
        <span className="text-sm leading-relaxed text-muted-strong">
          <span className="flex items-center gap-1 font-semibold text-ink">
            {title}
            <ArrowUpRight className="size-4 text-brand-700 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
          </span>
          {text}
        </span>
      </Link>
    </li>
  );
}
