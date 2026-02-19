import type { Metadata } from "next";
import PageComponent from "@/page-components/seller/Enquiries";

export const metadata: Metadata = {
  title: "Enquiries",
  description: "Manage enquiries.",
};

export default function Page() {
  return <PageComponent />;
}
