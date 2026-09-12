import type { Metadata } from "next";
import Showrooms from "@/page-components/Showrooms";

export const metadata: Metadata = {
  title: "Vendor Showrooms | Ocean Hotspot",
  description: "Browse specialist marine suppliers and vendors on Ocean Hotspot.",
};

export default function ShowroomsPage() {
  return <Showrooms />;
}
