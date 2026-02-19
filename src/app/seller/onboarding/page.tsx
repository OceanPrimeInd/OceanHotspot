import type { Metadata } from "next";
import PageComponent from "@/page-components/seller/Onboarding";

export const metadata: Metadata = {
  title: "Seller Onboarding",
  description: "Complete your seller setup.",
};

export default function Page() {
  return <PageComponent />;
}
