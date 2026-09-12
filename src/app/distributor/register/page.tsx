import type { Metadata } from "next";
import PageComponent from "@/page-components/distributor/Register";

export const metadata: Metadata = {
  title: "Become a Distributor | OceanHotspot",
  description: "Join our Virtual Distributor Network and earn commission representing leading marine brands.",
};

export default function Page() {
  return <PageComponent />;
}
