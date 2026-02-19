import type { Metadata } from "next";
import PageComponent from "@/page-components/Signup";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Seller Sign Up",
};

export default function Page() {
  return <PageComponent />;
}
