import type { Metadata } from "next";
import PageComponent from "@/page-components/distributor/Signup";

export const metadata: Metadata = {
  title: "Distributor Sign Up | OceanHotspot",
  description: "Create your OceanHotspot Distributor account.",
};

export default function Page() {
  return <PageComponent />;
}
