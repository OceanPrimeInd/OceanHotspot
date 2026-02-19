import type { Metadata } from "next";
import PageComponent from "@/page-components/Discover";

export const metadata: Metadata = {
  title: "Discover",
};

export default function Page() {
  return <PageComponent />;
}
