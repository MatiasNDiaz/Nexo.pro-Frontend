import type { Metadata } from "next";
import { Suspense } from "react";
import { AnnouncementPage } from "@/features/notifications/announcement-page";

export const metadata: Metadata = { title: "Novedad" };

export default function Page() {
  return (
    <Suspense>
      <AnnouncementPage />
    </Suspense>
  );
}
