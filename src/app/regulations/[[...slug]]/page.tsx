import type { Metadata } from "next";
import { Layout } from "@/components/layout/Layout";
import { OceanGrcApp } from "@/components/grc/OceanGrcApp";
import { RegulationsSubscribe } from "@/components/grc/RegulationsSubscribe";

export const metadata: Metadata = {
  title: "Regulations",
  description: "Subscribe, then ask a question about SPVC 2025 and Workboat Code Edition 3.",
};

export default async function RegulationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ subscribed?: string; cancelled?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const asking = slug?.[0] === "ask";

  return (
    <Layout workspace={asking}>
      {asking ? (
        <OceanGrcApp />
      ) : (
        <RegulationsSubscribe subscribed={query.subscribed === "1"} cancelled={query.cancelled === "1"} />
      )}
    </Layout>
  );
}
