import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { env } from "@/config/env";
import "./globals.css";

// Fuentes variables autoalojadas por next/font (sin pedidos a Google desde el navegador y sin saltos
// de layout). Inter para textos largos e interfaz; Plus Jakarta Sans para títulos.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });

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
    <html lang="es-AR" className={`${inter.variable} ${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
