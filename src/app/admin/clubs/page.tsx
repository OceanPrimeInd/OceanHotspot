import type { Metadata } from "next";
import PageComponent from "@/page-components/admin/Clubs";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Admin: Clubs",
  description: "Manage clubs.",
};

export default function Page() {
  return <PageComponent />;
}
