/** Top navigation. Text links only — the All button opens departments. */
export const STORE_NAV = [
  { label: "Shop Marketplace", href: "/browse" },
  { label: "Regulations Check", href: "/regulations" },
  { label: "Find Services", href: "/services" },
  { label: "Get Training", href: "/training" },
  { label: "Fuel and Electricity", href: "/fuel" },
  { label: "Find Ports and Marinas", href: "/ports" },
  { label: "Find Clubs and Organisations", href: "/organisations" },
] as const;

/** One message per box. Change the text here when Dave’s copy arrives. */
export type HomeBox = {
  title: string;
  message: string;
  href: string;
  icon: string;
  tone: string;
  size: "large" | "small";
  comingSoon?: boolean;
};

export const HOME_BOXES: HomeBox[] = [
  {
    title: "Products and services for sale",
    message: "Parts, equipment and services for your boat.",
    href: "/browse",
    icon: "package",
    tone: "bg-[#d7e6f7]",
    size: "large",
  },
  {
    title: "Training",
    message: "Zero-emission courses, booked in one place.",
    href: "/training",
    icon: "flame",
    tone: "bg-[#fff1cc]",
    size: "small",
    comingSoon: true,
  },
  {
    title: "Fuel",
    message: "A record of the green fuel you buy.",
    href: "/fuel",
    icon: "fuel",
    tone: "bg-[#e7f3d8]",
    size: "small",
  },
  {
    title: "Regulations",
    message: "The rules for your boat, in one place.",
    href: "/regulations",
    icon: "scale",
    tone: "bg-[#efe6f8]",
    size: "small",
  },
  {
    title: "Map",
    message: "Ports and marinas near you.",
    href: "/ports",
    icon: "map",
    tone: "bg-[#d9f0ea]",
    size: "small",
  },
];
