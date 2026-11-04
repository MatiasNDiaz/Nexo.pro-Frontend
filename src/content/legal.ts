/*
 * Contenido de las páginas legales. PROVISORIO: estructura preparada para el texto definitivo que
 * redacte el asesor legal del proyecto. No contiene cláusulas inventadas: cada sección queda marcada
 * como pendiente hasta que se reemplace por el texto aprobado.
 *
 * Para publicar el texto definitivo: completar `sections[].body` (un párrafo por elemento), poner
 * `provisional: false` y actualizar `updatedAt` (AAAA-MM-DD).
 */

export interface LegalSection {
  id: string;
  title: string;
  /** Párrafos. Vacío = pendiente de redacción. */
  body: string[];
}

export interface LegalDocument {
  title: string;
  description: string;
  provisional: boolean;
  updatedAt: string | null;
  sections: LegalSection[];
}

export const legalNotice: LegalDocument = {
  title: "Aviso legal",
  description: "Información sobre el titular del sitio y las condiciones de uso de su contenido.",
  provisional: true,
  updatedAt: null,
  sections: [
    { id: "titular", title: "Titular del sitio", body: [] },
    { id: "objeto", title: "Objeto del sitio", body: [] },
    { id: "propiedad-intelectual", title: "Propiedad intelectual", body: [] },
    { id: "responsabilidad", title: "Responsabilidad", body: [] },
    { id: "datos-personales", title: "Datos personales", body: [] },
  ],
};

export const terms: LegalDocument = {
  title: "Términos y condiciones",
  description: "Condiciones que rigen el uso de Repara Ya por parte de clientes y profesionales.",
  provisional: true,
  updatedAt: null,
  sections: [
    { id: "aceptacion", title: "Aceptación de los términos", body: [] },
    { id: "cuentas", title: "Cuentas y verificación de identidad", body: [] },
    { id: "uso", title: "Uso de la plataforma", body: [] },
    { id: "planes", title: "Planes y pagos de profesionales", body: [] },
    { id: "contenido", title: "Contenido publicado por los usuarios", body: [] },
    { id: "moderacion", title: "Reportes, moderación y sanciones", body: [] },
    { id: "baja", title: "Baja de la cuenta", body: [] },
    { id: "modificaciones", title: "Modificaciones", body: [] },
  ],
};
