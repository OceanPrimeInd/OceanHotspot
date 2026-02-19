import type { Metadata } from "next";
import PageComponent from "@/page-components/ResetPassword";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Reset Password",
};

export default function Page() {
  return <PageComponent />;
}
