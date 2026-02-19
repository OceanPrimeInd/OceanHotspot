import type { Metadata } from "next";
import PageComponent from "@/page-components/Cookies";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Ocean Hotspot cookie policy.",
};

export default function Page() {
  return <PageComponent />;
}
