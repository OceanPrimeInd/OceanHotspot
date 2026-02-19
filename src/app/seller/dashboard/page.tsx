import type { Metadata } from "next";
import PageComponent from "@/page-components/seller/Dashboard";

export const metadata: Metadata = {
  title: "Seller Dashboard",
  description: "Manage your seller account.",
};

export default function Page() {
  return <PageComponent />;
}
