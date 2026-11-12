import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // zod solo desde src/lib/zod.ts: aplica la configuración que pide la CSP y evita que vuelva a
    // viajar en todas las páginas (lo cargaba src/config/env.ts; ~110 KB por página).
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/zod.ts"],
    rules: {
      "no-restricted-imports": ["error", { paths: [{ name: "zod", message: 'Importá z desde "@/lib/zod".' }] }],
    },
  },
  globalIgnores([
    // Ignorados por defecto de eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generado desde el OpenAPI del backend:
    "src/lib/api/schema.d.ts",
    // Reportes de Playwright:
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
