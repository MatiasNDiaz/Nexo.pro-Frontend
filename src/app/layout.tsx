import type { Metadata } from "next";
import { env } from "@/config/env";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: "Repara Ya — Profesionales de oficios de confianza",
    template: "%s · Repara Ya",
  },
  description:
    "Encontrá profesionales verificados de tu zona, pedí presupuestos y coordiná el trabajo en un solo lugar.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
