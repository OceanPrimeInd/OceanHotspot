import type { Metadata } from "next";
import PageComponent from "@/page-components/admin/Disputes";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Admin: Disputes",
  description: "Manage disputes.",
};

export default function Page() {
  return <PageComponent />;
}
