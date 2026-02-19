import type { Metadata } from "next";
import PageComponent from "@/page-components/seller/Messages";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Messages",
  description: "Your messages.",
};

export default function Page() {
  return <PageComponent />;
}
