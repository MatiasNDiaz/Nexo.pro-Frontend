"use client";

import { useMe } from "@/features/account/use-me";
import { ReceivedReviewsPage } from "@/features/pro-work/received-reviews";
import { ReviewsPage } from "./reviews-page";

/** /panel/resenas: el cliente ve las que escribió; el profesional, las que recibió. */
export function ReviewsByRole() {
  return useMe().role === "PROFESSIONAL" ? <ReceivedReviewsPage /> : <ReviewsPage />;
}
