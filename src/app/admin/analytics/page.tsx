import type { Metadata } from "next";
import PageComponent from "@/page-components/admin/Analytics";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Admin: Google Analytics",
  description: "View Google Analytics data.",
};

export default function Page() {
  return <PageComponent />;
}
