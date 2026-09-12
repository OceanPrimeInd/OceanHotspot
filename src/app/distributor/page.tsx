import type { Metadata } from "next";
import PageComponent from "@/page-components/distributor/DistributorLanding";

export const metadata: Metadata = {
  title: "Become a Distributor | OceanHotspot",
  description: "Join the OceanHotspot Virtual Distributor Network. Earn commission representing world-class marine brands in your region — no stock required.",
};

export default function Page() {
  return <PageComponent />;
}
