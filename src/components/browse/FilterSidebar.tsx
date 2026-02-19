"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Loader2, Filter, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface DomainLabel {
  code: string;
  label: string;
}

interface EntityLabel {
  code: string;
  label: string;
}

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
  const [domainLabels, setDomainLabels] = useState<DomainLabel[]>([]);
  const [entityLabels, setEntityLabels] = useState<EntityLabel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLabels = async () => {
      const [domainsRes, entitiesRes] = await Promise.all([
        supabase.from("domain_labels").select("code, label"),
        supabase.from("entity_labels").select("code, label"),
      ]);

      if (domainsRes.data) setDomainLabels(domainsRes.data);
      if (entitiesRes.data) setEntityLabels(entitiesRes.data);
      setLoading(false);
    };

    fetchLabels();
  }, []);

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

  if (loading) {
    return (
      <aside className="hidden lg:block w-64 bg-card border-r border-border p-6 flex-shrink-0">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </aside>
    );
  }

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

        {/* Categories (Domain) */}
        <div>
          <h3 className="text-sm font-semibold text-headline mb-4">Categories</h3>
          <div className="space-y-3">
            {domainLabels.map((domain) => (
              <div key={domain.code} className="flex items-center space-x-3">
                <Checkbox
                  id={`domain-${domain.code}`}
                  checked={selectedDomains.includes(domain.code)}
                  onCheckedChange={() => handleDomainToggle(domain.code)}
                />
                <Label
                  htmlFor={`domain-${domain.code}`}
                  className="text-sm font-normal cursor-pointer text-foreground"
                >
                  {domain.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Product Type (Entity) */}
        <div>
          <h3 className="text-sm font-semibold text-headline mb-4">Product Type</h3>
          <div className="space-y-3">
            {entityLabels.map((entity) => (
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
