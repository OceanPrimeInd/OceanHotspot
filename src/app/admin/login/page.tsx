import type { Metadata } from "next";
import PageComponent from "@/page-components/admin/Login";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Admin Sign In",
  description: "Sign in to access the admin panel.",
};

export default function Page() {
  return <PageComponent />;
}
