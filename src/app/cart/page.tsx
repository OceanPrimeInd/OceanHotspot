import type { Metadata } from "next";
import PageComponent from "@/page-components/Cart";

export const metadata: Metadata = {
  title: "Shopping Cart",
};

export default function Page() {
  return <PageComponent />;
}
