import type { Metadata } from "next";
import { DepartmentLanding } from "@/components/landing/DepartmentLanding";

export const metadata: Metadata = {
  title: "Services",
  description: "Hire local marine professionals and find yacht clubs, boat clubs, and marine charities.",
};

export default function ServicesPage() {
  return (
    <DepartmentLanding
      kicker="Services"
      title="Hire local marine professionals."
      intro="Services on Ocean Hotspot are for finding people who work on boats — cleaners, repairs, surveys — and for clubs and charities whose members need products, training, and fuel records in one place."
      points={[
        {
          title: "Local trades",
          text: "Boat cleaners and other marine trades, listed so you can hire someone near the boat.",
        },
        {
          title: "Insurance",
          text: "Boat details saved on your account can be reused when an insurer asks for a quote.",
        },
        {
          title: "Clubs and charities",
          text: "Yacht clubs, boat clubs, and marine charities can sit here as a hub for their members.",
        },
        {
          id: "organisations",
          title: "Organisations",
          text: "Members reach products, training, and green-fuel checks without leaving the site.",
        },
      ]}
      primaryHref="/browse?cat=services"
      primaryLabel="Browse services"
      secondaryHref="/contact"
      secondaryLabel="Talk to us"
    />
  );
}
