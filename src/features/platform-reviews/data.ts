import { cacheLife, cacheTag } from "next/cache";
import type { Schemas } from "@/lib/api/client";
import { serverGet } from "@/lib/api/server-api";

export type PlatformReview = Schemas["PlatformReviewDto"];

/** Opiniones publicadas por el equipo (las más recientes), para el inicio. En caché, como el catálogo. */
export async function getPublishedOpinions(limit = 12): Promise<PlatformReview[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("platform-reviews");
  const page = await serverGet<Schemas["PlatformReviewPageDto"]>("/platform-reviews", { page: 1, limit });
  return page?.data ?? [];
}
