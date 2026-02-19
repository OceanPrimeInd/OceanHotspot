import type { Metadata } from "next";
import PageComponent from "@/page-components/Browse";

export const metadata: Metadata = {
  title: "Browse Products",
};

export default function Page() {
  return <PageComponent />;
}
