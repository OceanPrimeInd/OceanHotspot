import type { Metadata } from "next";
import Investors from "@/page-components/Investors";

export const metadata: Metadata = {
  title: "Investors",
  description: "Tell Ocean Hotspot you are interested in investing.",
  robots: { index: false, follow: false },
};

export default function InvestorsPage() {
  return <Investors />;
}
