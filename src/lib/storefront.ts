import { browseCategoryUrl } from "@/lib/navBrowse";

/** Top navigation. Text links only — the All button opens departments. */
export const STORE_NAV = [
  { label: "Products", href: "/browse" },
  { label: "Services", href: "/services" },
  { label: "Training", href: "/training" },
  { label: "Fuel", href: "/fuel" },
  { label: "Regulations", href: "/regulations" },
  { label: "Ports & marinas", href: "/ports" },
] as const;

export type HomeTile = {
  label: string;
  href: string;
  icon: string;
  tone: string;
};

export type HomeCard = {
  title: string;
  href: string;
  linkLabel: string;
  tiles: HomeTile[];
};

export const HOME_CARDS: HomeCard[] = [
  {
    title: "Shop marine products",
    href: "/browse",
    linkLabel: "See all products",
    tiles: [
      { label: "Vessels", href: browseCategoryUrl("vessels"), icon: "ship", tone: "bg-[#d7e6f7]" },
      { label: "Engines", href: browseCategoryUrl("engines"), icon: "cog", tone: "bg-[#fde7d8]" },
      { label: "Electronics", href: browseCategoryUrl("electronics"), icon: "radio", tone: "bg-[#d9f0ea]" },
      { label: "Safety", href: browseCategoryUrl("safety"), icon: "life", tone: "bg-[#f8e3e3]" },
    ],
  },
  {
    title: "Services near you",
    href: "/services",
    linkLabel: "Explore services",
    tiles: [
      { label: "Boat cleaners", href: "/services", icon: "spark", tone: "bg-[#e7f3d8]" },
      { label: "Repairs", href: "/services", icon: "wrench", tone: "bg-[#fde7d8]" },
      { label: "Surveys", href: "/services", icon: "clipboard", tone: "bg-[#d7e6f7]" },
      { label: "Insurance", href: browseCategoryUrl("services"), icon: "shield", tone: "bg-[#efe6f8]" },
    ],
  },
  {
    title: "Zero-emission training",
    href: "/training",
    linkLabel: "See training",
    tiles: [
      { label: "Hydrogen", href: "/training", icon: "flame", tone: "bg-[#d7e6f7]" },
      { label: "Methanol", href: "/training", icon: "flask", tone: "bg-[#e7f3d8]" },
      { label: "Solar", href: "/training", icon: "sun", tone: "bg-[#fff1cc]" },
      { label: "Electric", href: "/training", icon: "zap", tone: "bg-[#fde7d8]" },
    ],
  },
  {
    title: "Green fuel records",
    href: "/fuel",
    linkLabel: "Fuel verification",
    tiles: [
      { label: "HVO fuel", href: "/fuel", icon: "fuel", tone: "bg-[#e7f3d8]" },
      { label: "Receipts", href: "/fuel", icon: "receipt", tone: "bg-[#fff1cc]" },
      { label: "Verified log", href: "/fuel", icon: "badge", tone: "bg-[#d9f0ea]" },
      { label: "Commercial", href: "/fuel", icon: "ship", tone: "bg-[#d7e6f7]" },
    ],
  },
  {
    title: "Regulations",
    href: "/regulations",
    linkLabel: "Open regulations",
    tiles: [
      { label: "Check rules", href: "/regulations", icon: "scale", tone: "bg-[#d7e6f7]" },
      { label: "Compliance", href: "/regulations", icon: "clipboard", tone: "bg-[#efe6f8]" },
      { label: "Buy the kit", href: "/browse", icon: "package", tone: "bg-[#fde7d8]" },
      { label: "Ocean GRC", href: "/regulations", icon: "shield", tone: "bg-[#d9f0ea]" },
    ],
  },
  {
    title: "Ports and marinas",
    href: "/ports",
    linkLabel: "Open the map",
    tiles: [
      { label: "Marinas", href: "/ports", icon: "anchor", tone: "bg-[#d7e6f7]" },
      { label: "Ports", href: "/ports", icon: "map", tone: "bg-[#d9f0ea]" },
      { label: "Berths", href: "/ports", icon: "pin", tone: "bg-[#fff1cc]" },
      { label: "Facilities", href: "/ports", icon: "building", tone: "bg-[#e7f3d8]" },
    ],
  },
  {
    title: "Clubs and charities",
    href: "/services#organisations",
    linkLabel: "See organisations",
    tiles: [
      { label: "Yacht clubs", href: "/services#organisations", icon: "users", tone: "bg-[#d7e6f7]" },
      { label: "Boat clubs", href: "/services#organisations", icon: "anchor", tone: "bg-[#d9f0ea]" },
      { label: "Charities", href: "/services#organisations", icon: "heart", tone: "bg-[#f8e3e3]" },
      { label: "Members", href: "/services#organisations", icon: "users", tone: "bg-[#efe6f8]" },
    ],
  },
  {
    title: "Your account",
    href: "/join",
    linkLabel: "Create an account",
    tiles: [
      { label: "Sign in", href: "/login", icon: "user", tone: "bg-[#d7e6f7]" },
      { label: "Wish list", href: "/wishlist", icon: "heart", tone: "bg-[#f8e3e3]" },
      { label: "Your boat", href: "/account/vessels", icon: "ship", tone: "bg-[#d9f0ea]" },
      { label: "Sell", href: "/sell", icon: "store", tone: "bg-[#fde7d8]" },
    ],
  },
];
