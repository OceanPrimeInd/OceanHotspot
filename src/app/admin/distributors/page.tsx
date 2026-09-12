import type { Metadata } from "next";
import PageComponent from "@/page-components/admin/Distributors";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Admin: Distributors",
};

export default function Page() {
  return <PageComponent />;
}
