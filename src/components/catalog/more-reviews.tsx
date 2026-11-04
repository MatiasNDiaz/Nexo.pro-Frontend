"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { REVIEWS_PAGE_SIZE } from "@/features/catalog/filters";
import type { ReviewPage } from "@/features/catalog/types";
import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { ReviewItem } from "./review-item";

/**
 * Reseñas después de la primera página (la primera llega armada desde el servidor, para buscadores).
 * Se piden desde el navegador al tocar "Ver más".
 */
export function MoreReviews({ slug, professionalName, total }: { slug: string; professionalName: string; total: number }) {
  const reviews = useInfiniteQuery({
    queryKey: ["public-reviews", slug],
    queryFn: ({ pageParam, signal }) =>
      api<ReviewPage>(`/catalog/professionals/${encodeURIComponent(slug)}/reviews`, {
        query: { page: pageParam, limit: REVIEWS_PAGE_SIZE },
        signal,
      }),
    initialPageParam: 2,
    getNextPageParam: (last) => (last.page * last.limit < last.count ? last.page + 1 : undefined),
    enabled: false, // Solo cuando la persona pide más.
  });

  const loaded = reviews.data?.pages.flatMap((page) => page.data) ?? [];
  const shown = REVIEWS_PAGE_SIZE + loaded.length;
  const hasMore = reviews.data ? reviews.hasNextPage : total > REVIEWS_PAGE_SIZE;

  return (
    <>
      {loaded.map((review) => (
        <li key={review.id}>
          <ReviewItem review={review} professionalName={professionalName} />
        </li>
      ))}
      {reviews.isError && (
        <li>
          <Alert tone="danger">{errorMessage(reviews.error)}</Alert>
        </li>
      )}
      {hasMore && (
        <li className="flex justify-center pt-2">
          <Button
            variant="secondary"
            loading={reviews.isFetching}
            onClick={() => (reviews.data ? reviews.fetchNextPage() : reviews.refetch())}
          >
            Ver más reseñas ({Math.max(total - shown, 0)})
          </Button>
        </li>
      )}
    </>
  );
}
