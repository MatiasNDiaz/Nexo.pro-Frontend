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

/** Héroe del inicio: tomas horizontales de trabajo, una por oficio. */
// La primera es la más luminosa: es la que se ve al cargar (y la que se precarga).
export const heroSlides = [
  { photo: photo("hero/ladrillos", "Manos colocando ladrillos con la cuchara", "gowtham-agm", 19688828), trade: "Albañil" },
  { photo: photo("hero/carpinteria", "Carpintero cepillando el marco de una ventana", "kseniachernaya", 5691541), trade: "Carpintero" },
  { photo: photo("hero/caldera", "Técnico revisando una caldera", "heiko-ruth", 7859953), trade: "Gasista" },
  { photo: photo("hero/jardin", "Jardinero podando con tijera", "magda-ehlers", 38936344), trade: "Jardinero" },
  { photo: photo("hero/canerias", "Manos ajustando una cañería", "sejio402", 29226620), trade: "Plomero" },
  { photo: photo("hero/soldadura", "Herrero soldando entre chispas", "kateryna-babaieva", 3678228), trade: "Herrero" },
] as const;

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
  pasillo: photo("escenas/pasillo", "Dos trabajadores con casco en el pasillo de una casa", "davegarcia", 36153946),
  ventana: photo("escenas/ventana", "Trabajador preparando una ventana en un departamento", "kseniachernaya", 5768187),
  escalera: photo("escenas/escalera", "Trabajador sobre una escalera en un departamento luminoso", "kseniachernaya", 5767799),
  obraLuz: photo("escenas/obra-luz", "Trabajador pintando una habitación con luz natural", "tima-miroshnichenko", 6474133),
  yeso: photo("escenas/yeso", "Dos trabajadores aplicando yeso en una habitación", "muhammeddiler", 23358344),
  aberturas: photo("escenas/aberturas", "Trabajador colocando una ventana", "kseniachernaya", 5691521),
} satisfies Record<string, Photo>;

export const allPhotos: Photo[] = [...heroSlides.map((s) => s.photo), ...Object.values(tradePhotos), ...Object.values(scenes)];
