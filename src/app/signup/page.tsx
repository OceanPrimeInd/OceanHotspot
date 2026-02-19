import type { Metadata } from "next";
import PageComponent from "@/page-components/Signup";

export const metadata: Metadata = {
  title: "Seller Sign Up",
};

export default function Page() {
  return <PageComponent />;
}
