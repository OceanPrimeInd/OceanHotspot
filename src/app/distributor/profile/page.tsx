import type { Metadata } from "next";
import PageComponent from "@/page-components/distributor/Profile";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Distributor Profile | OceanHotspot",
};

export default function Page() {
  return <PageComponent />;
}
