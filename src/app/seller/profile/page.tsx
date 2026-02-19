import type { Metadata } from "next";
import PageComponent from "@/page-components/seller/Profile";

export const metadata: Metadata = {
  title: "Seller Profile",
  description: "Manage your seller profile.",
};

export default function Page() {
  return <PageComponent />;
}
