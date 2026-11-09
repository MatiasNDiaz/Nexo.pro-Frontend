"use client";

import {
  Bell,
  Briefcase,
  FileText,
  Heart,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  ShieldAlert,
  Star,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { formatListDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import { notificationHref, type AppNotification } from "./api";

const iconByType: Record<string, LucideIcon> = {
  NEW_MESSAGE: MessagesSquare,
  NEW_REQUEST: FileText,
  QUOTE: FileText,
  CONTRACT_UPDATED: Briefcase,
  REVIEW_RECEIVED: Star,
  REVIEW_REPLIED: Star,
  FORUM_REPLY: MessageCircle,
  PROFESSIONAL_AVAILABLE: Heart,
  MODERATION_ACTION: ShieldAlert,
  REPORT_UPHELD: ShieldAlert,
  ANNOUNCEMENT: Megaphone,
};

/**
 * Una notificación: ícono según el tipo, título, texto y cuándo. Si lleva a algún lado es un enlace;
 * al tocarla se marca como leída. Las no leídas tienen fondo y un punto ámbar.
 */
export function NotificationItem({
  notification,
  onOpen,
  compact = false,
}: {
  notification: AppNotification;
  onOpen: (notification: AppNotification) => void;
  compact?: boolean;
}) {
  const Icon = iconByType[notification.type] ?? Bell;
  const href = notificationHref(notification);
  const content = (
    <>
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl",
          notification.read ? "bg-canvas text-muted-strong" : "bg-brand-700 text-white",
        )}
      >
        <Icon className="size-[1.1rem]" aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-start justify-between gap-3">
          <span className={cn("text-[0.95rem] leading-snug", notification.read ? "font-medium text-ink" : "font-bold text-brand-900")}>
            {notification.title}
          </span>
          <time dateTime={notification.createdAt} className="shrink-0 pt-0.5 text-xs text-muted">
            {formatListDate(notification.createdAt)}
          </time>
        </span>
        <span className={cn("text-sm leading-relaxed text-muted-strong", compact && "line-clamp-2")}>{notification.body}</span>
      </span>
      {!notification.read && (
        <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-amber-400">
          <span className="sr-only">Sin leer</span>
        </span>
      )}
    </>
  );
  const className = cn(
    "flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors",
    notification.read ? "hover:bg-canvas" : "bg-brand-50/70 hover:bg-brand-50",
  );

  if (href) {
    return (
      <Link href={href} className={className} onClick={() => onOpen(notification)}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={className} onClick={() => onOpen(notification)}>
      {content}
    </button>
  );
}
