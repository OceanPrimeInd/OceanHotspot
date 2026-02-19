import type { Metadata } from "next";
import PageComponent from "@/page-components/Login";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function Page() {
  return <PageComponent />;
}
