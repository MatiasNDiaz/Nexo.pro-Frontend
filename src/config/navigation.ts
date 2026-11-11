import type { Route } from "next";
import type { Viewer } from "@/features/session/viewer";

export interface NavItem {
  href: Route;
  label: string;
}

const home: NavItem = { href: "/", label: "Inicio" };
const professionals: NavItem = { href: "/profesionales", label: "Profesionales" };
// En el panel: es solo para profesionales con sesión (ADR 0037 del backend).
const clients: NavItem = { href: "/panel/clientes", label: "Clientes" };
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
  switch (viewer.user.role) {
    case "PROFESSIONAL":
      return [home, clients, forum, contact, dashboard];
    case "CUSTOMER":
      return [home, professionals, forum, contact, dashboard];
    case "ADMIN":
      // El fundador todavía no definió la navegación del admin: por ahora, la del cliente.
      return [home, professionals, forum, contact, dashboard];
  }
}

function matches(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * ¿El enlace corresponde a la ruta actual? Inicio solo coincide exacto; el resto, también con subrutas.
 * Con `items`, gana el más específico: en /panel/clientes se marca "Clientes" y no también "Panel".
 */
export function isActive(href: string, pathname: string, items: NavItem[] = []): boolean {
  if (!matches(href, pathname)) return false;
  return !items.some((other) => other.href.length > href.length && matches(other.href, pathname));
}
