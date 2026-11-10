import { api, type Schemas } from "@/lib/api/client";

/*
 * Foro desde el navegador (participar: E-108 a E-119). La lectura pública se arma en el servidor
 * (features/forum/data.ts); después de cada cambio la publicación se vuelve a pedir desde acá, fresca.
 * Participan clientes activos y profesionales con plan vigente (sin plan, el backend responde
 * SUBSCRIPTION_REQUIRED). "Solicito profesional" admite precio propuesto solo de profesionales.
 */

export type ForumPostDetail = Schemas["ForumPostDetailDto"];
export type ForumReply = Schemas["ForumReplyDto"];
export type ForumType = Schemas["CreateForumPostDto"]["type"];
export type ForumLikes = { post: boolean; replyIds: string[] };

/** Límites de forum.dto.ts. */
export const POST_MIN = 5;
export const POST_MAX = 2000;
export const REPLY_MAX = 1000;
export const MAX_POST_PROFESSIONS = 4;
export const MAX_POST_IMAGES = 2;
export const MAX_POST_VIDEOS = 1;

export const forumKeys = {
  post: (id: string) => ["forum", "post", id] as const,
  likes: (id: string) => ["forum", "likes", id] as const,
};

export const getPost = (id: string) => api<ForumPostDetail>(`/forum/posts/${id}`);
export const getMyLikes = (id: string) => api<ForumLikes>(`/forum/posts/${id}/my-likes`);

export const createPost = (input: Schemas["CreateForumPostDto"]) =>
  api<ForumPostDetail>("/forum/posts", { method: "POST", body: input });

export const updatePost = (id: string, body: string) =>
  api<ForumPostDetail>(`/forum/posts/${id}`, { method: "PATCH", body: { body } });

export const deletePost = (id: string) => api(`/forum/posts/${id}`, { method: "DELETE" });

export const resolvePost = (id: string) => api<ForumPostDetail>(`/forum/posts/${id}/resolve`, { method: "POST" });

export function createReply(postId: string, body: string, parentReplyId?: string, proposedPrice?: number) {
  return api<ForumReply>(`/forum/posts/${postId}/replies`, {
    method: "POST",
    body: { body, ...(parentReplyId ? { parentReplyId } : {}), ...(proposedPrice ? { proposedPrice } : {}) },
  });
}

export const updateReply = (id: string, body: string) => api<ForumReply>(`/forum/replies/${id}`, { method: "PATCH", body: { body } });

export const deleteReply = (id: string) => api(`/forum/replies/${id}`, { method: "DELETE" });

export const setPostLike = (id: string, liked: boolean) => api(`/forum/posts/${id}/like`, { method: liked ? "PUT" : "DELETE" });

export const setReplyLike = (id: string, liked: boolean) => api(`/forum/replies/${id}/like`, { method: liked ? "PUT" : "DELETE" });
