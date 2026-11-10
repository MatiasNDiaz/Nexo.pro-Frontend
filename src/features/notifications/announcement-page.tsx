"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Megaphone } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { EmptyState, Skeleton } from "@/components/ui/feedback";
import { api, type Schemas } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { formatDate } from "@/lib/format";

/** Una novedad de Repara Ya (E-006): solo la ve quien la recibió como notificación. */
export function AnnouncementPage() {
  const { id } = useParams<{ id: string }>();
  const announcement = useQuery({ queryKey: ["announcements", id], queryFn: () => api<Schemas["AnnouncementDto"]>(`/announcements/${id}`) });

  return (
    <div className="flex flex-col gap-6">
      <Link href="/panel/notificaciones" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Notificaciones
      </Link>
      {announcement.isPending ? (
        <Skeleton className="h-72 w-full rounded-3xl" />
      ) : announcement.isError ? (
        <EmptyState headingLevel={1} icon={Megaphone} title="No encontramos esa novedad" description={errorMessage(announcement.error)} />
      ) : (
        <article className="relative isolate flex flex-col gap-5 overflow-hidden rounded-3xl bg-brand-950 p-6 text-white shadow-raised animate-fade-up sm:p-10">
          <span aria-hidden="true" className="absolute -top-24 -right-16 -z-1 size-80 rounded-full bg-[radial-gradient(closest-side,rgb(244_163_64/0.3),transparent)]" />
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-amber-400 px-3 py-1 text-sm font-semibold text-brand-900">
            <Megaphone className="size-4" aria-hidden="true" />
            Novedad
          </span>
          <h1 className="text-3xl leading-tight font-bold sm:text-4xl">{announcement.data.title}</h1>
          {announcement.data.publishedAt && <p className="text-sm text-brand-200">{formatDate(announcement.data.publishedAt)}</p>}
          <p className="text-lg leading-relaxed whitespace-pre-line text-brand-100">{announcement.data.body}</p>
        </article>
      )}
    </div>
  );
}
