import { Mail } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { InstagramIcon, LinkedinIcon, WhatsappIcon } from "@/components/brand/social-icons";
import { site, whatsappUrl } from "@/config/site";

const explore: { href: Route; label: string }[] = [
  { href: "/", label: "Inicio" },
  { href: "/profesionales", label: "Profesionales" },
  { href: "/foro", label: "Foro" },
  { href: "/contacto", label: "Contacto" },
];

const legal: { href: Route; label: string }[] = [
  { href: "/aviso-legal", label: "Aviso legal" },
  { href: "/terminos", label: "Términos y condiciones" },
];

function FooterHeading({ children }: { children: ReactNode }) {
  return <h2 className="text-sm font-semibold tracking-wide text-white">{children}</h2>;
}

const linkClass =
  "inline-flex min-h-10 items-center gap-2.5 rounded-md text-brand-200 transition-colors hover:text-white";

/** Footer sobre azul noche. Textos en brand-200 (≥ 9:1 sobre #0B1F3A). */
export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-brand-900 text-brand-200">
      {/* Brillo sutil para dar profundidad sin recargar. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[48rem] -translate-x-1/2 rounded-full bg-brand-600/25 blur-3xl"
      />
      <div className="container-page relative grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_1.4fr_0.8fr]">
        <div className="flex flex-col gap-4">
          <Logo tone="dark" />
          <p className="max-w-xs text-sm leading-relaxed">{site.tagline}</p>
        </div>

        <nav aria-labelledby="footer-explorar" className="flex flex-col gap-3">
          <FooterHeading>
            <span id="footer-explorar">Explorar</span>
          </FooterHeading>
          <ul className="flex flex-col">
            {explore.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-3">
          <FooterHeading>Contacto</FooterHeading>
          <ul className="flex flex-col">
            <li>
              <a href={whatsappUrl("Hola, quiero hacer una consulta sobre Repara Ya.")} target="_blank" rel="noopener noreferrer" className={linkClass}>
                <WhatsappIcon className="size-5 shrink-0" />
                <span>
                  {site.contact.phoneDisplay}
                  <span className="sr-only"> (WhatsApp, se abre en otra pestaña)</span>
                </span>
              </a>
            </li>
            <li>
              <a href={`mailto:${site.contact.email}`} className={`${linkClass} [overflow-wrap:anywhere]`}>
                <Mail className="size-5 shrink-0" aria-hidden="true" />
                {site.contact.email}
              </a>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <FooterHeading>Seguinos</FooterHeading>
          <ul className="flex gap-2">
            <li>
              <a
                href={site.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-11 place-items-center rounded-xl bg-white/5 text-brand-100 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-white"
              >
                <LinkedinIcon className="size-5" />
                <span className="sr-only">LinkedIn (se abre en otra pestaña)</span>
              </a>
            </li>
            <li>
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="grid size-11 place-items-center rounded-xl bg-white/5 text-brand-100 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-white"
              >
                <InstagramIcon className="size-5" />
                <span className="sr-only">Instagram (se abre en otra pestaña)</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>© Repara Ya. Todos los derechos reservados.</p>
          <nav aria-label="Legales">
            <ul className="flex flex-wrap gap-x-5">
              {legal.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
