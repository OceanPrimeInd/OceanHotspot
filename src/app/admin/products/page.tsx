import type { Metadata } from "next";
import PageComponent from "@/page-components/admin/Products";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Admin: Products",
  description: "Manage all products.",
};

export default function Page() {
  return <PageComponent />;
}
