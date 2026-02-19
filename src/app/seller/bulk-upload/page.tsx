import type { Metadata } from "next";
import PageComponent from "@/page-components/seller/BulkUpload";

export const metadata: Metadata = {
  title: "Bulk Upload",
  description: "Bulk upload products.",
};

export default function Page() {
  return <PageComponent />;
}
