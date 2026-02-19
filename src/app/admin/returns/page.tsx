import type { Metadata } from "next";
import PageComponent from "@/page-components/admin/Returns";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Admin: Returns",
  description: "Manage returns.",
};

export default function Page() {
  return <PageComponent />;
}
