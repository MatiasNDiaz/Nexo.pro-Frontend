"use client";

import { useQuery } from "@tanstack/react-query";
import { Mail, Phone } from "lucide-react";
import { useState } from "react";
import { WhatsappIcon } from "@/components/brand/social-icons";
import { Button, buttonClasses } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import type { PublicProfile } from "@/features/catalog/types";
import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { telHref, whatsappNumber } from "@/lib/phone";

/**
 * Contacto del profesional (teléfono y email, públicos en el detalle según FI §7.1).
 *
 * No viene en el HTML armado por el servidor: quedaría en caché y se podría recolectar en masa sin
 * pasar por el límite del backend contra la recolección de contactos (C-19, 30 por minuto por IP).
 * Lo pide el navegador de la persona; ese mismo pedido registra la visita para las métricas Premium.
 */
export function ProfileContact({ slug, name }: { slug: string; name: string }) {
  const [revealed, setRevealed] = useState(false);
  const profile = useQuery({
    queryKey: ["public-profile", slug],
    queryFn: ({ signal }) => api<PublicProfile>(`/catalog/professionals/${encodeURIComponent(slug)}`, { signal }),
    staleTime: 5 * 60_000,
    retry: false,
  });

  if (!revealed) {
    return (
      <Button variant="accent" size="lg" fullWidth onClick={() => setRevealed(true)}>
        <Phone className="size-5" aria-hidden="true" />
        Ver contacto
      </Button>
    );
  }

  if (profile.isPending) {
    return (
      <Button variant="accent" size="lg" fullWidth loading>
        Cargando contacto…
      </Button>
    );
  }

  if (profile.isError) {
    return <Alert tone="danger" title="No pudimos mostrar el contacto">{errorMessage(profile.error)}</Alert>;
  }

  const { phone, email } = profile.data;
  const tel = telHref(phone);
  const whatsapp = whatsappNumber(phone);
  const greeting = `Hola ${name}, te escribo desde Repara Ya.`;

  return (
    <div className="flex flex-col gap-2" aria-live="polite">
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(greeting)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses({ variant: "accent", size: "lg", fullWidth: true })}
        >
          <WhatsappIcon className="size-5" />
          Escribir por WhatsApp
          <span className="sr-only"> (se abre en otra pestaña)</span>
        </a>
      )}
      {tel && (
        <a href={tel} className={buttonClasses({ variant: "secondary", fullWidth: true })}>
          <Phone className="size-4" aria-hidden="true" />
          {phone}
        </a>
      )}
      <a href={`mailto:${email}`} className={`${buttonClasses({ variant: "secondary", fullWidth: true })} [overflow-wrap:anywhere] whitespace-normal`}>
        <Mail className="size-4 shrink-0" aria-hidden="true" />
        {email}
      </a>
    </div>
  );
}
