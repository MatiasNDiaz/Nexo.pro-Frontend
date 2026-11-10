import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { excerpt, forumTypeLabel } from "@/components/forum/forum-labels";
import { Skeleton } from "@/components/ui/feedback";
import { env } from "@/config/env";
import { getForumPost, type ForumPostDetail } from "@/features/forum/data";
import { ForumThread } from "@/features/forum/forum-thread";
import { serializeJsonLd } from "@/lib/json-ld";

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

  return (
    <div className="container-page flex max-w-3xl flex-col gap-6 py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLdFor(post)) }} />
      <Link href="/foro" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver al foro
      </Link>

      {/* Publicación y respuestas: interactivas en el navegador (me gusta, responder, editar, reportar). */}
      <ForumThread initial={post} />
    </div>
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
