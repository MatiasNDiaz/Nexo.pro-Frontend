import { ArrowLeft, CalendarClock, CheckCircle2, Heart, MapPin, MessageSquare, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RemoteImage } from "@/components/catalog/remote-image";
import { ForumAuthor } from "@/components/forum/forum-author";
import { excerpt, formatDeadline, forumTypeLabel } from "@/components/forum/forum-labels";
import { ParticipateCta } from "@/components/forum/participate-cta";
import { Badge, Skeleton } from "@/components/ui/feedback";
import { env } from "@/config/env";
import { getForumPost, type ForumPostDetail, type ForumReply } from "@/features/forum/data";
import { serializeJsonLd } from "@/lib/json-ld";
import { formatMoney, plural } from "@/lib/format";
import { mediaUrl } from "@/lib/media";

export async function generateMetadata({ params }: PageProps<"/foro/[id]">): Promise<Metadata> {
  const { id } = await params;
  const post = await getForumPost(id).catch(() => null);
  if (!post) return { title: "Publicación no disponible", robots: { index: false } };
  return {
    title: `${forumTypeLabel[post.type]}: ${excerpt(post.body, 60)}`,
    description: excerpt(post.body, 155),
    alternates: { canonical: `/foro/${post.id}` },
  };
}

export default function ForumPostPage({ params }: PageProps<"/foro/[id]">) {
  return (
    <Suspense fallback={<PostSkeleton />}>
      <Post params={params} />
    </Suspense>
  );
}

async function Post({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getForumPost(id);
  if (!post) notFound();

  const budget = formatMoney(post.budgetEstimate);
  const place = [post.neighborhood?.name, post.locality?.name].filter(Boolean).join(", ");
  const images = post.media.filter((m) => m.kind === "IMAGE");
  const videos = post.media.filter((m) => m.kind === "VIDEO");

  return (
    <div className="container-page flex max-w-3xl flex-col gap-6 py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLdFor(post)) }} />
      <Link href="/foro" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver al foro
      </Link>

      <article className="flex flex-col gap-5 rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-7 animate-fade-up">
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

        <ForumAuthor author={post.author} date={post.createdAt} />

        {/* El texto es del usuario: se muestra como texto. El h1 resume la publicación para lectores de pantalla. */}
        <h1 className="sr-only">
          {forumTypeLabel[post.type]}: {excerpt(post.body, 80)}
        </h1>
        <p className="text-lg leading-relaxed whitespace-pre-line text-ink">{post.body}</p>
        {post.edited && <p className="text-xs text-muted">Editada</p>}

        {(place || budget || post.deadline) && (
          <ul className="flex flex-wrap gap-x-5 gap-y-2 rounded-2xl bg-canvas p-4 text-sm text-ink">
            {place && (
              <li className="flex items-center gap-1.5">
                <MapPin className="size-4 text-brand-600" aria-hidden="true" />
                {place}
              </li>
            )}
            {budget && (
              <li className="flex items-center gap-1.5">
                <Wallet className="size-4 text-brand-600" aria-hidden="true" />
                Presupuesto estimado: {budget}
              </li>
            )}
            {post.deadline && (
              <li className="flex items-center gap-1.5">
                <CalendarClock className="size-4 text-brand-600" aria-hidden="true" />
                Para el {formatDeadline(post.deadline)}
              </li>
            )}
          </ul>
        )}

        {images.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((media, index) => (
              <li key={media.url} className="relative aspect-square overflow-hidden rounded-2xl bg-brand-50">
                <RemoteImage src={media.url} alt={`Foto ${index + 1} de la publicación`} fill sizes="(min-width: 640px) 240px, 50vw" className="object-cover" />
              </li>
            ))}
          </ul>
        )}
        {videos.map((media) => {
          const url = mediaUrl(media.url);
          return url ? (
            <video key={media.url} src={url} controls preload="none" playsInline className="w-full rounded-2xl bg-brand-950">
              Tu navegador no puede reproducir este video.
            </video>
          ) : null;
        })}

        <div className="flex items-center gap-5 border-t border-line pt-4 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <Heart className="size-4" aria-hidden="true" />
            {plural(post.likeCount, "me gusta", "me gusta")}
          </span>
          <span className="flex items-center gap-1.5">
            <MessageSquare className="size-4" aria-hidden="true" />
            {plural(post.replyCount, "respuesta")}
          </span>
        </div>
      </article>

      <section aria-labelledby="respuestas" className="flex flex-col gap-4">
        <h2 id="respuestas" className="text-xl font-semibold text-brand-900">
          Respuestas
        </h2>
        {!post.resolved && (
          <ParticipateCta returnTo={`/foro/${post.id}`} text="Ingresá para responder o contarle tu propuesta." />
        )}
        {post.replies.length > 0 ? (
          <ReplyTree replies={post.replies} />
        ) : (
          <p className="text-muted">Todavía no tiene respuestas.</p>
        )}
        {post.resolved && <p className="text-sm text-muted">Esta publicación está resuelta y ya no admite respuestas.</p>}
      </section>
    </div>
  );
}

/** Respuestas anidadas por `parentReplyId`, en el orden en que llegan del backend. */
function ReplyTree({ replies }: { replies: ForumReply[] }) {
  const children = new Map<string | null, ForumReply[]>();
  for (const reply of replies) {
    const key = reply.parentReplyId && replies.some((r) => r.id === reply.parentReplyId) ? reply.parentReplyId : null;
    children.set(key, [...(children.get(key) ?? []), reply]);
  }
  const render = (parent: string | null, depth: number) => (
    <ul className={depth > 0 ? "mt-3 flex flex-col gap-3 border-l-2 border-line pl-4 sm:pl-6" : "flex flex-col gap-3"}>
      {(children.get(parent) ?? []).map((reply) => (
        <li key={reply.id}>
          <ReplyItem reply={reply} />
          {/* Más allá de 3 niveles se deja de sangrar para que se lea en el celular. */}
          {children.has(reply.id) && render(reply.id, Math.min(depth + 1, 3))}
        </li>
      ))}
    </ul>
  );
  return render(null, 0);
}

function ReplyItem({ reply }: { reply: ForumReply }) {
  if (reply.removed || !reply.author) {
    return <p className="rounded-2xl border border-dashed border-line px-4 py-3 text-sm text-muted italic">Respuesta eliminada</p>;
  }
  const price = formatMoney(reply.proposedPrice);
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
      <ForumAuthor author={reply.author} date={reply.createdAt} size="sm" />
      <p className="leading-relaxed whitespace-pre-line text-ink">{reply.body}</p>
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
        {price && <Badge tone="amber">Propone: {price}</Badge>}
        {reply.edited && <span>Editada</span>}
        <span className="flex items-center gap-1.5">
          <Heart className="size-4" aria-hidden="true" />
          {reply.likeCount}
          <span className="sr-only"> me gusta</span>
        </span>
      </div>
    </article>
  );
}

/** Datos estructurados de una conversación de foro (schema.org DiscussionForumPosting). */
function jsonLdFor(post: ForumPostDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: excerpt(post.body, 110),
    text: post.body,
    url: `${env.siteUrl}/foro/${post.id}`,
    datePublished: post.createdAt,
    author: { "@type": "Person", name: `${post.author.firstName} ${post.author.lastName}` },
    commentCount: post.replyCount,
    interactionStatistic: { "@type": "InteractionCounter", interactionType: "https://schema.org/LikeAction", userInteractionCount: post.likeCount },
  };
}

function PostSkeleton() {
  return (
    <div className="container-page flex max-w-3xl flex-col gap-6 py-8" aria-busy="true" aria-label="Cargando publicación">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-72 w-full rounded-3xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}
