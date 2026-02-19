import type { Metadata } from "next";
import PageComponent from "@/page-components/account/PaymentMethods";

export const metadata: Metadata = {
  title: "Payment Methods",
  description: "Payment methods.",
};

export default function Page() {
  return <PageComponent />;
}
