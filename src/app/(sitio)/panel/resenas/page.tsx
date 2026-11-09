import type { Metadata } from "next";
import { ReviewsPage } from "@/features/reviews/reviews-page";

export const metadata: Metadata = { title: "Mis reseñas" };

export default function Page() {
  return <ReviewsPage />;
}
