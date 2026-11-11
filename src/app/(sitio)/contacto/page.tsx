import { Clock, Mail } from "lucide-react";
import type { Metadata } from "next";
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

export default function ContactPage() {
  return (
    <>
      <PageHeader
        photo={banners.contacto}
        focus="55% 50%"
        title="Contacto"
        description="Contanos tu consulta, sugerencia o el problema que encontraste. Leemos todos los mensajes."
      />
      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_20rem] lg:py-14">
        <section aria-label="Formulario de contacto" className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-8">
          <ContactForm />
        </section>
        <aside className="flex flex-col gap-4" data-reveal>
          <div className="flex gap-3 rounded-2xl border border-line bg-surface p-5">
            <Clock className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true" />
            <div>
              <h2 className="font-semibold text-brand-900">Tiempo de respuesta</h2>
              <p className="text-sm text-muted">Respondemos dentro de las 48 a 72 horas hábiles.</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
            <h2 className="font-semibold text-brand-900">Otras formas de contacto</h2>
            <a
              href={whatsappUrl("Hola, quiero hacer una consulta sobre Repara Ya.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-sm font-medium text-brand-700 hover:underline"
            >
              <WhatsappIcon className="size-5" />
              WhatsApp {site.contact.phoneDisplay}
              <span className="sr-only"> (se abre en otra pestaña)</span>
            </a>
            <a
              href={`mailto:${site.contact.email}`}
              className="flex items-center gap-2.5 text-sm font-medium [overflow-wrap:anywhere] text-brand-700 hover:underline"
            >
              <Mail className="size-5 shrink-0" aria-hidden="true" />
              {site.contact.email}
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
