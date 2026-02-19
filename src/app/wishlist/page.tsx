import type { Metadata } from "next";
import PageComponent from "@/page-components/Wishlist";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Wishlist",
};

export default function Page() {
  return <PageComponent />;
}
