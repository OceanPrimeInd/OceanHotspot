import type { Metadata } from "next";
import PageComponent from "@/page-components/MemberSignup";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Join Ocean Hotspot",
};

export default function Page() {
  return <PageComponent />;
}
