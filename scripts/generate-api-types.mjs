// Genera src/lib/api/schema.d.ts desde el OpenAPI del backend (Swagger de NestJS).
// El backend tiene que estar corriendo en desarrollo con SWAGGER_ENABLED=true.
// Uso: npm run api:types  (o API_SPEC_URL=http://host:puerto/api/docs-json npm run api:types)
import { writeFile } from "node:fs/promises";
import openapiTS, { astToString } from "openapi-typescript";

const specUrl = process.env.API_SPEC_URL ?? "http://localhost:3001/api/docs-json";
const output = new URL("../src/lib/api/schema.d.ts", import.meta.url);

const ast = await openapiTS(new URL(specUrl));
const header =
  "// Archivo generado por scripts/generate-api-types.mjs a partir del OpenAPI del backend.\n" +
  "// No editar a mano: regenerar con `npm run api:types`.\n\n";

await writeFile(output, header + astToString(ast));
console.log(`Tipos de la API generados desde ${specUrl}`);
