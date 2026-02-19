import type { Metadata } from "next";
import PageComponent from "@/page-components/seller/CreateProduct";

export const metadata: Metadata = {
  title: "Add Product",
  description: "Add a new product.",
};

export default function Page() {
  return <PageComponent />;
}
