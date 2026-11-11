import {
  BarChart3,
  Bell,
  Briefcase,
  CalendarClock,
  Crown,
  FileText,
  Fingerprint,
  Flag,
  Gavel,
  Heart,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  MapPin,
  Megaphone,
  MessagesSquare,
  Palette,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Route } from "next";
import type { Me } from "@/features/session/api";

/*
 * Secciones del panel por rol (solo experiencia: el backend autoriza cada pedido). Una sola fuente
 * para el menú lateral y para los accesos rápidos del inicio: cada sección dice en una frase qué se
 * puede hacer ahí, así cada rol entiende sus funciones sin tener que abrirlas.
 */

export type Counter = "messages" | "notifications";

export interface PanelLink {
  href: Route;
  label: string;
  /** Qué se puede hacer ahí, en una frase (se ve en los accesos rápidos). */
  description: string;
  icon: LucideIcon;
  /** Contador en el menú lateral. */
  counter?: Counter;
}

export interface PanelGroup {
  label: string;
  links: PanelLink[];
}

const home: PanelLink = { href: "/panel", label: "Inicio", description: "Accesos rápidos a todo tu panel.", icon: LayoutDashboard };
const security: PanelLink = { href: "/panel/seguridad", label: "Seguridad", description: "Contraseña, ingreso con Google y dispositivos con tu sesión abierta.", icon: ShieldCheck };
const moderation: PanelLink = { href: "/panel/moderacion", label: "Sanciones", description: "Mirá si tenés alguna medida y apelala si creés que fue un error.", icon: Gavel };
const notifications: PanelLink = {
  href: "/panel/notificaciones",
  label: "Notificaciones",
  description: "Todo lo que pasó con tus mensajes, pedidos, trabajos y tu cuenta.",
  icon: Bell,
  counter: "notifications",
};
const messages: PanelLink = { href: "/panel/mensajes", label: "Mensajes", description: "Tus conversaciones, con fotos y archivos.", icon: MessagesSquare, counter: "messages" };

const help: PanelLink[] = [
  { href: "/panel/soporte", label: "Soporte", description: "Escribinos lo que necesites y seguí la respuesta.", icon: LifeBuoy },
  { href: "/panel/reportes", label: "Mis reportes", description: "Lo que nos avisaste y en qué quedó.", icon: Flag },
  moderation,
  { href: "/panel/opinion", label: "Tu opinión", description: "Contanos cómo te resulta Repara Ya.", icon: Sparkles },
];

const account: PanelLink[] = [
  { href: "/panel/cuenta", label: "Mi cuenta", description: "Foto, nombre, teléfono y tus datos personales.", icon: UserRound },
  { href: "/panel/verificacion", label: "Verificación", description: "Verificá tu identidad para usar todas las funciones.", icon: Fingerprint },
  security,
];

export function panelGroupsFor(user: Me): PanelGroup[] {
  // Con la cuenta suspendida o bloqueada, el backend solo permite ver las sanciones, apelar y la seguridad.
  if (user.status === "SUSPENDED" || user.status === "BANNED") return [{ label: "Tu cuenta", links: [home, moderation, security] }];
  if (user.role === "ADMIN") return adminGroups();
  const active = user.status === "ACTIVE";
  return [
    { label: "Inicio", links: [home] },
    ...(user.role === "PROFESSIONAL" ? professionalGroups(active) : customerGroups(active)),
    // Soporte, reportes y opinión exigen la cuenta activa; las sanciones se ven también por verificar.
    { label: "Ayuda", links: active ? help : [moderation] },
    { label: "Tu cuenta", links: [notifications, ...account] },
  ];
}

/** Cliente: buscar y contratar, y después reseñar y guardar. Todo exige la cuenta activa. */
function customerGroups(active: boolean): PanelGroup[] {
  if (!active) return [];
  return [
    {
      label: "Contratar",
      links: [
        { href: "/profesionales", label: "Buscar profesionales", description: "Encontrá por oficio y zona, y pedí presupuesto sin compromiso.", icon: Search },
        { href: "/panel/pedidos", label: "Pedidos", description: "Los presupuestos que pediste y lo que respondió cada profesional.", icon: FileText },
        messages,
        { href: "/panel/trabajos", label: "Trabajos", description: "Lo que contrataste: seguilo, confirmalo y dalo por terminado.", icon: Briefcase },
      ],
    },
    {
      label: "Tus profesionales",
      links: [
        { href: "/panel/favoritos", label: "Favoritos", description: "Los profesionales que guardaste para tenerlos a mano.", icon: Heart },
        { href: "/panel/resenas", label: "Mis reseñas", description: "Contá cómo te fue con cada trabajo terminado.", icon: Star },
      ],
    },
  ];
}

/**
 * Profesional: el trabajo del día, su página y su negocio. Chat, pedidos, trabajos y reseñas exigen la
 * cuenta activa; agenda, perfil, diseño, métricas y plan se usan también por verificar (como el backend).
 */
function professionalGroups(active: boolean): PanelGroup[] {
  const agenda: PanelLink = { href: "/panel/agenda", label: "Agenda", description: "Cuándo atendés y tu estado: disponible, trabajando o ausente.", icon: CalendarClock };
  return [
    {
      label: "Tu trabajo",
      links: active
        ? [
            { href: "/panel/solicitudes", label: "Pedidos recibidos", description: "Clientes que te pidieron presupuesto: respondé y cotizá.", icon: Inbox },
            messages,
            { href: "/panel/trabajos", label: "Trabajos", description: "Agendá, empezá y terminá los trabajos que te confirmaron.", icon: Briefcase },
            agenda,
          ]
        : [agenda],
    },
    {
      label: "Tu página",
      links: [
        { href: "/panel/perfil", label: "Mi perfil", description: "Descripción, oficios, zonas, fotos, videos y certificados.", icon: Store },
        { href: "/panel/perfil/diseno", label: "Diseño de mi página", description: "Colores y estilo de cada parte de tu página (Medium y Premium).", icon: Palette },
        ...(active ? [{ href: "/panel/resenas" as Route, label: "Reseñas", description: "Lo que cuentan tus clientes. Respondé cada una.", icon: Star }] : []),
      ],
    },
    {
      label: "Tu negocio",
      links: [
        { href: "/panel/metricas", label: "Métricas", description: "Cuánta gente ve tu página y cuántos te contactan.", icon: BarChart3 },
        { href: "/panel/plan", label: "Mi plan", description: "Tu plan, los días que te quedan, cambiar de plan y tus pagos.", icon: Crown },
      ],
    },
  ];
}

/** Admin: primero lo que espera una decisión; después personas y contenido, el negocio y su cuenta. */
function adminGroups(): PanelGroup[] {
  return [
    { label: "Inicio", links: [{ ...home, label: "Resumen", description: "Lo pendiente y los números de la plataforma." }] },
    {
      label: "Para revisar",
      links: [
        { href: "/panel/admin/reportes", label: "Reportes", description: "Lo que denunciaron los usuarios: revisá el contenido y resolvé.", icon: Flag },
        { href: "/panel/admin/apelaciones", label: "Apelaciones", description: "Pedidos para revisar un strike o una sanción.", icon: Gavel },
        { href: "/panel/admin/identidades", label: "Identidades", description: "Aprobá o rechazá verificaciones y cambios de foto o nombre.", icon: Fingerprint },
        { href: "/panel/admin/soporte", label: "Soporte", description: "Consultas de usuarios y del formulario de contacto.", icon: LifeBuoy },
      ],
    },
    {
      label: "Personas y contenido",
      links: [
        { href: "/panel/admin/usuarios", label: "Usuarios", description: "Buscá cualquier cuenta, mirá su ficha y tomá medidas.", icon: Users },
        { href: "/panel/admin/barrios", label: "Barrios", description: "Aprobá, corregí o fusioná los barrios que escribe la gente.", icon: MapPin },
        { href: "/panel/admin/opiniones", label: "Opiniones", description: "Elegí qué opiniones sobre Repara Ya se ven en el inicio.", icon: Sparkles },
        { href: "/panel/admin/novedades", label: "Novedades", description: "Mandá avisos a todos o a un grupo de usuarios.", icon: Megaphone },
      ],
    },
    {
      label: "Negocio",
      links: [{ href: "/panel/admin/ingresos", label: "Ingresos", description: "Pagos, devoluciones, registros y resumen neto. Exportá a CSV.", icon: Wallet }],
    },
    { label: "Tu cuenta", links: [notifications, security] },
  ];
}

/**
 * La sección marcada es la de dirección más larga que coincide: así en /panel/perfil/diseno se marca
 * "Diseño de mi página" y no también "Mi perfil".
 */
export function activeHref(groups: PanelGroup[], pathname: string): string | null {
  let best: string | null = null;
  for (const { href } of groups.flatMap((group) => group.links)) {
    const matches = href === "/panel" ? pathname === "/panel" : pathname === href || pathname.startsWith(`${href}/`);
    if (matches && (best === null || href.length > best.length)) best = href;
  }
  return best;
}
