import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

export function AccountComingSoon({ title }: { title: string }) {
  return (
    <Layout>
      <div className="container max-w-lg py-16 text-center">
        <h1 className="text-2xl font-bold text-headline mb-3">{title}</h1>
        <p className="text-muted-foreground mb-8">Coming soon. We will turn this on after the shop opens.</p>
        <Button variant="o42Primary" asChild>
          <Link href="/account/settings">Back to account settings</Link>
        </Button>
      </div>
    </Layout>
  );
}
