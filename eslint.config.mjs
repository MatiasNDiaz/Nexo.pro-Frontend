import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
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
