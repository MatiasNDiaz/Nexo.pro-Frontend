/** Datos públicos de contacto y redes de Repara Ya (los muestra el footer). */
export const site = {
  name: "Repara Ya",
  tagline: "Profesionales de oficios de confianza, cerca tuyo.",
  contact: {
    /** Como se muestra. */
    phoneDisplay: "351 506-7276",
    /**
     * Número en formato internacional para WhatsApp: 54 (Argentina) + 9 (celular) + 351 (Córdoba,
     * sin el 0) + número sin el 15. `wa.me` solo acepta dígitos.
     */
    whatsappNumber: "5493515067276",
    email: "matidiazargentino21@gmail.com",
  },
  social: {
    linkedin: "https://www.linkedin.com/in/matias--diaz/",
    instagram: "https://www.instagram.com/_maty_diaz_/",
  },
} as const;

/** Enlace para iniciar una conversación de WhatsApp, con un mensaje inicial opcional. */
export function whatsappUrl(message?: string): string {
  const url = new URL(`https://wa.me/${site.contact.whatsappNumber}`);
  if (message) url.searchParams.set("text", message);
  return url.toString();
}
