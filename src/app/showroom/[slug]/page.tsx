import type { Metadata } from "next";
import ShowroomPublic from "@/page-components/ShowroomPublic";

export const metadata: Metadata = {
  title: "Seller Showroom",
};

export default function ShowroomPage() {
  return <ShowroomPublic />;
}
