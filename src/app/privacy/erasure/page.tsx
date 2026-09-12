import type { Metadata } from "next";
import ErasureRequest from "@/page-components/privacy/ErasureRequest";

export const metadata: Metadata = {
  title: "Data Erasure Request | Ocean Hotspot",
  description: "Submit a UK GDPR data erasure or access request.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ErasureRequest />;
}
