# Repara Ya — Frontend

Interfaz web de Repara Ya / Nexo PRO: marketplace que conecta clientes con profesionales de oficios.
Consume la API del backend (`Nexo.pro-Backend`); no tiene base de datos ni lógica de negocio propia.

La documentación del backend que este frontend respeta está en [`docs/`](docs/), empezando por
[`docs/BACKEND_AUDIT.md`](docs/BACKEND_AUDIT.md) y [`docs/BACKEND_FRONTEND_CONTRACT.md`](docs/BACKEND_FRONTEND_CONTRACT.md).

## Stack

- Next.js 16 (App Router, Cache Components, Turbopack) · React 19 · TypeScript estricto
- Tailwind CSS 4
- TanStack Query (datos privados), React Hook Form + Zod (formularios), Motion (animaciones),
  socket.io-client (tiempo real), lucide-react (íconos)
- Vitest + Testing Library (unitarias) · Playwright (punta a punta, celular y escritorio)

## Puesta en marcha

Requisitos: Node 20.9 o superior (el proyecto usa la versión de `.nvmrc`) y el backend corriendo en
`http://localhost:3001` para las pantallas que lo consultan.

```bash
npm ci
npm run dev        # http://localhost:3000
```

Las variables públicas de desarrollo están en `.env.development`; para cambiarlas, creá `.env.local`
(ver `.env.example`). **Ninguna variable del frontend puede contener un secreto**: todas terminan en el
JavaScript del navegador.

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Build de producción y servidor (exige `NEXT_PUBLIC_API_URL` y `NEXT_PUBLIC_SITE_URL`) |
| `npm run lint` | ESLint |
| `npm run typecheck` | Tipos de rutas (`next typegen`) y `tsc` |
| `npm run test` | Pruebas unitarias (Vitest) |
| `npm run test:e2e` | Pruebas de punta a punta (Playwright; compila y levanta el build) |
| `npm run check` | Lint, tipos y pruebas unitarias |
| `npm run api:types` | Regenera `src/lib/api/schema.d.ts` desde el OpenAPI del backend |

## Tipos de la API

`src/lib/api/schema.d.ts` se genera desde el Swagger del backend y no se edita a mano. Para
actualizarlo, levantá el backend en desarrollo (con `SWAGGER_ENABLED=true`) y corré `npm run api:types`.
Para otra URL: `API_SPEC_URL=http://host:puerto/api/docs-json npm run api:types`.

## Reglas que no se negocian

- La sesión vive solo en cookies `HttpOnly` de la API: ningún token en `localStorage`, en el cuerpo ni en logs.
- El frontend no autoriza: ocultar una opción es experiencia de usuario; quien decide es el backend.
- El texto que escriben los usuarios se muestra siempre como texto, nunca como HTML.
- No se inventan rutas ni formatos de respuesta: todo sale de `docs/` y de los tipos generados.
