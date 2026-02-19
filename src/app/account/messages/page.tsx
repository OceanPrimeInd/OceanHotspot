import type { Metadata } from "next";
import PageComponent from "@/page-components/account/Messages";

export const metadata: Metadata = {
  title: "Messages",
  description: "Your messages.",
};

export default function Page() {
  return <PageComponent />;
}
