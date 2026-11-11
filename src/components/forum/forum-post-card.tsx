import { ArrowUpRight, CalendarClock, CheckCircle2, Hammer, Heart, HelpCircle, Images, MapPin, MessageSquare, Wallet } from "lucide-react";
import Link from "next/link";
import { RemoteImage } from "@/components/catalog/remote-image";
import type { ForumPost } from "@/features/forum/data";
import { cn } from "@/lib/cn";
import { formatMoney, plural } from "@/lib/format";
import { ForumAuthor } from "./forum-author";
import { excerpt, formatDeadline, forumTypeLabel } from "./forum-labels";

/** Cómo se ve cada tipo: el ícono y su color (pregunta en azul eléctrico, "busco profesional" en ámbar). */
export const forumTypeStyle = {
  QUESTION: { icon: HelpCircle, tile: "bg-electric-50 text-electric-700", text: "text-electric-700" },
  PROFESSIONAL_WANTED: { icon: Hammer, tile: "bg-amber-50 text-amber-800", text: "text-amber-800" },
} as const;

/**
 * Publicación en la lista del foro. Toda la tarjeta es un enlace al detalle (el texto es su nombre).
 * El tipo se reconoce por el ícono; en "Busco profesional", el presupuesto y la fecha van destacados.
 * Si tiene fotos, la primera va como miniatura.
 */
export function ForumPostCard({ post }: { post: ForumPost }) {
  const style = forumTypeStyle[post.type];
  const Icon = style.icon;
  const budget = formatMoney(post.budgetEstimate);
  const place = [post.neighborhood?.name, post.locality?.name].filter(Boolean).join(", ");
  const images = post.media.filter((m) => m.kind === "IMAGE");
  const cover = images[0];

  return (
    <article
      className={cn(
        "group relative flex w-full gap-4 rounded-3xl border border-line bg-surface p-5 shadow-card sm:gap-5 sm:p-6",
        "transition-[box-shadow,border-color,translate] duration-300 ease-out-soft hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-raised",
        "has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-electric-500",
      )}
    >
      <span className={cn("hidden size-12 shrink-0 place-items-center rounded-2xl transition-transform duration-300 ease-out-soft group-hover:-rotate-6 sm:grid", style.tile)}>
        <Icon className="size-6" aria-hidden="true" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className={cn("flex items-center gap-1.5 font-semibold", style.text)}>
            <Icon className="size-4 sm:hidden" aria-hidden="true" />
            {forumTypeLabel[post.type]}
          </span>
          {post.resolved && (
            <span className="flex items-center gap-1 font-semibold text-success-800">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Resuelta
            </span>
          )}
        </div>

        <h3 className="font-display text-lg leading-snug font-bold text-ink transition-colors group-hover:text-brand-800 sm:text-xl">
          <Link href={`/foro/${post.id}`} className="outline-none after:absolute after:inset-0 after:content-['']">
            <span className="line-clamp-3 whitespace-pre-line">{excerpt(post.body, 240)}</span>
          </Link>
        </h3>

        {(post.professions.length > 0 || place) && (
          <ul className="flex flex-wrap gap-1.5 text-sm">
            {post.professions.map((profession) => (
              <li key={profession.id} className="rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-800">
                {profession.name}
              </li>
            ))}
            {place && (
              <li className="flex items-center gap-1 rounded-full px-2 py-1 text-muted-strong">
                <MapPin className="size-4" aria-hidden="true" />
                {place}
              </li>
            )}
          </ul>
        )}

        {(budget || post.deadline) && (
          <div className="flex flex-wrap gap-2 text-sm font-semibold">
            {budget && (
              <span className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-amber-800">
                <Wallet className="size-4" aria-hidden="true" />
                Ofrece desde {budget}
              </span>
            )}
            {post.deadline && (
              <span className="flex items-center gap-1.5 rounded-xl bg-canvas px-3 py-1.5 text-ink">
                <CalendarClock className="size-4 text-brand-600" aria-hidden="true" />
                Para el {formatDeadline(post.deadline)}
              </span>
            )}
          </div>
        )}

        <div className="mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <ForumAuthor author={post.author} date={post.createdAt} size="sm" />
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 font-semibold text-brand-800">
              <MessageSquare className="size-4" aria-hidden="true" />
              {plural(post.replyCount, "respuesta")}
            </span>
            <span className="flex items-center gap-1.5 text-muted" title="Me gusta">
              <Heart className="size-4" aria-hidden="true" />
              {post.likeCount}
              <span className="sr-only"> me gusta</span>
            </span>
            <ArrowUpRight
              className="hidden size-5 text-brand-700 opacity-0 transition-[opacity,translate] duration-300 ease-out-soft group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 sm:block"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {cover && (
        <div className="relative hidden size-28 shrink-0 self-start overflow-hidden rounded-2xl bg-brand-50 sm:block lg:size-32">
          <RemoteImage src={cover.url} alt="" fill sizes="128px" className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-105" />
          {images.length > 1 && (
            <span className="absolute right-1.5 bottom-1.5 flex items-center gap-1 rounded-lg bg-brand-950/75 px-2 py-0.5 text-xs font-semibold text-white">
              <Images className="size-3.5" aria-hidden="true" />
              {images.length}
            </span>
          )}
        </div>
      )}
    </article>
  );
}
