/*
 * Fotos del sitio (public/images). Todas de Pexels con la Pexels License (uso comercial gratis, sin
 * atribución obligatoria; verificada el 2026-11-08). Son ilustrativas: no muestran a profesionales de
 * Repara Ya, no se presentan como tales ni sugieren que las personas recomiendan el servicio (la
 * licencia lo prohíbe). Igual se da crédito en el pie de página.
 */

export interface Photo {
  src: string;
  alt: string;
  author: string;
  page: string;
}

// author: usuario de Pexels tal como figura en el sitio (no se deducen nombres).
const photo = (path: string, alt: string, author: string, id: number): Photo => ({
  src: `/images/${path}.jpg`,
  alt,
  author,
  page: `https://www.pexels.com/photo/${id}/`,
});

/**
 * Héroe del inicio: una toma abierta por oficio (la persona trabajando en su lugar, no un primer plano
 * de manos), de 3200 px para que se vea nítida en pantallas grandes. `focus` es el punto de interés:
 * en el celular la foto se recorta en vertical y ese punto queda a la vista.
 */
// La primera es la más luminosa: es la que se ve al cargar (y la que se precarga).
export const heroSlides = [
  { photo: photo("hero/electricista", "Electricista con casco trabajando en una pared", "shkrabaanthony", 4981793), trade: "Electricista", focus: "42% 40%" },
  { photo: photo("hero/albanil", "Dos albañiles levantando una pared de ladrillos", "nishantaneja", 9172008), trade: "Albañil", focus: "45% 50%" },
  { photo: photo("hero/carpintero", "Carpintero trabajando la madera en su taller", "hson", 32357250), trade: "Carpintero", focus: "68% 40%" },
  { photo: photo("hero/gasista", "Técnico revisando una caldera", "2157750954", 34938442), trade: "Gasista", focus: "32% 45%" },
  { photo: photo("hero/jardinero", "Jardinero trabajando la tierra entre los árboles", "karen-f-1376469", 16520685), trade: "Jardinero", focus: "74% 55%" },
  { photo: photo("hero/plomero", "Plomero revisando la instalación de un baño", "kathleen-austin-kuhn-2152973960", 32497162), trade: "Plomero", focus: "55% 45%" },
  { photo: photo("hero/herrero", "Herrero soldando con máscara entre chispas", "zeoxs", 12366518), trade: "Herrero", focus: "45% 45%" },
  { photo: photo("hero/pintor", "Dos pintores preparando una pared con una escalera", "blue-bird", 7217983), trade: "Pintor", focus: "70% 40%" },
] as const;

/** Banners anchos de las secciones del menú (encabezado de cada página). */
export const banners = {
  profesionales: photo("banners/profesionales", "Equipo de trabajadores en una obra", "denniz-futalan-339724", 4956920),
  foro: photo("banners/foro", "Una clienta y un profesional revisando un plano en una casa en reforma", "mikael-blomkvist", 8961295),
  contacto: photo("banners/contacto", "Persona escribiendo en la computadora, con un café y un cuaderno", "ketut-subiyanto", 4126739),
  clientes: photo("banners/clientes", "Familia contándole a una profesional lo que necesita en su casa", "mart-production", 7415049),
} satisfies Record<string, Photo>;

/** Una foto por oficio, por slug del catálogo (GET /professions). */
export const tradePhotos: Record<string, Photo> = {
  electricista: photo("oficios/electricista", "Electricista midiendo un tablero con el tester", "bulat843", 34054464),
  plomero: photo("oficios/plomero", "Plomero instalando caños", "anilkarakaya", 6419128),
  carpintero: photo("oficios/carpintero", "Carpintero agujereando madera con el taladro", "tima-miroshnichenko", 6790048),
  pintor: photo("oficios/pintor", "Pintor marcando una pared antes de pintar", "blue-bird", 7218579),
  albanil: photo("oficios/albanil", "Albañil trabajando en una pared de ladrillo", "shubham-jana", 8586035),
  cerrajero: photo("oficios/cerrajero", "Cerrajero en su taller de llaves", "muhammeddiler", 35578808),
  herrero: photo("oficios/herrero", "Herrero soldando con máscara", "kateryna-babaieva", 2880871),
  jardinero: photo("oficios/jardinero", "Jardinero cuidando plantas con flores", "pamanjoe", 40582857),
  gasista: photo("oficios/gasista", "Mano ajustando la perilla de una cocina a gas", "kindelmedia", 8172864),
  "tecnico-en-refrigeracion": photo("oficios/refrigeracion", "Técnico reparando un aire acondicionado", "richard-low-hong", 7347538),
};

/** Escenas de obra en casas, para encabezados y secciones. */
export const scenes = {
  aberturas: photo("escenas/aberturas", "Trabajador colocando una ventana", "kseniachernaya", 5691521),
  artesano: photo("escenas/artesano", "Artesano con delantal en su taller", "odavidarts", 14937294),
  familiaReforma: photo("escenas/familia-reforma", "Madre e hijo mirando el celular en plena reforma de su casa", "ivan-s", 5799025),
  lampara: photo("escenas/lampara", "Hombre colgando una lámpara en el techo de su casa", "anete-lusina", 4792521),
} satisfies Record<string, Photo>;

export const allPhotos: Photo[] = [...heroSlides.map((s) => s.photo), ...Object.values(banners), ...Object.values(tradePhotos), ...Object.values(scenes)];
