import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SellerCTA() {
  return (
    <section className="bg-off-white rounded-xl p-6 border border-light-grey">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div>
          <h3 className="font-heading font-bold text-near-black mb-1">Are you a seller?</h3>
          <p className="text-dark-grey text-[0.9375rem]">
            List your products to a global market. No listing fees.
          </p>
        </div>
        <Button variant="o42Primary" asChild className="whitespace-nowrap">
          <Link href="/sell">Learn More</Link>
        </Button>
      </div>
    </section>
  );
}
