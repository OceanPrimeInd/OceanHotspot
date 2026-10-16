export type GrcPlan = {
  id: "practitioner" | "practice" | "consultancy";
  name: string;
  priceLabel: string;
  amountPence: number;
  period: string;
  tagline: string;
  features: string[];
  highlight?: boolean;
  contact?: boolean;
};

/** Prices from the Ocean GRC compliance product: yearly professional seats. */
export const GRC_PLANS: GrcPlan[] = [
  {
    id: "practitioner",
    name: "Practitioner",
    priceLabel: "£240",
    amountPence: 24000,
    period: "/ year",
    tagline: "Sole practitioner or one-person design consultancy.",
    highlight: true,
    features: [
      "400 questions / month",
      "Cross-code comparison",
      "Copy as design note",
      "Unlimited vessel profiles",
      "Email support",
    ],
  },
  {
    id: "practice",
    name: "Practice",
    priceLabel: "£600",
    amountPence: 60000,
    period: "/ year",
    tagline: "Small design practice, two to three architects.",
    features: [
      "1,500 questions / month",
      "3 seats",
      "Shared vessel profiles",
      "Priority email support",
    ],
  },
  {
    id: "consultancy",
    name: "Consultancy",
    priceLabel: "£1,800",
    amountPence: 180000,
    period: "/ year",
    tagline: "Multi-seat consultancy, Certifying Authority or builder.",
    contact: true,
    features: [
      "6,000 questions / month",
      "10 seats",
      "Export and audit trail",
      "Onboarding session",
    ],
  },
];

export function grcPlanById(id: string) {
  return GRC_PLANS.find((plan) => plan.id === id);
}
