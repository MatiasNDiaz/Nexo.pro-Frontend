import { api, type Schemas } from "@/lib/api/client";
import type { ProfessionalMe } from "@/features/pro-profile/api";

/*
 * El trabajo del profesional (etapa 6): pedidos recibidos y presupuestos, avance de los trabajos,
 * agenda (estado de atención, horario y días sin atención), certificados, reseñas recibidas, plan y
 * pagos (Mercado Pago) y métricas. Docs E-086 a E-104, E-093 a E-097, E-121 a E-125 y E-152 a E-161.
 */

export type ServiceRequest = Schemas["RequestDto"];
export type Contract = Schemas["ContractDto"];
export type OwnReview = Schemas["OwnReviewDto"];
export type PlanOption = Schemas["PlanOptionDto"];
export type AttentionStatus = Schemas["AttentionDto"]["manual"];
export type ExceptionType = Schemas["AddAvailabilityExceptionDto"]["type"];
export type Metrics = Schemas["ProfessionalMetricsDto"];

/** Lo que devuelve GET /subscriptions/me/payments (PaymentItemDto; el OpenAPI no lo tipa). */
export interface Payment {
  id: string;
  planCode: string;
  purpose: "SUBSCRIPTION" | "UPGRADE_DIFFERENCE";
  amount: string;
  currency: string;
  status: "CREATED" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "REFUNDED" | "CHARGED_BACK";
  applied: boolean;
  reverted: boolean;
  grantedFrom: string | null;
  grantedUntil: string | null;
  createdAt: string;
}

/** Límites de los DTO del backend. */
export const QUOTE_DESCRIPTION_MAX = 1000;
export const REPLY_MAX = 1000;
export const EXCEPTION_NOTE_MAX = 120;
export const CERT_TITLE_MAX = 120;
export const MAX_SLOTS = 28;

export const workKeys = {
  received: ["requests", "received"] as const,
  request: (id: string) => ["requests", id] as const,
  reviewsReceived: ["reviews", "received"] as const,
  plans: ["subscription", "plans"] as const,
  payments: ["subscription", "payments"] as const,
  metrics: (from: string, to: string, groupBy: string) => ["metrics", from, to, groupBy] as const,
};

// ---- Pedidos y presupuestos ----
export const listReceived = () => api<ServiceRequest[]>("/requests/received");
export const getRequest = (id: string) => api<ServiceRequest>(`/requests/${id}`);

export function sendQuote(targetId: string, input: { amount: number; description?: string; proposedDate?: string }) {
  return api<ServiceRequest>(`/requests/targets/${targetId}/quotes`, { method: "POST", body: input });
}

export const withdrawQuote = (quoteId: string) => api<ServiceRequest>(`/requests/quotes/${quoteId}/withdraw`, { method: "POST" });

export const declineTarget = (targetId: string, reason: string) =>
  api<ServiceRequest>(`/requests/targets/${targetId}/decline`, { method: "POST", body: reason.trim() ? { reason: reason.trim() } : {} });

// ---- Trabajos ----
export const scheduleContract = (id: string, scheduledAt: string) => api<Contract>(`/contracts/${id}/schedule`, { method: "POST", body: { scheduledAt } });
export const startContract = (id: string) => api<Contract>(`/contracts/${id}/start`, { method: "POST" });
export const completeContract = (id: string) => api<Contract>(`/contracts/${id}/complete`, { method: "POST" });

// ---- Agenda ----
export const setAttention = (status: AttentionStatus, until: string | null) =>
  api<ProfessionalMe>("/professionals/me/attention-status", { method: "PUT", body: { status, until } });

export const replaceAvailability = (slots: { weekday: number; start: string; end: string }[]) =>
  api<ProfessionalMe>("/professionals/me/availability", { method: "PUT", body: { slots } });

export const addException = (input: Schemas["AddAvailabilityExceptionDto"]) =>
  api<ProfessionalMe>("/professionals/me/availability/exceptions", { method: "POST", body: input });

export const removeException = (id: string) => api(`/professionals/me/availability/exceptions/${id}`, { method: "DELETE" });

// ---- Certificados ----
export const addCertification = (input: Schemas["AddCertificationDto"]) =>
  api<Schemas["CertificationItemDto"]>("/professionals/me/certifications", { method: "POST", body: input });

export const removeCertification = (id: string) => api(`/professionals/me/certifications/${id}`, { method: "DELETE" });

// ---- Reseñas recibidas ----
export const listReceivedReviews = () => api<OwnReview[]>("/reviews/received");
export const replyReview = (id: string, body: string) => api<OwnReview>(`/reviews/${id}/reply`, { method: "PUT", body: { body } });
export const deleteReply = (id: string) => api(`/reviews/${id}/reply`, { method: "DELETE" });

// ---- Plan y pagos ----
export const listPlans = () => api<PlanOption[]>("/subscriptions/plans");
export const checkout = (planCode: string) => api<Schemas["CheckoutResponseDto"]>("/subscriptions/checkout", { method: "POST", body: { planCode } });
export const listPayments = () => api<Payment[]>("/subscriptions/me/payments");

// ---- Métricas ----
export const getMetrics = (from: string, to: string, groupBy: "day" | "week" | "month") =>
  api<Metrics>("/professionals/me/metrics", { query: { from, to, groupBy } });

export const attentionOptions: { value: AttentionStatus; label: string; detail: string }[] = [
  { value: "AVAILABLE", label: "Disponible", detail: "Tomás trabajos nuevos" },
  { value: "WORKING", label: "Trabajando", detail: "Estás con un trabajo; respondés más tarde" },
  { value: "RESTING", label: "Descansando", detail: "No tomás trabajos por ahora" },
];

export const exceptionTypes: { value: ExceptionType; label: string }[] = [
  { value: "DAY_OFF", label: "Día libre" },
  { value: "HOLIDAY", label: "Feriado" },
  { value: "VACATION", label: "Vacaciones" },
];

export const paymentStatus: Record<Payment["status"], { label: string; tone: "success" | "electric" | "danger" | "neutral" | "amber" }> = {
  CREATED: { label: "Sin pagar", tone: "neutral" },
  PENDING: { label: "Pendiente", tone: "amber" },
  APPROVED: { label: "Aprobado", tone: "success" },
  REJECTED: { label: "Rechazado", tone: "danger" },
  CANCELLED: { label: "Cancelado", tone: "neutral" },
  REFUNDED: { label: "Devuelto", tone: "electric" },
  CHARGED_BACK: { label: "Contracargo", tone: "danger" },
};
