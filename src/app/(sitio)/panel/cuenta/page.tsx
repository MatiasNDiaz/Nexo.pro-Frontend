import type { Metadata } from "next";
import { AccountPage } from "@/features/account/account-page";

export const metadata: Metadata = { title: "Mi cuenta" };

export default function Page() {
  return <AccountPage />;
}
