import { api, type Schemas } from "@/lib/api/client";

/*
 * Reseñas del cliente (ADR 0028; docs E-120 a E-125): una por contratación terminada, dentro de los
 * 30 días desde que terminó. Se puede editar en ese plazo y borrar siempre.
 */

export type OwnReview = Schemas["OwnReviewDto"];

/** Límites de CreateReviewDto (reviews.dto.ts). */
export const COMMENT_MAX = 1000;
export const REVIEW_WINDOW_DAYS = 30;

export const reviewKeys = { mine: ["reviews", "mine"] as const };

export const listMyReviews = () => api<OwnReview[]>("/reviews/mine");

/** Comentario vacío: no se manda (al crear) o se borra con `null` (al editar). */
export function createReview(contractId: string, rating: number, comment: string) {
  const text = comment.trim();
  return api<OwnReview>("/reviews", { method: "POST", body: { contractId, rating, ...(text ? { comment: text } : {}) } });
}

export function updateReview(id: string, rating: number, comment: string) {
  const text = comment.trim();
  return api<OwnReview>(`/reviews/${id}`, { method: "PATCH", body: { rating, comment: text || null } });
}

export const deleteReview = (id: string) => api(`/reviews/${id}`, { method: "DELETE" });

/** ¿Todavía se puede dejar una reseña de un trabajo terminado en esta fecha? */
export function canStillReview(completedAt: string | null, now = Date.now()): boolean {
  if (!completedAt) return false;
  return now - new Date(completedAt).getTime() < REVIEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}
