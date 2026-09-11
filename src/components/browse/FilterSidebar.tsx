"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Loader2, Filter, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface CategoryGroup {
  code: string;
  label: string;
  description: string;
  subcategories: { code: string; label: string }[];
}

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    code: "brand",
    label: "Brand",
    description: "Garmin, Raymarine, Simrad, B&G, Lowrance, Victron Energy, Blue Sea Systems, Lewmar, Harken, Vetus, Yanmar, Mercury, Yamaha, Volvo Penta, and others as vendors add them.",
    subcategories: [
      { code: "garmin", label: "Garmin" },
      { code: "raymarine", label: "Raymarine" },
      { code: "simrad", label: "Simrad" },
      { code: "bg", label: "B&G" },
      { code: "lowrance", label: "Lowrance" },
      { code: "victron_energy", label: "Victron Energy" },
      { code: "blue_sea_systems", label: "Blue Sea Systems" },
      { code: "lewmar", label: "Lewmar" },
      { code: "harken", label: "Harken" },
      { code: "vetus", label: "Vetus" },
      { code: "yanmar", label: "Yanmar" },
      { code: "mercury", label: "Mercury" },
      { code: "yamaha", label: "Yamaha" },
      { code: "volvo_penta", label: "Volvo Penta" },
      { code: "other_vendor", label: "Other vendors" },
    ],
  },
  {
    code: "boat_type",
    label: "Boat Type",
    description: "Sailboats, Motorboats, RIBs, Fishing Boats, Catamarans, Yachts, Canal Boats, Commercial Vessels.",
    subcategories: [
      { code: "sailboats", label: "Sailboats" },
      { code: "motorboats", label: "Motorboats" },
      { code: "ribs", label: "RIBs" },
      { code: "fishing_boats", label: "Fishing Boats" },
      { code: "catamarans", label: "Catamarans" },
      { code: "yachts", label: "Yachts" },
      { code: "canal_boats", label: "Canal Boats" },
      { code: "commercial_vessels", label: "Commercial Vessels" },
    ],
  },
  {
    code: "find_parts",
    label: "Find Parts",
    description: "Engine brand → Engine model → parts and service kits, plus manufacturer part number lookup.",
    subcategories: [
      { code: "engine_brand", label: "Engine brand" },
      { code: "engine_model", label: "Engine model" },
      { code: "parts_service_kits", label: "Parts & Service Kits" },
      { code: "manufacturer_part_number", label: "Manufacturer part number lookup" },
    ],
  },
  {
    code: "eco_compliance",
    label: "Eco & Compliance",
    description: "Everything tagged eco-rated or certified.",
    subcategories: [
      { code: "eco_rated", label: "Eco-rated" },
      { code: "certified", label: "Certified" },
    ],
  },
];

interface FilterSidebarProps {
  selectedDomains: string[];
  selectedEntities: string[];
  priceRange: [number, number];
  maxPrice: number;
  onDomainChange: (domains: string[]) => void;
  onEntityChange: (entities: string[]) => void;
  onPriceChange: (range: [number, number]) => void;
  onClearFilters: () => void;
}

export function FilterSidebar({
  selectedDomains,
  selectedEntities,
  priceRange,
  maxPrice,
  onDomainChange,
  onEntityChange,
  onPriceChange,
  onClearFilters,
}: FilterSidebarProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (code: string) => {
    setExpandedCategory((current) => (current === code ? null : code));
  };

  const handleDomainToggle = (code: string) => {
    if (selectedDomains.includes(code)) {
      onDomainChange(selectedDomains.filter((d) => d !== code));
    } else {
      onDomainChange([...selectedDomains, code]);
    }
  };

  const handleEntityToggle = (code: string) => {
    if (selectedEntities.includes(code)) {
      onEntityChange(selectedEntities.filter((e) => e !== code));
    } else {
      onEntityChange([...selectedEntities, code]);
    }
  };

  const hasActiveFilters =
    selectedDomains.length > 0 ||
    selectedEntities.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < maxPrice;

  return (
    <aside className="hidden lg:block w-64 bg-card border-r border-border flex-shrink-0 min-h-screen">
      {/* Header */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-headline">Filters</h2>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Price Range */}
        <div>
          <h3 className="text-sm font-semibold text-headline mb-4">Price Range</h3>
          <div className="space-y-4">
            <Slider
              value={priceRange}
              onValueChange={(value) => onPriceChange(value as [number, number])}
              max={maxPrice}
              step={100}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>£{priceRange[0].toLocaleString()}</span>
              <span>£{priceRange[1].toLocaleString()}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Shop by */}
        <div>
          <h3 className="text-sm font-semibold text-headline mb-4">Shop by</h3>
          <div className="space-y-4">
            {CATEGORY_GROUPS.map((group) => {
              const isExpanded = expandedCategory === group.code;

              return (
                <div key={group.code} className="border-b border-border pb-2 last:border-b-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() => toggleCategory(group.code)}
                    className="flex w-full items-center justify-between text-left text-sm font-medium text-foreground"
                  >
                    <span>{group.label}</span>
                    <span className="text-muted-foreground">{isExpanded ? "−" : "+"}</span>
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-2 pl-2">
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {group.description}
                      </p>
                      {group.subcategories.length > 0 && (
                        <div className="space-y-2 pt-1">
                          {group.subcategories.map((sub) => (
                            <div key={sub.code} className="flex items-center space-x-3">
                              <Checkbox
                                id={`domain-${sub.code}`}
                                checked={selectedDomains.includes(sub.code)}
                                onCheckedChange={() => handleDomainToggle(sub.code)}
                              />
                              <Label
                                htmlFor={`domain-${sub.code}`}
                                className="text-sm font-normal cursor-pointer text-foreground"
                              >
                                {sub.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Product Type (Entity) */}
        <div>
          <h3 className="text-sm font-semibold text-headline mb-4">Product Type</h3>
          <div className="space-y-3">
            {[
              { code: "physical_product", label: "Physical Product" },
              { code: "service", label: "Service" },
              { code: "asset_facility", label: "Asset / Facility" },
              { code: "software_data", label: "Software / Data" },
              { code: "membership_subscription", label: "Membership / Subscription" },
              { code: "document_standard", label: "Document / Standard" },
            ].map((entity) => (
              <div key={entity.code} className="flex items-center space-x-3">
                <Checkbox
                  id={`entity-${entity.code}`}
                  checked={selectedEntities.includes(entity.code)}
                  onCheckedChange={() => handleEntityToggle(entity.code)}
                />
                <Label
                  htmlFor={`entity-${entity.code}`}
                  className="text-sm font-normal cursor-pointer text-foreground"
                >
                  {entity.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
