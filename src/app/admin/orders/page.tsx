import type { Metadata } from "next";
import PageComponent from "@/page-components/admin/Orders";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Admin: Orders",
  description: "Manage all orders.",
};

export default function Page() {
  return <PageComponent />;
}
