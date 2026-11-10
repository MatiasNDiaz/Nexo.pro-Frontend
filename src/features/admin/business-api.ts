import { api, apiFile, type Schemas } from "@/lib/api/client";

/*
 * Panel del admin, parte 7.3: soporte, opiniones de la plataforma, novedades e ingresos.
 * Docs E-001, E-002, E-016 a E-019 y E-030 a E-033, E-039 a E-042.
 */

export type Ticket = Schemas["AdminTicketDto"];
export type TicketStatus = Ticket["status"];
export type PlatformReview = Schemas["PlatformReviewDto"];
export type Announcement = Schemas["AdminAnnouncementDto"];
export type AnnouncementInput = Schemas["CreateAnnouncementDto"];
export type RevenueSummary = Schemas["RevenueSummaryDto"];
export type RevenuePayment = Schemas["RevenuePaymentItemDto"];
export type RevenueRegistration = Schemas["RevenueRegistrationItemDto"];
export type AdminPayment = Schemas["AdminPaymentItemDto"];
export type PaymentStatus = AdminPayment["status"];
export type PaymentKind = NonNullable<RevenuePayment["kind"]>;
export type RevenueGroupBy = RevenueSummary["groupBy"];

/** Límites de los DTO del backend. */
export const REPLY_MAX = 2000;
export const ANNOUNCEMENT_TITLE_MAX = 120;
export const ANNOUNCEMENT_BODY_MAX = 2000;
export const ANNOUNCEMENT_MIN = 3;
export const PAGE_SIZE = 20;

export interface RevenueFilters {
  from: string;
  to: string;
  localityId?: string;
}

export const businessKeys = {
  tickets: (status: string, page: number) => ["admin", "tickets", status, page] as const,
  ticketsAll: ["admin", "tickets"] as const,
  ticket: (id: string) => ["admin", "ticket", id] as const,
  platformReviews: (published: string, page: number) => ["admin", "platform-reviews", published, page] as const,
  platformReviewsAll: ["admin", "platform-reviews"] as const,
  announcements: ["admin", "announcements"] as const,
  summary: (filters: RevenueFilters, groupBy: string) => ["admin", "revenue", "summary", filters, groupBy] as const,
  revenuePayments: (filters: object) => ["admin", "revenue", "payments", filters] as const,
  registrations: (filters: object) => ["admin", "revenue", "registrations", filters] as const,
  payments: (filters: object) => ["admin", "payments", filters] as const,
};

const clean = <T extends object>(value: T) => Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined && v !== "")) as Partial<T>;

// ---- Soporte ----
export const listTickets = (status: TicketStatus | "", page: number) =>
  api<{ data: Ticket[]; page: number; limit: number; total: number }>("/admin/support/tickets", { query: clean({ status, page, limit: PAGE_SIZE }) });
export const getTicket = (id: string) => api<Ticket>(`/admin/support/tickets/${id}`);
export const replyTicket = (id: string, body: string) => api<Ticket>(`/admin/support/tickets/${id}/messages`, { method: "POST", body: { body } });
export const closeTicket = (id: string) => api<Ticket>(`/admin/support/tickets/${id}/close`, { method: "POST" });

// ---- Opiniones ----
export const listPlatformReviews = (published: "" | "true" | "false", page: number) =>
  api<Schemas["PlatformReviewPageDto"]>("/admin/platform-reviews", { query: clean({ published, page, limit: PAGE_SIZE }) });
export const setReviewPublished = (id: string, publish: boolean) => api(`/admin/platform-reviews/${id}/${publish ? "publish" : "unpublish"}`, { method: "POST" });

// ---- Novedades ----
export const listAnnouncements = () => api<Announcement[]>("/admin/announcements");
export const publishAnnouncement = (input: AnnouncementInput) => api<Announcement>("/admin/announcements", { method: "POST", body: input });

// ---- Ingresos ----
export const getRevenueSummary = (filters: RevenueFilters, groupBy: RevenueGroupBy) =>
  api<RevenueSummary>("/admin/revenue/summary", { query: clean({ ...filters, groupBy }) });
export const listRevenuePayments = (filters: RevenueFilters & { status?: PaymentStatus; kind?: PaymentKind; page: number }) =>
  api<Schemas["RevenuePaymentListDto"]>("/admin/revenue/payments", { query: clean({ ...filters, limit: PAGE_SIZE }) });
export const listRegistrations = (filters: RevenueFilters & { role?: "CUSTOMER" | "PROFESSIONAL"; hasPaid?: "true" | "false"; page: number }) =>
  api<Schemas["RevenueRegistrationListDto"]>("/admin/revenue/registrations", { query: clean({ ...filters, limit: PAGE_SIZE }) });
/** POST: queda en la auditoría (con CSRF y Origin). Máximo 10 por hora. */
export const exportRevenue = (input: Schemas["RevenueExportDto"]) =>
  apiFile("/admin/revenue/exports", { method: "POST", body: clean(input) as Schemas["RevenueExportDto"] });

// ---- Pagos de Mercado Pago (E-016) ----
export const listAdminPayments = (status: PaymentStatus | "", page: number) =>
  api<Schemas["AdminPaymentListDto"]>("/admin/payments", { query: clean({ status, page, limit: PAGE_SIZE }) });

// ---- Textos ----
type Tone = "success" | "electric" | "danger" | "neutral" | "amber";

export const ticketStatusLabel: Record<TicketStatus, { label: string; tone: Tone }> = {
  OPEN: { label: "Abierta", tone: "amber" },
  ANSWERED: { label: "Respondida", tone: "electric" },
  CLOSED: { label: "Cerrada", tone: "neutral" },
};

export const paymentKindLabel: Record<PaymentKind, string> = {
  NEW: "Primer pago",
  RENEWAL: "Renovación",
  REACTIVATION: "Volvió",
  UPGRADE: "Subió de plan",
};

/** Descarga un Blob con un nombre (sin dejar la URL temporal colgada). */
export function saveFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
