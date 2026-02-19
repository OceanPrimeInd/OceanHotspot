import type { Metadata } from "next";
import PageComponent from "@/page-components/VerifyEmail";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Verify Email",
};

export default function Page() {
  return <PageComponent />;
}
