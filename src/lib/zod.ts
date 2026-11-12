import { z } from "zod";

/*
 * zod configurado para el sitio. Todo el código importa `z` desde acá (nunca desde "zod" directo):
 * así la configuración se aplica antes que cualquier esquema, y zod solo viaja en las páginas con
 * formularios (antes lo cargaba src/config/env.ts en todas).
 *
 * Sin compilar validadores con `new Function`: la CSP (src/config/csp.ts) no permite eval y zod, al
 * probar si puede, deja un reporte de violación aunque siga andando.
 */
z.config({ jitless: true });

export { z };
