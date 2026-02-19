import type { Metadata } from "next";
import PageComponent from "@/page-components/seller/Products";

export const metadata: Metadata = {
  title: "My Products",
  description: "Manage your products.",
};

export default function Page() {
  return <PageComponent />;
}
