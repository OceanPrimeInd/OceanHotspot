"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronRight, X } from "lucide-react";
import {
  ActiveFilterChip,
  FIND_PARTS_TREE,
  NAV_CATEGORIES,
  FILTER_GROUPS,
  buildCategoryLabel,
  buildFilterId,
  getItemsForSubgroup,
  getNavBackendKeys,
  getSubgroupsForBackend,
  navHasMultipleBackends,
} from "./filterConfig";
import {
  getAllMenuIcon,
  getCategoryIcon,
  getNavIcon,
  getSubgroupIcon,
} from "./categoryIcons";

interface FilterBarProps {
  activeFilters: ActiveFilterChip[];
  onFiltersChange: (filters: ActiveFilterChip[]) => void;
}

export function FilterBar({ activeFilters, onFiltersChange }: FilterBarProps) {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [navPath, setNavPath] = useState<string[]>([]);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const activeGroupConfig = FILTER_GROUPS.find((group) => group.label === activeGroup);
  const hasActiveFilters = activeFilters.length > 0;
  const isNestedPanel = activeGroupConfig?.type === "category" || activeGroupConfig?.type === "parts";

  const closeDropdown = () => {
    setIsOpen(false);
    setNavPath([]);
  };

  const openGroup = (label: string) => {
    if (activeGroup === label && isOpen) {
      closeDropdown();
      return;
    }

    setActiveGroup(label);
    setNavPath([]);
    setIsOpen(true);
  };

  const addFilter = (group: string, label: string, value: string) => {
    const id = buildFilterId(group, value);
    if (activeFilters.some((filter) => filter.id === id)) return;

    // One category at a time — picking a new category replaces the previous one
    const withoutSameGroup =
      group === "Category"
        ? activeFilters.filter((filter) => filter.group !== "Category")
        : activeFilters;

    onFiltersChange([...withoutSameGroup, { id, group, label, value }]);
  };

  const removeFilter = (id: string) => {
    onFiltersChange(activeFilters.filter((filter) => filter.id !== id));
  };

  const clearAllFilters = () => {
    onFiltersChange([]);
  };

  const selectNestedFilter = (group: string, path: string[]) => {
    const label = buildCategoryLabel(path);
    const value = path.join(">").toLowerCase();
    addFilter(group, label, value);
    closeDropdown();
  };

  const isOptionSelected = (group: string, value: string) =>
    activeFilters.some((filter) => filter.group === group && filter.value === value);

  const getGroupSelectionCount = (group: string) =>
    activeFilters.filter((filter) => filter.group === group).length;

  useEffect(() => {
    if (isOpen) {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
  }, [isOpen, activeGroup, navPath]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const activeButton = activeGroup ? buttonRefs.current[activeGroup] : null;
      const insidePopover = popoverRef.current?.contains(target);
      const insideButton = activeButton?.contains(target);

      if (!insideButton && !insidePopover) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [activeGroup]);

  const renderSelectionIndicator = (selected: boolean) => (
    <span
      className={`h-4 w-4 rounded-full border-[2px] ${
        selected ? "border-primary bg-primary" : "border-[#7a838b] bg-white"
      }`}
    />
  );

  const AllIcon = getAllMenuIcon();

  const renderCategoryPanel = () => {
    if (navPath.length === 0) {
      return (
        <>
          <button
            type="button"
            onClick={() => selectNestedFilter("Category", ["All categories"])}
            className="flex w-full items-center gap-2.5 border-b border-[#edf1f4] px-4 py-3.5 text-left text-[0.98rem] text-[#1d2a2f] transition hover:bg-[#f3f7f9]"
          >
            <AllIcon className="h-[18px] w-[18px] shrink-0 text-[#5c6b74]" />
            <span className="flex-1">All</span>
            {renderSelectionIndicator(isOptionSelected("Category", "all categories"))}
          </button>
          {NAV_CATEGORIES.map((category) => {
            const NavIcon = getNavIcon(category.label);
            return (
              <button
                key={category.label}
                type="button"
                onClick={() => setNavPath([category.label])}
                className="flex w-full items-center gap-2.5 border-b border-[#edf1f4] px-4 py-3.5 text-left text-[0.98rem] text-[#1d2a2f] transition hover:bg-[#f3f7f9] last:border-b-0"
              >
                <NavIcon className="h-[18px] w-[18px] shrink-0 text-[#5c6b74]" />
                <span className="flex-1">{category.label}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#7a838b]" />
              </button>
            );
          })}
        </>
      );
    }

    const navLabel = navPath[0];
    const hasMultipleBackends = navHasMultipleBackends(navLabel);
    const backendKey = hasMultipleBackends
      ? navPath[1] ?? ""
      : getNavBackendKeys(navLabel)[0] ?? "";

    if (hasMultipleBackends && navPath.length === 1) {
      return (
        <>
          <button
            type="button"
            onClick={() => selectNestedFilter("Category", [navLabel, "All"])}
            className="flex w-full items-center gap-2.5 border-b border-[#edf1f4] px-4 py-3.5 text-left text-[0.98rem] text-[#1d2a2f] transition hover:bg-[#f3f7f9]"
          >
            <AllIcon className="h-[18px] w-[18px] shrink-0 text-[#5c6b74]" />
            <span className="flex-1">All</span>
            {renderSelectionIndicator(
              isOptionSelected("Category", `${navLabel}>all`.toLowerCase())
            )}
          </button>
          {getNavBackendKeys(navLabel).map((key) => {
            const BackendIcon = getCategoryIcon(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => setNavPath([navLabel, key])}
                className="flex w-full items-center gap-2.5 border-b border-[#edf1f4] px-4 py-3.5 text-left text-[0.98rem] text-[#1d2a2f] transition hover:bg-[#f3f7f9] last:border-b-0"
              >
                <BackendIcon className="h-[18px] w-[18px] shrink-0 text-[#5c6b74]" />
                <span className="flex-1">{key}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#7a838b]" />
              </button>
            );
          })}
        </>
      );
    }

    const atSubgroupLevel = hasMultipleBackends
      ? navPath.length === 2
      : navPath.length === 1;

    if (atSubgroupLevel && backendKey) {
      const subgroups = getSubgroupsForBackend(backendKey);

      return (
        <>
          <button
            type="button"
            onClick={() =>
              selectNestedFilter(
                "Category",
                hasMultipleBackends
                  ? [navLabel, backendKey, "All"]
                  : [navLabel, "All"]
              )
            }
            className="flex w-full items-center gap-2.5 border-b border-[#edf1f4] px-4 py-3.5 text-left text-[0.98rem] text-[#1d2a2f] transition hover:bg-[#f3f7f9]"
          >
            <AllIcon className="h-[18px] w-[18px] shrink-0 text-[#5c6b74]" />
            <span className="flex-1">All</span>
            {renderSelectionIndicator(
              isOptionSelected(
                "Category",
                (hasMultipleBackends
                  ? [navLabel, backendKey, "all"]
                  : [navLabel, "all"]
                )
                  .join(">")
                  .toLowerCase()
              )
            )}
          </button>
          {subgroups.map((subgroup) => {
            const items = getItemsForSubgroup(backendKey, subgroup);
            const hasItems = items.length > 0;
            const nextPath = hasMultipleBackends
              ? [navLabel, backendKey, subgroup]
              : [navLabel, subgroup];
            const SubgroupIcon = getSubgroupIcon(subgroup);

            return (
              <button
                key={subgroup}
                type="button"
                onClick={() => {
                  if (hasItems) {
                    setNavPath(nextPath);
                    return;
                  }
                  selectNestedFilter("Category", [...nextPath]);
                }}
                className="flex w-full items-center gap-2.5 border-b border-[#edf1f4] px-4 py-3.5 text-left text-[0.98rem] text-[#1d2a2f] transition hover:bg-[#f3f7f9] last:border-b-0"
              >
                <SubgroupIcon className="h-[18px] w-[18px] shrink-0 text-[#5c6b74]" />
                <span className="flex-1">{subgroup}</span>
                {hasItems ? (
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#7a838b]" />
                ) : (
                  renderSelectionIndicator(
                    isOptionSelected(
                      "Category",
                      [...nextPath].join(">").toLowerCase()
                    )
                  )
                )}
              </button>
            );
          })}
        </>
      );
    }

    const subgroup = hasMultipleBackends ? navPath[2] : navPath[1];
    const items = getItemsForSubgroup(backendKey, subgroup);
    const itemBasePath = hasMultipleBackends
      ? [navLabel, backendKey, subgroup]
      : [navLabel, subgroup];

    return (
      <>
        <button
          type="button"
          onClick={() => selectNestedFilter("Category", [...itemBasePath, "All"])}
          className="flex w-full items-center gap-2.5 border-b border-[#edf1f4] px-4 py-3.5 text-left text-[0.98rem] text-[#1d2a2f] transition hover:bg-[#f3f7f9]"
        >
          <AllIcon className="h-[18px] w-[18px] shrink-0 text-[#5c6b74]" />
          <span className="flex-1">All</span>
          {renderSelectionIndicator(
            isOptionSelected("Category", [...itemBasePath, "all"].join(">").toLowerCase())
          )}
        </button>
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => selectNestedFilter("Category", [...itemBasePath, item])}
            className="flex w-full items-center justify-between border-b border-[#edf1f4] px-4 py-3.5 text-left text-[0.98rem] text-[#1d2a2f] transition hover:bg-[#f3f7f9] last:border-b-0"
          >
            <span>{item}</span>
            {renderSelectionIndicator(
              isOptionSelected(
                "Category",
                [...itemBasePath, item].join(">").toLowerCase()
              )
            )}
          </button>
        ))}
      </>
    );
  };

  const renderPartsPanel = () => {
    if (navPath.length === 0) {
      return Object.keys(FIND_PARTS_TREE).map((partGroup) => (
        <button
          key={partGroup}
          type="button"
          onClick={() => setNavPath([partGroup])}
          className="flex w-full items-center justify-between border-b border-[#edf1f4] px-4 py-3.5 text-left text-[0.98rem] text-[#1d2a2f] transition hover:bg-[#f3f7f9] last:border-b-0"
        >
          <span>{partGroup}</span>
          <ChevronRight className="h-4 w-4 text-[#7a838b]" />
        </button>
      ));
    }

    const partGroup = navPath[0];
    const items = FIND_PARTS_TREE[partGroup] ?? [];

    return (
      <>
        <button
          type="button"
          onClick={() => selectNestedFilter("Find Parts", [partGroup, "All"])}
          className="flex w-full items-center justify-between border-b border-[#edf1f4] px-4 py-3.5 text-left text-[0.98rem] text-[#1d2a2f] transition hover:bg-[#f3f7f9]"
        >
          <span>All</span>
          {renderSelectionIndicator(
            isOptionSelected("Find Parts", `${partGroup}>all`.toLowerCase())
          )}
        </button>
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => selectNestedFilter("Find Parts", [partGroup, item])}
            className="flex w-full items-center justify-between border-b border-[#edf1f4] px-4 py-3.5 text-left text-[0.98rem] text-[#1d2a2f] transition hover:bg-[#f3f7f9] last:border-b-0"
          >
            <span>{item}</span>
            {renderSelectionIndicator(
              isOptionSelected("Find Parts", `${partGroup}>${item}`.toLowerCase())
            )}
          </button>
        ))}
      </>
    );
  };

  const renderCheckboxPanel = () => {
    const options = activeGroupConfig?.options ?? [];

    return options.map((option) => {
      const selected = isOptionSelected(activeGroup!, option.value);

      return (
        <button
          key={option.value}
          type="button"
          onClick={() => {
            if (selected) {
              removeFilter(buildFilterId(activeGroup!, option.value));
              return;
            }
            addFilter(activeGroup!, option.label, option.value);
          }}
          className={`flex w-full items-center justify-between border-b border-[#edf1f4] px-4 py-3.5 text-left text-[0.98rem] text-[#1d2a2f] transition hover:bg-[#f3f7f9] last:border-b-0 ${
            selected ? "bg-primary/10" : "bg-white"
          }`}
        >
          <span>{option.label}</span>
          {renderSelectionIndicator(selected)}
        </button>
      );
    });
  };

  const renderPanelContent = () => {
    if (activeGroupConfig?.type === "category") return renderCategoryPanel();
    if (activeGroupConfig?.type === "parts") return renderPartsPanel();
    return renderCheckboxPanel();
  };

  const getDropdownTitle = () => {
    if (activeGroup === "Category") {
      if (navPath.length === 0) return "Category";
      const navLabel = navPath[0];
      if (navPath.length === 1) return navLabel;
      if (navHasMultipleBackends(navLabel) && navPath.length === 2) return navPath[1];
      return navPath[navPath.length - 1];
    }

    if (activeGroup === "Find Parts") {
      if (navPath.length === 0) return "Find parts";
      return navPath[0];
    }

    if (activeGroup === "Brand") return "Search for brands";
    if (activeGroup === "Price") return "Search for price";
    if (activeGroup === "Boat Type") return "Boat type";
    if (activeGroup === "Eco & Compliance") return "Eco & compliance";
    return activeGroup ?? "Filter";
  };


  return (
    <div className="relative z-50 mb-5 border-b border-border bg-background pb-3">
      <div className="flex flex-wrap items-center gap-3">
        {FILTER_GROUPS.map((group) => {
          const isActive = activeGroup === group.label;
          const isGroupOpen = isOpen && isActive;
          const selectionCount = getGroupSelectionCount(group.label);

          return (
            <div key={group.label} className="relative">
              <button
                ref={(node) => {
                  buttonRefs.current[group.label] = node;
                }}
                type="button"
                onClick={() => openGroup(group.label)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[1.05rem] font-medium transition-all duration-200 ${
                  isActive || selectionCount > 0
                    ? "border-primary bg-primary/10 text-[#1d2a2f] shadow-[0_0_0_1px_hsl(var(--primary)/0.08)]"
                    : "border-[#d2d9df] bg-white text-[#1d2a2f] hover:border-[#b8c4cc]"
                }`}
              >
                <span className="leading-none">
                  {group.label}
                  {selectionCount > 0 ? ` (${selectionCount})` : ""}
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isGroupOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {isGroupOpen && (
                <div
                  ref={popoverRef}
                  className="absolute left-0 top-full z-[100] mt-2 w-[320px] overflow-hidden rounded-[20px] border border-[#dfe7eb] bg-white shadow-[0_18px_36px_rgba(15,23,42,0.16)]"
                >
                  <div className="flex items-center gap-2 border-b border-[#edf1f4] bg-[#f3f7f9] px-3 py-3">
                    {isNestedPanel && navPath.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setNavPath((current) => current.slice(0, current.length - 1))
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary bg-white text-primary transition hover:bg-primary/10"
                        aria-label="Go back"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                    )}
                    <div className="min-w-0 flex-1 px-1 text-sm font-medium text-[#1d2a2f] md:text-base">
                      {getDropdownTitle()}
                    </div>
                  </div>

                  <div
                    ref={scrollRef}
                    className="max-h-[320px] overflow-y-auto bg-white"
                  >
                    {renderPanelContent()}
                  </div>

                  <div className="border-t border-[#edf1f4] bg-white p-3.5">
                    <button
                      type="button"
                      onClick={closeDropdown}
                      className="w-full rounded-[12px] bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground shadow-[0_8px_20px_hsl(var(--primary)/0.22)] transition hover:bg-primary/90 md:text-base"
                    >
                      Show results
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="ml-auto text-[0.95rem] font-medium text-primary underline-offset-2 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <span
              key={filter.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
            >
              <span className="max-w-[280px] truncate">
                {filter.group}: {filter.label}
              </span>
              <button
                type="button"
                onClick={() => removeFilter(filter.id)}
                className="rounded-full p-0.5 text-primary transition hover:bg-primary/15"
                aria-label={`Remove ${filter.label} filter`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
