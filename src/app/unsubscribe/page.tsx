import type { Metadata } from "next";
import PageComponent from "@/page-components/Unsubscribe";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Unsubscribe",
  description: "Unsubscribe from emails.",
};

export default function Page() {
  return <PageComponent />;
}
