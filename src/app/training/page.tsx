import type { Metadata } from "next";
import { DepartmentLanding } from "@/components/landing/DepartmentLanding";

export const metadata: Metadata = {
  title: "Training",
  description: "Zero-emission marine training for hydrogen, methanol, solar, and electric power.",
};

export default function TrainingPage() {
  return (
    <DepartmentLanding
      kicker="Training"
      title="Zero-emission training, booked online."
      intro="Safety courses for hydrogen, methanol, solar, and electric power are being built with marine lecturers. You will be able to book them from Ocean Hotspot."
      points={[
        { title: "Hydrogen", text: "Safety training for hydrogen systems on board." },
        { title: "Methanol", text: "Handling and safety for methanol as a marine fuel." },
        { title: "Solar", text: "Install and operate solar power on small craft." },
        { title: "Electric", text: "Courses that electric-outboard makers can sponsor for their customers." },
      ]}
      primaryHref="/contact"
      primaryLabel="Ask about a course"
      secondaryHref="/browse"
      secondaryLabel="Shop products"
    />
  );
}
