import type { Metadata } from "next";
import PageComponent from "@/page-components/HowItWorks";

export const metadata: Metadata = {
  title: "How It Works",
  description: "Learn how Ocean Hotspot works.",
};

export default function Page() {
  return <PageComponent />;
}
