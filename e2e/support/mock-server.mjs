// API simulada para las pruebas de punta a punta (sin dependencias). La usa el SERVIDOR de Next para
// armar las páginas públicas (Playwright solo intercepta pedidos del navegador). Formas según
// docs/BACKEND_ENDPOINTS.md. Incluye datos maliciosos a propósito para probar que no se ejecutan.
// Uso: node e2e/support/mock-server.mjs <puerto>
import { createServer } from "node:http";

const PORT = Number(process.argv[2] ?? 3199);
const PREFIX = "/api/v1";

const PROVINCE = { id: "33333333-3333-4333-8333-333333333333", name: "Córdoba" };
const LOCALITY = { id: "11111111-1111-4111-8111-111111111111", name: "Córdoba" };
const PROFESSIONS = [
  { id: "22222222-2222-4222-8222-222222222222", name: "Electricista", slug: "electricista" },
  { id: "55555555-5555-4555-8555-555555555555", name: "Plomero", slug: "plomero" },
];

const base = (overrides) => ({
  professionalUserId: "00000000-0000-4000-8000-0000000000a1",
  businessName: null,
  avatarUrl: null,
  bio: "Instalaciones eléctricas domiciliarias.",
  yearsExperience: 8,
  referenceRate: "15000.00",
  rateMode: "PER_VISIT",
  freeQuote: true,
  attentionStatus: "AVAILABLE",
  identityVerified: true,
  professions: [{ id: PROFESSIONS[0].id, name: "Electricista", isPrimary: true }],
  serviceAreas: [{ localityId: LOCALITY.id, localityName: "Córdoba", neighborhoodId: null, neighborhoodName: null }],
  coverImageUrl: null,
  catalogVideoUrl: null,
  ratingAverage: 4.5,
  ratingCount: 12,
  ...overrides,
});

const ITEMS = [
  base({ slug: "ana-perez-ab12c", firstName: "Ana", lastName: "Pérez" }),
  base({
    slug: "juan-gomez-xy34z",
    professionalUserId: "00000000-0000-4000-8000-0000000000a2",
    firstName: "Juan",
    lastName: "Gómez",
    attentionStatus: "RESTING",
    professions: [{ id: PROFESSIONS[1].id, name: "Plomero", isPrimary: true }],
    ratingAverage: null,
    ratingCount: 0,
    freeQuote: false,
  }),
];

const PROFILE = {
  ...ITEMS[0],
  bio: 'Electricista matriculada. </script><script>window.__xss = true</script> <img src=x onerror="window.__xss=true">',
  worksWithTeam: true,
  hasMobility: true,
  email: "ana@example.com",
  // Distinto del teléfono de contacto del sitio (footer), para que la prueba de "no está en el HTML" sea real.
  phone: "3519998877",
  theme: {},
  banner: null,
  media: [],
  certifications: [{ title: "Matrícula", institution: "ERSeP", issuedYear: 2020, kind: "DOCUMENT", url: "https://example.com/c.pdf", verified: false }],
  socialLinks: [
    { network: "INSTAGRAM", url: "https://instagram.com/ana" },
    { network: "WEBSITE", url: "javascript:alert(1)" },
  ],
  availability: {
    slots: [{ weekday: 1, start: "08:00", end: "17:00" }],
    exceptions: [{ startDate: "2026-12-24", endDate: "2026-12-26", type: "HOLIDAY" }],
  },
};

const review = (n) => ({
  id: `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
  rating: n % 2 ? 5 : 4,
  comment: n === 1 ? "<b>Excelente</b> trabajo" : `Reseña ${n}`,
  author: { displayName: `Cliente ${n}.` },
  reply: n === 1 ? { body: "¡Gracias!", repliedAt: "2026-11-02T10:00:00.000Z" } : null,
  edited: false,
  createdAt: "2026-11-01T12:00:00.000Z",
});
const REVIEWS = Array.from({ length: 12 }, (_, i) => review(i + 1));

function catalog(query) {
  let data = ITEMS;
  if (query.get("professionId")) data = data.filter((i) => i.professions.some((p) => p.id === query.get("professionId")));
  if (query.get("availableNow") === "true") data = data.filter((i) => i.attentionStatus === "AVAILABLE");
  const page = Number(query.get("page") ?? 1);
  const limit = Number(query.get("limit") ?? 20);
  return { data: data.slice((page - 1) * limit, page * limit), page, limit, total: data.length };
}

function route(method, path, query) {
  if (method !== "GET") return [404, { statusCode: 404, code: "NOT_FOUND", message: "Sin simulación" }];
  if (path === "/auth/csrf") return [401, { statusCode: 401, code: "UNAUTHORIZED", message: "Iniciá sesión." }];
  if (path === "/professions") return [200, PROFESSIONS];
  if (path === "/locations/provinces") return [200, [PROVINCE]];
  if (path === "/locations/localities") return [200, [LOCALITY]];
  if (path === "/locations/neighborhoods") return [200, [{ id: "44444444-4444-4444-8444-444444444444", name: "Nueva Córdoba" }]];
  if (path === "/catalog/professionals") return [200, catalog(query)];
  const reviews = /^\/catalog\/professionals\/([^/]+)\/reviews$/.exec(path);
  if (reviews) {
    if (reviews[1] !== PROFILE.slug) return [404, { statusCode: 404, code: "PROFILE_NOT_FOUND", message: "El perfil no existe." }];
    const page = Number(query.get("page") ?? 1);
    const limit = Number(query.get("limit") ?? 20);
    return [200, { data: REVIEWS.slice((page - 1) * limit, page * limit), average: 4.5, count: REVIEWS.length, page, limit }];
  }
  const profile = /^\/catalog\/professionals\/([^/]+)$/.exec(path);
  if (profile) {
    return profile[1] === PROFILE.slug
      ? [200, PROFILE]
      : [404, { statusCode: 404, code: "PROFILE_NOT_FOUND", message: "El perfil no existe." }];
  }
  return [404, { statusCode: 404, code: "NOT_FOUND", message: "Sin simulación" }];
}

createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  const origin = req.headers.origin;
  const cors = origin
    ? {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Requested-With, X-CSRF-Token",
      }
    : {};
  if (req.method === "OPTIONS") {
    res.writeHead(204, cors).end();
    return;
  }
  if (url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain" }).end("ok");
    return;
  }
  const path = url.pathname.startsWith(PREFIX) ? url.pathname.slice(PREFIX.length) : url.pathname;
  const [status, body] = route(req.method ?? "GET", path, url.searchParams);
  res.writeHead(status, { "Content-Type": "application/json", ...cors }).end(JSON.stringify(body));
}).listen(PORT, () => console.log(`API simulada en http://localhost:${PORT}`));
