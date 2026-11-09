import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Serif, Inter } from "next/font/google";
import { env } from "@/config/env";
import { POPSTATE_GATE } from "@/lib/popstate-gate";
import "./globals.css";
import { Providers } from "./providers";

// Fuentes variables autoalojadas por next/font (sin pedidos a Google desde el navegador y sin saltos
// de layout). Inter para textos largos e interfaz; Archivo (con su eje de ancho) para títulos.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
// Serif de exhibición, solo para acentos (nombres de los planes).
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: "Repara Ya — Profesionales de oficios de confianza",
    template: "%s · Repara Ya",
  },
  description:
    "Encontrá profesionales con identidad verificada en tu zona, pedí presupuestos por chat y coordiná el trabajo en un solo lugar.",
  applicationName: "Repara Ya",
  openGraph: { type: "website", locale: "es_AR", siteName: "Repara Ya" },
};

export const viewport: Viewport = {
  themeColor: "#0b1f3a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className={`${inter.variable} ${archivo.variable} ${instrument.variable} h-full antialiased`}>
      <head>
        {/* Antes que el router de Next: ver src/lib/popstate-gate.ts. */}
        <script dangerouslySetInnerHTML={{ __html: POPSTATE_GATE }} />
      </head>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
