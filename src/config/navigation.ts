import type { Route } from "next";
import type { Viewer } from "@/features/session/viewer";

export interface NavItem {
  href: Route;
  label: string;
}

const home: NavItem = { href: "/", label: "Inicio" };
const professionals: NavItem = { href: "/profesionales", label: "Profesionales" };
const clients: NavItem = { href: "/clientes", label: "Clientes" };
const forum: NavItem = { href: "/foro", label: "Foro" };
const contact: NavItem = { href: "/contacto", label: "Contacto" };
const dashboard: NavItem = { href: "/panel", label: "Panel" };

/**
 * Secciones principales según quién mira (definición de producto del fundador). Es solo experiencia
 * de usuario: si una sección no corresponde al rol, no se ofrece, pero la autorización real la hace el
 * backend en cada ruta.
 *
 * Mientras la sesión se está resolviendo se muestran las secciones públicas (las que ve todo el
 * mundo), para no ofrecer de más ni hacer saltar el menú.
 */
export function mainNavFor(viewer: Viewer): NavItem[] {
  if (viewer.status !== "authenticated") return [home, professionals, forum, contact];
  switch (viewer.role) {
    case "PROFESSIONAL":
      return [home, clients, forum, contact, dashboard];
    case "CUSTOMER":
      return [home, professionals, forum, contact, dashboard];
    case "ADMIN":
      // El fundador todavía no definió la navegación del admin: por ahora, la del cliente.
      return [home, professionals, forum, contact, dashboard];
  }
}

/** ¿El enlace corresponde a la ruta actual? Inicio solo coincide exacto; el resto, también con subrutas. */
export function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
