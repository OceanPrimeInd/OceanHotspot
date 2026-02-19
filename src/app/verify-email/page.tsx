import type { Metadata } from "next";
import PageComponent from "@/page-components/VerifyEmail";

export const metadata: Metadata = {
  title: "Verify Email",
};

export default function Page() {
  return <PageComponent />;
}
