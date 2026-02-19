import type { Metadata } from "next";
import PageComponent from "@/page-components/buyer/Disputes";

export const metadata: Metadata = {
  title: "My Disputes",
  description: "Manage your disputes.",
};

export default function Page() {
  return <PageComponent />;
}
