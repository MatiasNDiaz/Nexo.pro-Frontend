import type { ForumPage } from "@/features/forum/data";
import { api, type Schemas } from "@/lib/api/client";

/*
 * "Clientes" (ADR 0037 del backend, pedido del fundador del 11/11/2026): cualquier profesional con
 * sesión ve a todos los clientes activos y, en la ficha de cada uno, lo que preguntó y pidió en el foro.
 * Solo lo que el foro ya muestra: nada de teléfono, email ni barrio de la cuenta.
 */

export type CustomerCard = Schemas["CustomerCardDto"];
export type CustomerPage = Schemas["CustomerDirectoryPageDto"];
export type PostType = "QUESTION" | "PROFESSIONAL_WANTED";

export const CUSTOMERS_PAGE_SIZE = 24;
export const CUSTOMER_POSTS_PAGE_SIZE = 10;
export const SEARCH_MIN = 2;
export const SEARCH_MAX = 60;

/** Filtros del catálogo (viven en la URL, ver customers-page.tsx). */
export interface CustomerQuery {
  q?: string;
  professionId?: string;
  localityId?: string;
  withOpenRequests?: boolean;
  page?: number;
}

export const customerKeys = {
  list: (query: CustomerQuery) => ["customers", "list", query] as const,
  card: (id: string) => ["customers", "card", id] as const,
  posts: (id: string, type: PostType | null, page: number) => ["customers", "posts", id, type, page] as const,
};

export const listCustomers = (query: CustomerQuery) => api<CustomerPage>("/customers", { query: { ...query, limit: CUSTOMERS_PAGE_SIZE } });

export const getCustomer = (id: string) => api<CustomerCard>(`/customers/${id}`);

/** Sus publicaciones visibles, de la lectura pública del foro (la más nueva primero). */
export const listCustomerPosts = (id: string, type: PostType | null, page: number) =>
  api<ForumPage>("/forum/posts", { query: { authorId: id, type, page, limit: CUSTOMER_POSTS_PAGE_SIZE } });
