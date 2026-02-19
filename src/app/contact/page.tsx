import type { Metadata } from "next";
import PageComponent from "@/page-components/Contact";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Ocean Hotspot.",
};

export default function Page() {
  return <PageComponent />;
}
