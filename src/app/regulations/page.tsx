import type { Metadata } from "next";
import { DepartmentLanding } from "@/components/landing/DepartmentLanding";

export const metadata: Metadata = {
  title: "Regulations",
  description: "Ocean GRC regulations on Ocean Hotspot, with a path to the products you need.",
};

export default function RegulationsPage() {
  return (
    <DepartmentLanding
      kicker="Regulations"
      title="Check the rule, then buy what it requires."
      intro="Ocean Governance, Risk, and Compliance is moving onto Ocean Hotspot. The aim is simple: look up a regulation here, then go straight to the product or service that satisfies it."
      points={[
        { title: "Ocean GRC", text: "The regulations library is being connected to this address." },
        { title: "From rule to product", text: "When a rule calls for equipment, the catalogue is one click away." },
        { title: "Commercial and leisure", text: "The same hub for operators and boat owners." },
        { title: "Still connecting", text: "Full GRC search is not live on this page yet. Contact us if you need a regulation checked now." },
      ]}
      primaryHref="/browse"
      primaryLabel="Shop the catalogue"
      secondaryHref="/contact"
      secondaryLabel="Ask about a regulation"
    />
  );
}
