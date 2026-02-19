import type { Metadata } from "next";
import PageComponent from "@/page-components/admin/Dashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Ocean Hotspot admin dashboard.",
};

export default function Page() {
  return <PageComponent />;
}
