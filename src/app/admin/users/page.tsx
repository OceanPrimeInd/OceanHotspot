import type { Metadata } from "next";
import PageComponent from "@/page-components/admin/Users";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Admin: Users",
  description: "Manage users.",
};

export default function Page() {
  return <PageComponent />;
}
