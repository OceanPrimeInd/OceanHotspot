import type { ElementType } from "react";
import {
  Anchor,
  Banknote,
  Battery,
  Binoculars,
  Cable,
  Camera,
  Compass,
  Cog,
  Droplets,
  Fan,
  Fish,
  Flame,
  Fuel,
  Gauge,
  Hammer,
  LayoutGrid,
  LifeBuoy,
  Lightbulb,
  Map,
  Package,
  Radio,
  Sailboat,
  Scale,
  Settings,
  Shield,
  Ship,
  Sofa,
  Sun,
  Truck,
  Waves,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";

export const ALL_MENU_ICON = LayoutGrid;

export const NAV_ICONS: Record<string, ElementType> = {
  Vessels: Ship,
  Engines: Cog,
  Electronics: Compass,
  Electrical: Zap,
  Deck: Anchor,
  Pumps: Droplets,
  Maintenance: Wrench,
  Safety: LifeBuoy,
  Leisure: Waves,
  "Finance & insurance": Banknote,
};

export const CATEGORY_ICONS: Record<string, ElementType> = {
  "Anchoring & Mooring": Anchor,
  "Boats & Vessels": Ship,
  "Cabin, Galley & Comfort": Sofa,
  "Covers & Accessories": Package,
  "Deck Hardware": Hammer,
  "Electrical & Power": Zap,
  "Electronics & Navigation": Compass,
  "Engines, Propulsion & Steering": Cog,
  "Finance, Insurance & Legal": Banknote,
  "Fishing & Harvesting": Fish,
  "Maintenance & Consumables": Wrench,
  "Plumbing, Pumps & Ventilation": Droplets,
  "Safety, Security & Response": Shield,
  "Sailing: Rigging & Sails": Sailboat,
  "Trailers & Towing": Truck,
  Watersports: Waves,
};

export const SUBGROUP_ICONS: Record<string, ElementType> = {
  All: LayoutGrid,
  Anchoring: Anchor,
  "Mooring & Docking": Anchor,
  "Leisure Boats": Sailboat,
  "Commercial Vessels": Ship,
  "Small Craft & Tenders": Package,
  "Floating Assets": Map,
  Galley: Settings,
  Climate: Fan,
  Furniture: Sofa,
  "Covers & Shade": Package,
  Accessories: Package,
  Fittings: Hammer,
  "Rails & Stanchions": Anchor,
  "Hatches & Portlights": Package,
  "Batteries & Charging": Battery,
  "Power Generation": Sun,
  "Shore Power": Cable,
  Distribution: Gauge,
  Lighting: Lightbulb,
  Navigation: Map,
  "Fishfinders & Sonar": Binoculars,
  Communications: Radio,
  Instruments: Gauge,
  "Marine Cameras": Camera,
  Engines: Cog,
  "Propellers & Drivetrain": Settings,
  "Fuel, Cooling & Exhaust": Fuel,
  "Controls & Instruments": Gauge,
  "Engine Parts & Service": Wrench,
  "Steering & Manoeuvring": Compass,
  Services: Banknote,
  "Leisure Fishing": Fish,
  "Commercial Fishing": Fish,
  "Aquaculture & Harvesting": Waves,
  "Cleaning & Care": Droplets,
  "Paint & Antifouling": Hammer,
  Repair: Wrench,
  "Corrosion Protection": Shield,
  "General Lubricants": Droplets,
  "Fresh Water": Droplets,
  Sanitation: Settings,
  "Bilge & Washdown": Droplets,
  "Hoses & Fittings": Cable,
  Ventilation: Wind,
  "Personal Safety": LifeBuoy,
  "Emergency & Survival": Shield,
  "Fire Safety": Flame,
  Security: Shield,
  Response: LifeBuoy,
  "Standing Rigging": Scale,
  "Running Rigging": Scale,
  Spars: Sailboat,
  "Furler Systems": Settings,
  Sails: Wind,
  "Sail Handling": Sailboat,
};

export function getNavIcon(name: string): ElementType {
  return NAV_ICONS[name] ?? Package;
}

export function getAllMenuIcon(): ElementType {
  return ALL_MENU_ICON;
}

export function getCategoryIcon(name: string): ElementType {
  return CATEGORY_ICONS[name] ?? Package;
}

export function getSubgroupIcon(name: string): ElementType {
  return SUBGROUP_ICONS[name] ?? Package;
}
