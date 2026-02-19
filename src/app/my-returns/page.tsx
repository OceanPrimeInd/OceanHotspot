import type { Metadata } from "next";
import PageComponent from "@/page-components/buyer/Returns";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "My Returns",
  description: "Manage your returns.",
};

export default function Page() {
  return <PageComponent />;
}
