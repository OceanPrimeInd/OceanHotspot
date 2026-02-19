import type { Metadata } from "next";
import PageComponent from "@/page-components/account/PaymentMethods";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Payment Methods",
  description: "Payment methods.",
};

export default function Page() {
  return <PageComponent />;
}
