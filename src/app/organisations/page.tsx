import type { Metadata } from "next";
import { DepartmentLanding } from "@/components/landing/DepartmentLanding";

export const metadata: Metadata = {
  title: "Organisations",
  description: "Find clubs, charities, events, and racing on Ocean Hotspot.",
};

export default function OrganisationsPage() {
  return (
    <DepartmentLanding
      kicker="Organisations"
      comingSoon
      title="Find clubs and organisations."
      intro="Clubs, charities, meetups, and racing will be listed here so members can find them in one place. This section is still being built."
      points={[
        { id: "clubs", title: "Clubs", text: "Find local yacht clubs and boat clubs." },
        { id: "charities", title: "Charities", text: "Support a marine charity." },
        { id: "trade", title: "Trade organisations", text: "Marine trade organisations will be listed here." },
        { id: "events", title: "Events", text: "Meetups and shows." },
        { id: "racing", title: "Racing", text: "Find a competition." },
      ]}
      primaryHref="/contact"
      primaryLabel="Ask about a listing"
      secondaryHref="/browse"
      secondaryLabel="Shop products"
    />
  );
}
