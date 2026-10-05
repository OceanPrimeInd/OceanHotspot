import type { Metadata } from "next";
import { DepartmentLanding } from "@/components/landing/DepartmentLanding";

export const metadata: Metadata = {
  title: "Ports and marinas",
  description: "A map of ports and marinas on Ocean Hotspot.",
};

export default function PortsPage() {
  return (
    <DepartmentLanding
      kicker="Ports and marinas"
      title="Find a port or marina."
      intro="A port and marina map is part of the new Ocean Hotspot menu. The map itself is not on this page yet. Tell us the coast you care about and we will use that when the map opens."
      points={[
        { title: "Marinas", text: "Berths, clubs, and facilities in one list." },
        { title: "Commercial ports", text: "Ports used by workboats and commercial vessels." },
        { title: "Near your boat", text: "Tied to the location saved on your account." },
        { title: "Coming next", text: "This page will become the map. It is a placeholder until that is connected." },
      ]}
      primaryHref="/contact"
      primaryLabel="Tell us your home port"
      secondaryHref="/"
      secondaryLabel="Back to the shop"
    />
  );
}