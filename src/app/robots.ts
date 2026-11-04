import type { MetadataRoute } from "next";
import { env } from "@/config/env";

/**
 * Se permite rastrear todo y se indica el sitemap. Las páginas privadas o de un solo uso (cuenta,
 * enlaces de email, legales provisorios) NO se bloquean acá a propósito: llevan `noindex`, y un
 * buscador bloqueado por robots.txt no llega a ver ese `noindex` (podría listar la URL igual).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${env.siteUrl}/sitemap.xml`,
  };
}
