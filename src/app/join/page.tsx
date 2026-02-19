import type { Metadata } from "next";
import PageComponent from "@/page-components/MemberSignup";

export const metadata: Metadata = {
  title: "Join Ocean Hotspot",
};

export default function Page() {
  return <PageComponent />;
}
