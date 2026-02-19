import type { Metadata } from "next";
import PageComponent from "@/page-components/About";

export const metadata: Metadata = {
  title: "About Ocean Hotspot",
  description: "Learn about Ocean Hotspot and our mission.",
};

export default function Page() {
  return <PageComponent />;
}
