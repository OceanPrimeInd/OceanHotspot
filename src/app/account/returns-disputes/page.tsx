import type { Metadata } from "next";
import PageComponent from "@/page-components/account/ReturnsDisputes";

export const metadata: Metadata = {
  title: "Returns & Disputes",
  description: "Returns and disputes.",
};

export default function Page() {
  return <PageComponent />;
}
