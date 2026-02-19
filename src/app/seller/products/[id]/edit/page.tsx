import type { Metadata } from "next";
import PageComponent from "@/page-components/seller/EditProduct";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Edit Product",
  description: "Edit your product.",
};

export default function Page() {
  return <PageComponent />;
}
