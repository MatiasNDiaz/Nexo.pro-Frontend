import type { Route } from "next";
import { api, type Schemas } from "@/lib/api/client";

/*
 * Notificaciones dentro de la app y avisos push (P-15). El OpenAPI no tipa la lista: la forma sale
 * del backend (`notifications.service.ts`, `toDto`). Llegan nuevas por tiempo real
 * (`notification:new`, ver features/chat/realtime.tsx).
 */

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  targetType: string | null;
  targetId: string | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationPage {
  data: AppNotification[];
  page: number;
  limit: number;
  total: number;
  unread: number;
}

export type PushCategory = Schemas["NotificationPreferenceDto"]["category"];
export type PushPreference = Schemas["NotificationPreferenceDto"];

/** Máximo del backend por página (NotificationsQueryDto). */
export const NOTIFICATIONS_PAGE_SIZE = 20;

export const notificationKeys = {
  all: ["notifications"] as const,
  page: (page: number) => ["notifications", "page", page] as const,
  unread: ["notifications", "unread"] as const,
  preferences: ["notifications", "preferences"] as const,
  pushKey: ["notifications", "push-key"] as const,
};

export const listNotifications = (page: number, limit = NOTIFICATIONS_PAGE_SIZE) =>
  api<NotificationPage>("/notifications", { query: { page, limit } });

export const unreadCount = () => api<{ unread: number }>("/notifications/unread-count");

export const markRead = (id: string) => api(`/notifications/${id}/read`, { method: "POST" });

export const markAllRead = () => api("/notifications/read-all", { method: "POST" });

export const getPreferences = () => api<PushPreference[]>("/notifications/preferences");

export const updatePreferences = (preferences: PushPreference[]) =>
  api<PushPreference[]>("/notifications/preferences", { method: "PUT", body: { preferences } });

export const getPushKey = () => api<Schemas["PushKeyDto"]>("/notifications/push/key");

export const subscribePush = (input: Schemas["PushSubscribeDto"]) =>
  api("/notifications/push/subscriptions", { method: "POST", body: input });

export const unsubscribePush = (endpoint: string) =>
  api("/notifications/push/subscriptions/remove", { method: "POST", body: { endpoint } });

/**
 * A dónde lleva una notificación. Solo destinos que existen en el frontend; el resto no es un enlace.
 * PROFESSIONAL trae el id de usuario (no el slug): se va a favoritos, donde está su perfil.
 */
export function notificationHref(n: Pick<AppNotification, "targetType" | "targetId">): Route | null {
  const id = n.targetId;
  switch (n.targetType) {
    case "CONVERSATION":
      return id ? (`/panel/mensajes/${id}` as Route) : null;
    case "REQUEST":
      return id ? (`/panel/pedidos/${id}` as Route) : null;
    case "CONTRACT":
      return id ? (`/panel/trabajos/${id}` as Route) : null;
    case "FORUM_POST":
      return id ? (`/foro/${id}` as Route) : null;
    case "PROFESSIONAL":
      return "/panel/favoritos" as Route;
    case "REVIEW":
      return "/panel/resenas" as Route;
    case "ANNOUNCEMENT":
      return id ? (`/panel/novedades/${id}` as Route) : null;
    case "SUPPORT_TICKET":
      return id ? (`/panel/soporte/${id}` as Route) : "/panel/soporte";
    case "REPORT":
      return "/panel/reportes";
    case "SANCTION":
    case "STRIKE":
    case "APPEAL":
      return "/panel/moderacion";
    default:
      return null;
  }
}

/** Nombres de las categorías de avisos push (NotificationCategory del backend). */
export const categoryLabel: Record<PushCategory, { title: string; detail: string }> = {
  MESSAGES: { title: "Mensajes", detail: "Mensajes nuevos en tus conversaciones" },
  REQUESTS: { title: "Pedidos y trabajos", detail: "Presupuestos, pedidos y cambios en tus trabajos" },
  ACCOUNT: { title: "Tu cuenta", detail: "Tu plan, reportes, sanciones, soporte y mensajes del equipo" },
  COMMUNITY: { title: "Comunidad", detail: "Reseñas y respuestas en el foro" },
  FAVORITES: { title: "Favoritos", detail: "Cuando un profesional que guardaste está disponible" },
  ANNOUNCEMENTS: { title: "Novedades", detail: "Novedades de Repara Ya" },
  ADMIN_ALERTS: { title: "Alertas de administración", detail: "Solo para el equipo de Repara Ya" },
};
