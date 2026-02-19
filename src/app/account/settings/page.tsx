import type { Metadata } from "next";
import PageComponent from "@/page-components/account/AccountSettings";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Account Settings",
  description: "Account settings.",
};

export default function Page() {
  return <PageComponent />;
}
