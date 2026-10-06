import type { Metadata } from "next";
import Link from "next/link";
import { Layout } from "@/components/layout/Layout";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFoundPage() {
  return (
    <Layout>
      <div className="mx-auto flex max-w-lg flex-col items-start px-4 py-16">
        <p className="text-sm font-semibold text-primary">404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          This page is not on Ocean Hotspot
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          The link may be out of date. You can keep looking through the products.
        </p>
        <Link
          href="/browse"
          className="mt-6 inline-flex h-12 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white"
        >
          Browse products
        </Link>
      </div>
    </Layout>
  );
}
