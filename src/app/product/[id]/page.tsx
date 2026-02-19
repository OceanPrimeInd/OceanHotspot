import type { Metadata } from "next";
import ProductDetail from "@/page-components/ProductDetail";

export const metadata: Metadata = {
  title: "Product Details",
};

export default function ProductPage() {
  return <ProductDetail />;
}
