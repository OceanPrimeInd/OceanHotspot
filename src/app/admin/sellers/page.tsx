import type { Metadata } from "next";
import PageComponent from "@/page-components/admin/Sellers";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Admin: Sellers",
  description: "Manage sellers.",
};

export default function Page() {
  return <PageComponent />;
}
