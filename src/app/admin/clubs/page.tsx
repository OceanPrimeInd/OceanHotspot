import type { Metadata } from "next";
import PageComponent from "@/page-components/admin/Clubs";

export const metadata: Metadata = {
  title: "Admin: Clubs",
  description: "Manage clubs.",
};

export default function Page() {
  return <PageComponent />;
}
