export interface FilterOption {
  label: string;
  value: string;
}

export interface ActiveFilterChip {
  id: string;
  group: string;
  label: string;
  value: string;
}

export const TOP_CATEGORIES = [
  "Anchoring & Mooring",
  "Boats & Vessels",
  "Cabin, Galley & Comfort",
  "Covers & Accessories",
  "Deck Hardware",
  "Electrical & Power",
  "Electronics & Navigation",
  "Engines, Propulsion & Steering",
  "Finance, Insurance & Legal",
  "Fishing & Harvesting",
  "Maintenance & Consumables",
  "Plumbing, Pumps & Ventilation",
  "Safety, Security & Response",
  "Sailing: Rigging & Sails",
  "Trailers & Towing",
  "Watersports",
] as const;

/** Shopper-facing nav labels. Full backend taxonomy unchanged for sellers. */
export interface NavCategory {
  label: string;
  backendKeys: readonly (typeof TOP_CATEGORIES)[number][];
}

export const NAV_CATEGORIES: NavCategory[] = [
  { label: "Vessels", backendKeys: ["Boats & Vessels"] },
  { label: "Engines", backendKeys: ["Engines, Propulsion & Steering"] },
  { label: "Electronics", backendKeys: ["Electronics & Navigation"] },
  { label: "Electrical", backendKeys: ["Electrical & Power"] },
  { label: "Deck", backendKeys: ["Anchoring & Mooring", "Deck Hardware", "Sailing: Rigging & Sails"] },
  { label: "Pumps", backendKeys: ["Plumbing, Pumps & Ventilation"] },
  { label: "Maintenance", backendKeys: ["Maintenance & Consumables"] },
  { label: "Safety", backendKeys: ["Safety, Security & Response"] },
  {
    label: "Leisure",
    backendKeys: [
      "Cabin, Galley & Comfort",
      "Covers & Accessories",
      "Fishing & Harvesting",
      "Watersports",
      "Trailers & Towing",
    ],
  },
];

export function getNavCategory(label: string) {
  return NAV_CATEGORIES.find((category) => category.label === label);
}

export function navHasMultipleBackends(label: string) {
  return (getNavCategory(label)?.backendKeys.length ?? 0) > 1;
}

export function getNavBackendKeys(label: string) {
  return getNavCategory(label)?.backendKeys ?? [];
}

export const CATEGORY_TREE: Record<string, Record<string, string[]>> = {
  "Anchoring & Mooring": {
    Anchoring: ["Anchors", "Anchor Chain", "Rope & Rode", "Windlasses"],
    "Mooring & Docking": ["Dock Lines", "Fenders", "Cleats", "Buoys", "Mooring Accessories"],
  },
  "Boats & Vessels": {
    "Leisure Boats": ["Motorboats", "Sailboats", "RIBs", "Catamarans", "Yachts", "Fishing Boats", "Canal Boats"],
    "Commercial Vessels": ["Workboats", "Passenger Vessels", "Fishing Vessels", "Support & Survey Vessels"],
    "Small Craft & Tenders": ["Tenders", "Dinghies", "Inflatables"],
    "Floating Assets": ["Pontoons & Floating Docks", "Barges", "Houseboats", "Berths & Moorings"],
  },
  "Cabin, Galley & Comfort": {
    Galley: ["Marine Refrigeration", "Cookers & BBQs", "Galley Equipment"],
    Climate: ["Air Conditioning", "Heating"],
    Furniture: ["Marine Furniture", "Mattresses", "Tables"],
  },
  "Covers & Accessories": {
    "Covers & Shade": ["Covers", "Bimini Tops", "Canopies"],
    Accessories: ["Flags", "Clocks", "Thermometers", "Mirrors", "Cup Holders", "Storage Solutions"],
  },
  "Deck Hardware": {
    Fittings: ["Hinges", "Latches", "Pad Eyes", "Deck Plates", "Deck Fills"],
    "Rails & Stanchions": ["Railings", "Stanchions", "Grab Rails"],
    "Hatches & Portlights": ["Hatches", "Portlights"],
  },
  "Electrical & Power": {
    "Batteries & Charging": ["Batteries", "Battery Chargers", "Inverters"],
    "Power Generation": ["Solar Panels", "Generators", "Wind Generators"],
    "Shore Power": ["Shore Power Cables", "Shore Power Inlets", "Shore Power Adapters"],
    Distribution: ["Switch Panels", "Circuit Breakers", "Fuses", "Wiring & Cable", "Connectors", "USB & Power Outlets", "Electrical Accessories"],
    Lighting: ["Interior Lighting", "Exterior & Navigation Lighting", "Deck & Spotlights", "Underwater Lighting"],
  },
  "Electronics & Navigation": {
    Navigation: ["Chartplotters", "GPS", "Radar", "AIS", "Autopilots", "Compasses"],
    "Fishfinders & Sonar": ["Fishfinders", "Sonar", "Transducers"],
    Communications: ["VHF Radios", "Satellite Communications"],
    Instruments: ["Wind Instruments", "Depth Instruments", "Speed Instruments"],
    "Marine Cameras": ["Marine Cameras", "Camera Mounts"],
  },
  "Engines, Propulsion & Steering": {
    Engines: ["Outboard Motors", "Inboard Engines", "Sterndrives", "Electric & Hybrid Propulsion"],
    "Propellers & Drivetrain": ["Propellers", "Shaft Systems"],
    "Fuel, Cooling & Exhaust": ["Fuel Systems", "Cooling Systems", "Exhaust Systems"],
    "Controls & Instruments": ["Engine Controls", "Engine Instruments", "Control Cables"],
    "Engine Parts & Service": ["Service Kits", "Filters", "Impellers", "Belts", "Spark Plugs", "Anodes", "Gaskets", "Thermostats", "Oils & Lubricants", "Engine Spares"],
    "Steering & Manoeuvring": ["Steering Systems", "Hydraulic Steering", "Steering Wheels", "Rudders", "Bow Thrusters", "Stern Thrusters", "Joystick Controls", "Trim Tabs"],
  },
  "Finance, Insurance & Legal": {
    Services: ["Finance", "Insurance", "Legal & Documentation", "Surveys & Valuations"],
  },
  "Fishing & Harvesting": {
    "Leisure Fishing": ["Rod Holders", "Downriggers", "Outriggers", "Trolling Motors", "Tackle Storage", "Livewell Systems", "Fish Cleaning Equipment"],
    "Commercial Fishing": ["Nets", "Pots & Traps", "Haulers", "Fish Handling & Storage"],
    "Aquaculture & Harvesting": ["Shellfish Equipment", "Seaweed Equipment", "Aquaculture Equipment"],
  },
  "Maintenance & Consumables": {
    "Cleaning & Care": ["Boat Cleaners", "Polish & Wax", "Brushes"],
    "Paint & Antifouling": ["Antifouling Paint", "Topside Paint", "Primers"],
    Repair: ["Sanding", "Sealants", "Adhesives"],
    "Corrosion Protection": ["Anodes", "Corrosion Inhibitors"],
    "General Lubricants": ["Engine Oil", "Gear Oil", "Grease"],
  },
  "Plumbing, Pumps & Ventilation": {
    "Fresh Water": ["Fresh Water Systems", "Water Pressure Pumps", "Water Heaters", "Faucets", "Shower Systems"],
    Sanitation: ["Marine Toilets", "Holding Tanks", "Macerator Pumps"],
    "Bilge & Washdown": ["Bilge Pumps", "Washdown Pumps"],
    "Hoses & Fittings": ["Hoses", "Hose Fittings", "Through-Hull Fittings"],
    Ventilation: ["Blowers", "Ventilation Fans"],
  },
  "Safety, Security & Response": {
    "Personal Safety": ["Life Jackets & Buoyancy Aids", "Harnesses", "Lifebuoys", "MOB Equipment"],
    "Emergency & Survival": ["Liferafts", "EPIRBs & PLBs", "Flares", "Emergency Lighting", "First Aid"],
    "Fire Safety": ["Fire Extinguishers", "Fire Suppression"],
    Security: ["Alarms", "Tracking", "Locks"],
    Response: ["Spill Kits", "Search & Rescue Equipment"],
  },
  "Sailing: Rigging & Sails": {
    "Standing Rigging": ["Wire Rope", "Turnbuckles", "Rigging Fittings"],
    "Running Rigging": ["Lines", "Blocks", "Winches", "Shackles"],
    Spars: ["Mast Hardware", "Boom Hardware"],
    "Furler Systems": ["Furlers", "Furler Parts"],
    Sails: ["Mainsails", "Genoas", "Jibs", "Spinnakers"],
    "Sail Handling": ["Lazy Jacks", "Sail Covers", "Sail Bags", "Battens", "Sail Hardware"],
  },
  "Trailers & Towing": {
    All: ["Trailer Parts", "Winches", "Rollers", "Bearings", "Lights", "Couplings", "Jacks", "Tie Downs"],
  },
  Watersports: {
    All: ["Towables", "Wakeboards", "Water Skis", "Paddleboards", "Kayaks", "Tow Ropes"],
  },
};

export const BRAND_OPTIONS: FilterOption[] = [
  { label: "Garmin", value: "garmin" },
  { label: "Raymarine", value: "raymarine" },
  { label: "Simrad", value: "simrad" },
  { label: "B&G", value: "b_and_g" },
  { label: "Lowrance", value: "lowrance" },
  { label: "Victron Energy", value: "victron" },
  { label: "Blue Sea Systems", value: "blue_sea" },
  { label: "Lewmar", value: "lewmar" },
  { label: "Harken", value: "harken" },
  { label: "Vetus", value: "vetus" },
  { label: "Yanmar", value: "yanmar" },
  { label: "Mercury", value: "mercury" },
  { label: "Yamaha", value: "yamaha" },
  { label: "Volvo Penta", value: "volvo" },
  { label: "Other vendors", value: "other_vendor" },
];

export const BOAT_TYPE_OPTIONS: FilterOption[] = [
  { label: "Sailboats", value: "sailboats" },
  { label: "Motorboats", value: "motorboats" },
  { label: "RIBs", value: "ribs" },
  { label: "Fishing Boats", value: "fishing_boats" },
  { label: "Catamarans", value: "catamarans" },
  { label: "Yachts", value: "yachts" },
  { label: "Canal Boats", value: "canal_boats" },
  { label: "Commercial Vessels", value: "commercial_vessels" },
];

export const FIND_PARTS_TREE: Record<string, string[]> = {
  "Engine brand": ["Yanmar", "Mercury", "Yamaha", "Volvo Penta", "Suzuki", "Honda", "Other"],
  "Engine model": ["Inboard", "Outboard", "Sterndrive", "Diesel", "Petrol"],
  "Parts & Service Kits": ["Service Kits", "Filters", "Impellers", "Belts", "Spark Plugs", "Anodes", "Gaskets", "Thermostats"],
  "Manufacturer part number lookup": ["Search by MPN", "Search by part number"],
};

export const ECO_COMPLIANCE_OPTIONS: FilterOption[] = [
  { label: "Eco-rated", value: "eco_rated" },
  { label: "Certified", value: "certified" },
  { label: "Environmentally compliant", value: "environmentally_compliant" },
  { label: "Sustainable materials", value: "sustainable_materials" },
];

export const ALL_SUBGROUP = "All";

export const FILTER_GROUPS: {
  label: string;
  type: "category" | "checkbox" | "price" | "parts";
  options?: FilterOption[];
}[] = [
  { label: "Category", type: "category" },
  {
    label: "Price",
    type: "price",
    options: [
      { label: "Under £50", value: "0-50" },
      { label: "£50 – £100", value: "50-100" },
      { label: "£100 – £500", value: "100-500" },
      { label: "£500 – £1,000", value: "500-1000" },
      { label: "£1,000 – £5,000", value: "1000-5000" },
      { label: "Over £5,000", value: "5000+" },
    ],
  },
  { label: "Brand", type: "checkbox", options: BRAND_OPTIONS },
  { label: "Boat Type", type: "checkbox", options: BOAT_TYPE_OPTIONS },
  { label: "Find Parts", type: "parts" },
  { label: "Eco & Compliance", type: "checkbox", options: ECO_COMPLIANCE_OPTIONS },
];

export const PRICE_RANGE_MAP: Record<string, [number, number]> = {
  "0-50": [0, 50],
  "50-100": [50, 100],
  "100-500": [100, 500],
  "500-1000": [500, 1000],
  "1000-5000": [1000, 5000],
  "5000+": [5000, Infinity],
};

export function buildCategoryLabel(path: string[]) {
  return path.join(" / ");
}

export function buildFilterId(group: string, value: string) {
  return `${group}::${value}`;
}

export function getSubgroupsForBackend(backendKey: string) {
  return Object.keys(CATEGORY_TREE[backendKey] ?? {});
}

export function getItemsForSubgroup(backendKey: string, subgroup: string) {
  return CATEGORY_TREE[backendKey]?.[subgroup] ?? [];
}
