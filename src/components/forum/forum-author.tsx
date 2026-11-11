import { BadgeCheck } from "lucide-react";
import { RemoteImage } from "@/components/catalog/remote-image";
import { Avatar } from "@/components/ui/card";
import type { ForumPost } from "@/features/forum/data";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { forumRoleLabel } from "./forum-labels";

/** Foto de perfil (o iniciales) de quien escribe en el foro. */
export function ForumAvatar({ name, avatarUrl, size = "md" }: { name: string; avatarUrl: string | null; size?: "sm" | "md" | "lg" }) {
  const box = size === "sm" ? "size-8" : size === "lg" ? "size-14" : "size-10";
  if (!avatarUrl) return <Avatar name={name} size={size} />;
  return (
    // `block`: un span no toma alto ni ancho fuera de un contenedor flex (la columna de las respuestas).
    <span className={cn("relative block shrink-0 overflow-hidden rounded-full bg-brand-50 ring-2 ring-surface", box)}>
      <RemoteImage src={avatarUrl} alt="" fill sizes="48px" className="object-cover" />
    </span>
  );
}

/** El rol al lado del nombre: los profesionales con su marca (azul), los clientes en texto. */
export function ForumRole({ role }: { role: ForumPost["author"]["role"] }) {
  if (role === "PROFESSIONAL") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-electric-50 px-2 py-0.5 text-xs font-semibold text-electric-700">
        <BadgeCheck className="size-3.5" aria-hidden="true" />
        {forumRoleLabel.PROFESSIONAL}
      </span>
    );
  }
  return <span className="text-sm text-muted">{forumRoleLabel[role]}</span>;
}

/** Autor de una publicación o respuesta: foto, nombre, rol y fecha. */
export function ForumAuthor({ author, date, size = "md" }: { author: ForumPost["author"]; date: string; size?: "sm" | "md" | "lg" }) {
  const name = `${author.firstName} ${author.lastName}`;
  return (
    <div className="flex items-center gap-3">
      <ForumAvatar name={name} avatarUrl={author.avatarUrl} size={size} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className={cn("truncate font-semibold text-ink", size === "lg" ? "text-base" : "text-sm")}>{name}</span>
          <ForumRole role={author.role} />
        </span>
        <time dateTime={date} className="text-xs text-muted">
          {formatDate(date)}
        </time>
      </div>
    </div>
  );
}
