import type { Metadata } from "next";
import PageComponent from "@/page-components/distributor/Login";

export const metadata: Metadata = {
  title: "Distributor Login | OceanHotspot",
  description: "Sign in to your OceanHotspot Distributor account.",
};

export default function Page() {
  return <PageComponent />;
}
