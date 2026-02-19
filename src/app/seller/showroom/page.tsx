import type { Metadata } from "next";
import PageComponent from "@/page-components/seller/Showroom";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "My Showroom",
  description: "Manage your showroom.",
};

export default function Page() {
  return <PageComponent />;
}
