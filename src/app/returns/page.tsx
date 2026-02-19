import type { Metadata } from "next";
import PageComponent from "@/page-components/Returns";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description: "Ocean Hotspot returns policy.",
};

export default function Page() {
  return <PageComponent />;
}
