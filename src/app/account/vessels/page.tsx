import type { Metadata } from "next";
import PageComponent from "@/page-components/account/MyVessels";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "My Vessels",
  description: "Manage vessels.",
};

export default function Page() {
  return <PageComponent />;
}
