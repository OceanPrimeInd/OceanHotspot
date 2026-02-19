import type { Metadata } from "next";
import PageComponent from "@/page-components/Help";

export const metadata: Metadata = {
  title: "Help Centre",
  description: "Get help with Ocean Hotspot.",
};

export default function Page() {
  return <PageComponent />;
}
