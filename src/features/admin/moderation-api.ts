import { api, type Schemas } from "@/lib/api/client";
import type { ProfessionalMe } from "@/features/pro-profile/api";

/*
 * Panel del admin, parte 7.2: reportes (con la conversación del mensaje reportado), apelaciones,
 * contenido oculto (foro, reseñas, fotos y certificados), identidades y cambios de perfil, y barrios.
 * Docs E-003, E-004, E-006 a E-015, E-020 a E-029, E-034 y E-035. Todo con motivo y auditado.
 */

export type Report = Schemas["AdminReportDto"];
export type ReportStatus = Report["status"];
export type ReportTarget = Report["targetType"];
export type ReportReason = Report["reason"];
export type ReportConversation = Schemas["ReportConversationDto"];
export type Appeal = Schemas["AppealDto"];
export type AppealStatus = Appeal["status"];
export type Verification = Schemas["AdminVerificationResponseDto"];
export type VerificationStatus = Verification["status"];
export type Neighborhood = Schemas["AdminNeighborhoodDto"];
export type NeighborhoodStatus = Neighborhood["status"];

/** Lo que devuelve GET /admin/appeals (AdminAppealDto: el OpenAPI no lo tipa). */
export type AdminAppeal = Appeal & { user: Schemas["UserRefDto"] };

/**
 * `target` del reporte: el contenido como estaba (reports.service.ts targetSnapshot). El OpenAPI lo
 * declara como objeto genérico: se tipa a mano según el código.
 */
export type ReportTargetSnapshot =
  | { userId: string } // PROFILE
  | { body: string; originalBody: string | null; deleted: boolean; createdAt: string } // MESSAGE
  | { body: string; status: ContentStatus; deleted: boolean; postId?: string } // FORUM_POST / FORUM_REPLY
  | { rating: number; comment: string | null; professionalId: string; status: ContentStatus; deleted: boolean }; // REVIEW
export type ContentStatus = "VISIBLE" | "HIDDEN_BY_ADMIN";

/** Límites de los DTO del backend. */
export const NOTE_MIN = 5; // ResolveReportDto, DecideAppealDto, AdminDecisionDto, HideContentDto
export const NOTE_MAX = 500;
export const HIDE_MAX = 300; // HideContentDto, AdminDecisionDto
export const NEIGHBORHOOD_NAME_MAX = 60;
export const PAGE_SIZE = 20;

export const moderationKeys = {
  reports: (filters: object) => ["admin", "reports", filters] as const,
  reportsAll: ["admin", "reports"] as const,
  report: (id: string) => ["admin", "report", id] as const,
  conversation: (id: string) => ["admin", "report", id, "conversation"] as const,
  appeals: (status: string, page: number) => ["admin", "appeals", status, page] as const,
  appealsAll: ["admin", "appeals"] as const,
  verifications: (status: string, page: number) => ["admin", "verifications", status, page] as const,
  verificationsAll: ["admin", "verifications"] as const,
  neighborhoods: (filters: object) => ["admin", "neighborhoods", filters] as const,
  neighborhoodsAll: ["admin", "neighborhoods"] as const,
  proProfile: (userId: string) => ["admin", "pro-profile", userId] as const,
};

// ---- Reportes ----
export const listReports = (query: { status?: ReportStatus; targetType?: ReportTarget; reportedUserId?: string; page: number }) =>
  api<Schemas["AdminReportListDto"]>("/admin/reports", { query: { ...query, limit: PAGE_SIZE } });
export const getReport = (id: string) => api<Report>(`/admin/reports/${id}`);
export const startReview = (id: string) => api<Report>(`/admin/reports/${id}/review`, { method: "POST" });
export const resolveReport = (id: string, valid: boolean, note: string) => api<Report>(`/admin/reports/${id}/resolve`, { method: "POST", body: { valid, note } });
/** Cada apertura queda en la auditoría (C-32). */
export const getReportConversation = (id: string) => api<ReportConversation>(`/admin/reports/${id}/conversation`);

// ---- Contenido ----
type Hideable = "forum/posts" | "forum/replies" | "reviews" | "professionals/media" | "professionals/certifications";
export const hideContent = (kind: Hideable, id: string, reason: string) => api(`/admin/${kind}/${id}/hide`, { method: "POST", body: { reason } });
export const restoreContent = (kind: Hideable, id: string, reason: string) => api(`/admin/${kind}/${id}/restore`, { method: "POST", body: { reason } });
export const getProProfile = (userId: string) => api<ProfessionalMe>(`/admin/professionals/${userId}/profile`);
export const updateProProfile = (userId: string, input: { bio?: string | null; businessName?: string | null; yearsExperience?: number | null; reason: string }) =>
  api<ProfessionalMe>(`/admin/professionals/${userId}/profile`, { method: "PATCH", body: input });

// ---- Apelaciones ----
export const listAppeals = (status: AppealStatus | "", page: number) =>
  api<{ data: AdminAppeal[]; page: number; limit: number; total: number }>("/admin/appeals", { query: { status, page, limit: PAGE_SIZE } });
export const decideAppeal = (id: string, decision: "ACCEPTED" | "REJECTED", note: string) =>
  api<Appeal>(`/admin/appeals/${id}/decide`, { method: "POST", body: { decision, note } });

// ---- Identidades ----
export const listVerifications = (status: VerificationStatus | "", page: number) =>
  api<Schemas["AdminVerificationListDto"]>("/admin/identity-verifications", { query: { status, page, limit: PAGE_SIZE } });
export const decideVerification = (id: string, decision: "APPROVE" | "REJECT" | "REVOKE", reason: string) =>
  api<Verification>(`/admin/identity-verifications/${id}/decision`, { method: "POST", body: { decision, reason } });

// ---- Barrios ----
export const listNeighborhoods = (query: { status: NeighborhoodStatus; search?: string; localityId?: string; page: number }) =>
  api<Schemas["AdminNeighborhoodListDto"]>("/admin/neighborhoods", { query: { ...query, limit: PAGE_SIZE } });
export const approveNeighborhood = (id: string) => api<Neighborhood>(`/admin/neighborhoods/${id}/approve`, { method: "POST", body: {} });
export const renameNeighborhood = (id: string, name: string) => api<Neighborhood>(`/admin/neighborhoods/${id}`, { method: "PATCH", body: { name } });
export const mergeNeighborhood = (id: string, targetId: string) => api<Neighborhood>(`/admin/neighborhoods/${id}/merge`, { method: "POST", body: { targetId } });

// ---- Textos ----
type Tone = "success" | "electric" | "danger" | "neutral" | "amber";

export const reportStatusLabel: Record<ReportStatus, { label: string; tone: Tone }> = {
  SUBMITTED: { label: "Nuevo", tone: "amber" },
  UNDER_REVIEW: { label: "En revisión", tone: "electric" },
  VALID: { label: "Válido", tone: "danger" },
  REJECTED: { label: "Rechazado", tone: "neutral" },
};

export const reportTargetLabel: Record<ReportTarget, string> = {
  PROFILE: "Perfil",
  MESSAGE: "Mensaje del chat",
  FORUM_POST: "Publicación del foro",
  FORUM_REPLY: "Respuesta del foro",
  REVIEW: "Reseña",
};

export const appealStatusLabel: Record<AppealStatus, { label: string; tone: Tone }> = {
  OPEN: { label: "Abierta", tone: "amber" },
  ACCEPTED: { label: "Aceptada", tone: "success" },
  REJECTED: { label: "Rechazada", tone: "neutral" },
};

export const verificationStatusLabel: Record<VerificationStatus, { label: string; tone: Tone }> = {
  NOT_STARTED: { label: "Sin iniciar", tone: "neutral" },
  PENDING: { label: "Con el proveedor", tone: "electric" },
  REQUIRES_REVIEW: { label: "Para revisar", tone: "amber" },
  APPROVED: { label: "Aprobada", tone: "success" },
  REJECTED: { label: "Rechazada", tone: "danger" },
  REVOKED: { label: "Revocada", tone: "danger" },
};

export const neighborhoodStatusLabel: Record<NeighborhoodStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "Pendiente", tone: "amber" },
  APPROVED: { label: "Aprobado", tone: "success" },
  MERGED: { label: "Fusionado", tone: "neutral" },
};

/** Qué tipo de contenido se oculta o restaura desde un reporte (perfil y mensaje no se ocultan). */
export const hideableTarget: Partial<Record<ReportTarget, Hideable>> = {
  FORUM_POST: "forum/posts",
  FORUM_REPLY: "forum/replies",
  REVIEW: "reviews",
};
