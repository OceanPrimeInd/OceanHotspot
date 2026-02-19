import type { Metadata } from "next";
import PageComponent from "@/page-components/seller/Login";

export const metadata: Metadata = {
  title: "Seller Sign In",
  description: "Sign in to your seller account.",
};

export default function Page() {
  return <PageComponent />;
}
