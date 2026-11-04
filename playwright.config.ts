import { defineConfig, devices } from "@playwright/test";

// Puertos propios: así nunca se reutiliza por error un `next dev` (3000) ni el backend real (3001).
const PORT = 3100;
const MOCK_API_PORT = 3199;
const baseURL = `http://localhost:${PORT}`;
const apiURL = `http://localhost:${MOCK_API_PORT}`;

/**
 * Pruebas de punta a punta contra el build de producción (`next start`), que es lo que ve la gente.
 * Dos proyectos: celular primero (la experiencia principal) y escritorio.
 * La API es una simulación (e2e/support/mock-server.mjs) para las páginas que arma el servidor de
 * Next; los pedidos del navegador se pueden además interceptar por prueba (e2e/support/mock-api.ts).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: [
    {
      command: `node e2e/support/mock-server.mjs ${MOCK_API_PORT}`,
      url: `${apiURL}/health`,
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: `npm run build && npm run start -- --port ${PORT}`,
      url: baseURL,
      reuseExistingServer: false,
      timeout: 240_000,
      // `next build` no lee .env.development: las variables públicas se pasan explícitas.
      env: {
        NEXT_PUBLIC_API_URL: apiURL,
        NEXT_PUBLIC_SITE_URL: baseURL,
      },
    },
  ],
});
