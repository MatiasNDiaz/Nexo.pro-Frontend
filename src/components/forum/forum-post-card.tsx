import { CalendarClock, CheckCircle2, Heart, MapPin, MessageSquare, Wallet } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/feedback";
import type { ForumPost } from "@/features/forum/data";
import { formatMoney } from "@/lib/format";
import { excerpt, formatDeadline, forumTypeLabel } from "./forum-labels";
import { ForumAuthor } from "./forum-author";

/** Publicación en la lista del foro. Toda la tarjeta es un enlace al detalle (el texto es su nombre). */
export function ForumPostCard({ post }: { post: ForumPost }) {
  const budget = formatMoney(post.budgetEstimate);
  const place = [post.neighborhood?.name, post.locality?.name].filter(Boolean).join(", ");

  return (
    <article className="relative flex w-full flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card transition-[box-shadow,border-color,transform] duration-300 ease-out-soft hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-raised has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-electric-500">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={post.type === "PROFESSIONAL_WANTED" ? "amber" : "neutral"}>{forumTypeLabel[post.type]}</Badge>
        {post.resolved && (
          <Badge tone="success">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            Resuelta
          </Badge>
        )}
        {post.professions.map((profession) => (
          <Badge key={profession.id} tone="electric">
            {profession.name}
          </Badge>
        ))}
      </div>

      <h3 className="text-base leading-relaxed font-medium text-ink">
        <Link href={`/foro/${post.id}`} className="outline-none after:absolute after:inset-0 after:content-['']">
          <span className="line-clamp-3 whitespace-pre-line">{excerpt(post.body, 280)}</span>
        </Link>
      </h3>

      {(place || budget || post.deadline) && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          {place && (
            <li className="flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden="true" />
              {place}
            </li>
          )}
          {budget && (
            <li className="flex items-center gap-1.5">
              <Wallet className="size-4" aria-hidden="true" />
              Presupuesto estimado: {budget}
            </li>
          )}
          {post.deadline && (
            <li className="flex items-center gap-1.5">
              <CalendarClock className="size-4" aria-hidden="true" />
              Para el {formatDeadline(post.deadline)}
            </li>
          )}
        </ul>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <ForumAuthor author={post.author} date={post.createdAt} size="sm" />
        <div className="flex items-center gap-4 text-sm text-muted">
          <span className="flex items-center gap-1.5" title="Me gusta">
            <Heart className="size-4" aria-hidden="true" />
            {post.likeCount}
            <span className="sr-only"> me gusta</span>
          </span>
          <span className="flex items-center gap-1.5" title="Respuestas">
            <MessageSquare className="size-4" aria-hidden="true" />
            {post.replyCount}
            <span className="sr-only"> respuestas</span>
          </span>
        </div>
      </div>
    </article>
  );
}
