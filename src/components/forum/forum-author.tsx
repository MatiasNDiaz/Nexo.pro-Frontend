import { RemoteImage } from "@/components/catalog/remote-image";
import { Avatar } from "@/components/ui/card";
import type { ForumPost } from "@/features/forum/data";
import { formatDate } from "@/lib/format";
import { forumRoleLabel } from "./forum-labels";

/** Autor de una publicación o respuesta: foto, nombre, rol y fecha. */
export function ForumAuthor({ author, date, size = "md" }: { author: ForumPost["author"]; date: string; size?: "sm" | "md" }) {
  const name = `${author.firstName} ${author.lastName}`;
  const box = size === "sm" ? "size-8" : "size-10";
  return (
    <div className="flex items-center gap-3">
      {author.avatarUrl ? (
        <span className={`relative ${box} shrink-0 overflow-hidden rounded-full bg-brand-50`}>
          <RemoteImage src={author.avatarUrl} alt="" fill sizes="40px" className="object-cover" />
        </span>
      ) : (
        <Avatar name={name} size={size === "sm" ? "sm" : "md"} />
      )}
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-semibold text-ink">
          {name} <span className="font-normal text-muted">· {forumRoleLabel[author.role]}</span>
        </span>
        <time dateTime={date} className="text-xs text-muted">
          {formatDate(date)}
        </time>
      </div>
    </div>
  );
}
