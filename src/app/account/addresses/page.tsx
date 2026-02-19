import type { Metadata } from "next";
import PageComponent from "@/page-components/account/Addresses";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Addresses",
  description: "Your addresses.",
};

export default function Page() {
  return <PageComponent />;
}
