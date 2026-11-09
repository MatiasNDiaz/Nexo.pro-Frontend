"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listNotifications, markAllRead, markRead, notificationKeys, unreadCount, type NotificationPage } from "./api";

/**
 * Sin leer. Con cuenta activa llegan por tiempo real (`notification:new`); igual se repregunta cada
 * minuto por si la conexión se cortó o la cuenta todavía no está activa (sin tiempo real).
 */
export function useUnreadNotifications(enabled: boolean) {
  return useQuery({
    queryKey: notificationKeys.unread,
    queryFn: unreadCount,
    enabled,
    refetchInterval: 60_000,
    select: (data) => data.unread,
  });
}

export function useNotificationsPage(page: number, enabled = true) {
  return useQuery({
    queryKey: notificationKeys.page(page),
    queryFn: () => listNotifications(page),
    enabled,
    placeholderData: keepPreviousData,
  });
}

/** Marca una como leída al instante en la caché y avisa al backend. */
export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markRead,
    onMutate: (id) => {
      queryClient.setQueriesData<NotificationPage>({ queryKey: ["notifications", "page"] }, (page) =>
        page ? { ...page, data: page.data.map((n) => (n.id === id ? { ...n, read: true } : n)) } : page,
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllRead,
    onMutate: () => {
      queryClient.setQueriesData<NotificationPage>({ queryKey: ["notifications", "page"] }, (page) =>
        page ? { ...page, unread: 0, data: page.data.map((n) => ({ ...n, read: true })) } : page,
      );
      queryClient.setQueryData(notificationKeys.unread, { unread: 0 });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}
