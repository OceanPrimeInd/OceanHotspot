import type { Metadata } from "next";
import PageComponent from "@/page-components/Privacy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Ocean Hotspot privacy policy.",
};

export default function Page() {
  return <PageComponent />;
}
