import type { Metadata } from "next";
import PageComponent from "@/page-components/Terms";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Ocean Hotspot terms of service.",
};

export default function Page() {
  return <PageComponent />;
}
