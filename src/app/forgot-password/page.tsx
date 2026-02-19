import type { Metadata } from "next";
import PageComponent from "@/page-components/ForgotPassword";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Forgot Password",
};

export default function Page() {
  return <PageComponent />;
}
