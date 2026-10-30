export type GrcPlan = {
  id: "standard" | "professional" | "sme" | "enterprise";
  name: string;
  priceLabel: string;
  period: string;
  amountPence: number;
  tagline: string;
  features: string[];
  buttonLabel: string;
  contact?: boolean;
};

/** Plans and ex VAT prices from the Regulations cost-model Website Prices tab. */
export const GRC_PLANS: GrcPlan[] = [
  {
    id: "standard",
    name: "Standard",
    priceLabel: "£19.75",
    period: "/ month",
    amountPence: 23700,
    tagline: "Ex VAT. 1 user.",
    buttonLabel: "Subscribe · £237/year",
    features: [
      "1 user",
      "£237 / year ex VAT",
      "£23.70 / month inc VAT",
      "Base",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    priceLabel: "£49.50",
    period: "/ month",
    amountPence: 59400,
    tagline: "Ex VAT. 1 user.",
    buttonLabel: "Subscribe · £594/year",
    features: [
      "1 user",
      "£594 / year ex VAT",
      "£59.40 / month inc VAT",
      "High",
    ],
  },
  {
    id: "sme",
    name: "SME",
    priceLabel: "£15.50",
    period: "/ user / month",
    amountPence: 111600,
    tagline: "Ex VAT. 6 users.",
    buttonLabel: "Subscribe · £1,116/year",
    features: [
      "6 users",
      "£186 / user / year ex VAT",
      "£1,116 / year for the contract, ex VAT",
      "£18.60 / user / month inc VAT",
      "High",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceLabel: "POA",
    period: "",
    amountPence: 0,
    tagline: "Price on application.",
    buttonLabel: "Talk to us",
    contact: true,
    features: ["Price on application"],
  },
];

export function grcPlanById(id: string) {
  return GRC_PLANS.find((plan) => plan.id === id);
}
