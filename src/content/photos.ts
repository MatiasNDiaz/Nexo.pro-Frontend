/*
 * Fotos del sitio (public/images/oficios). Todas de Unsplash con la licencia gratuita (uso comercial
 * sin atribución obligatoria), verificada en la página de cada foto el 2026-11-08; ninguna es de
 * Unsplash+. Son ilustrativas: no muestran a profesionales de Repara Ya y no se presentan como tales.
 * Igual se da crédito en el pie de página.
 */

export interface Photo {
  src: string;
  alt: string;
  author: string;
  page: string;
}

const photo = (file: string, alt: string, author: string, slug: string): Photo => ({
  src: `/images/oficios/${file}.jpg`,
  alt,
  author,
  page: `https://unsplash.com/photos/${slug}`,
});

export const photos = {
  electricista: photo("electricista", "Manos con guantes midiendo un tablero eléctrico con un tester", "Toolmash Expo", "PkHf7BUWbtk"),
  plomero: photo("plomero", "Plomero trabajando en la instalación de un baño", "bhagya laxmi", "jaP5ClBdIyU"),
  carpintero: photo("carpintero", "Carpintero marcando una tabla en su taller", "Minh Đức", "lQIUbkn6jj4"),
  obra: photo("obra", "Trabajador con casco sobre la estructura de madera de una casa", "Josh Olalde", "X1P1_EDNnok"),
  equipo: photo("equipo", "Equipo armando un deck de madera al aire libre", "TROY ALLEN", "Dbn68nqrA14"),
  jardinero: photo("jardinero", "Jardinero con ropa de trabajo en un jardín", "Lara John", "UijIjarr5Gg"),
  albanil: photo("albanil", "Mano con cuchara de albañil aplicando mezcla", "Gowtham AGM", "MXPWld5uysw"),
  herramientas: photo("herramientas", "Herramientas sobre un banco de carpintería", "HENG YIN", "KKY0GrQPqVo"),
  pintor: photo("pintor", "Pintor sobre un andamio pintando una pared", "Ernys", "57ldq9age5U"),
} satisfies Record<string, Photo>;

/** Fotos del héroe del inicio, con el oficio que muestran (el slug lleva al catálogo filtrado). */
export const heroSlides = [
  { photo: photos.electricista, trade: "Electricista", slug: "electricista" },
  { photo: photos.plomero, trade: "Plomero", slug: "plomero" },
  { photo: photos.carpintero, trade: "Carpintero", slug: "carpintero" },
  { photo: photos.obra, trade: "Albañil", slug: "albanil" },
  { photo: photos.jardinero, trade: "Jardinero", slug: "jardinero" },
] as const;
