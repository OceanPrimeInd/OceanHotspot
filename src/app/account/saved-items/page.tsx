import type { Metadata } from "next";
import PageComponent from "@/page-components/account/SavedItems";

export const metadata: Metadata = {
  title: "Saved Items",
  description: "Saved items.",
};

export default function Page() {
  return <PageComponent />;
}
