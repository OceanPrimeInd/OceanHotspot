import type { Metadata } from "next";
import PageComponent from "@/page-components/buyer/Orders";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "My Orders",
  description: "View your orders.",
};

export default function Page() {
  return <PageComponent />;
}
