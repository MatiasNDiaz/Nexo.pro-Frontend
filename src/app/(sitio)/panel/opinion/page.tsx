import type { Metadata } from "next";
import { OpinionPage } from "@/features/platform-reviews/opinion-page";

export const metadata: Metadata = { title: "Tu opinión" };

export default function Page() {
  return <OpinionPage />;
}
