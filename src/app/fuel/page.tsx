import type { Metadata } from "next";
import { DepartmentLanding } from "@/components/landing/DepartmentLanding";

export const metadata: Metadata = {
  title: "Green fuel",
  description: "Verified fuel records for commercial vessels buying low-carbon drop-in fuels.",
};

export default function FuelPage() {
  return (
    <DepartmentLanding
      kicker="Fuel"
      title="Verified green-fuel records for commercial vessels."
      intro="Operators buying low-carbon drop-in fuels, such as hydrogenated vegetable oil, need a record that is checked — not a self-declaration. This section is where purchase receipts will be submitted and turned into an official log."
      points={[
        { title: "Submit a receipt", text: "Upload the fuel purchase so it can be checked." },
        { title: "Checked record", text: "A verified entry the vessel can show, instead of a self-declaration." },
        { title: "Drop-in fuels", text: "Built for commercial vessels using low-carbon replacement fuels." },
        { title: "One account", text: "The same boat profile used for products, training, and insurance." },
      ]}
      primaryHref="/contact"
      primaryLabel="Talk to us about fuel records"
      secondaryHref="/join"
      secondaryLabel="Create an account"
    />
  );
}
