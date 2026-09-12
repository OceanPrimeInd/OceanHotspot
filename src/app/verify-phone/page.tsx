import type { Metadata } from "next";
import PageComponent from "@/page-components/VerifyPhone";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Verify Phone",
};

export default function Page() {
  return <PageComponent />;
}
