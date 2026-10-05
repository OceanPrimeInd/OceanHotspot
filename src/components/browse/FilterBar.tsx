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
  const [partsPath, setPartsPath] = useState<string[]>([]);
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
  };

  const commitCategoryFromNavPath = () => {
    if (activeGroup !== "Category" || navPath.length === 0) {
      closeDropdown();
      return;
    }

    const navLabel = navPath[0];
    const hasMultipleBackends = navHasMultipleBackends(navLabel);
    const backendKey = hasMultipleBackends
      ? navPath[1] ?? ""
      : getNavBackendKeys(navLabel)[0] ?? "";

    if (navPath.length === 1) {
      selectNestedFilter("Category", [navLabel, "All"]);
      return;
    }

    if (hasMultipleBackends && navPath.length === 2 && backendKey) {
      selectNestedFilter("Category", [navLabel, backendKey, "All"]);
      return;
    }

    const atSubgroupLevel = hasMultipleBackends ? navPath.length === 3 : navPath.length === 2;
    if (atSubgroupLevel && backendKey) {
      const subgroup = hasMultipleBackends ? navPath[2] : navPath[1];
      selectNestedFilter(
        "Category",
        hasMultipleBackends ? [navLabel, backendKey, subgroup, "All"] : [navLabel, subgroup, "All"],
      );
      return;
    }

    selectNestedFilter("Category", [...navPath]);
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
      className={`flex h-4 w-4 shrink-0 items-center justify-center border ${
        selected ? "border-[#0f1111] bg-[#0f1111] text-white" : "border-[#888] bg-white"
      }`}
    >
      {selected ? <span className="text-[10px] leading-none">✓</span> : null}
    </span>
  );

  const AllIcon = getAllMenuIcon();

  const renderCategoryPanel = () => {
    if (navPath.length === 0) {
      return (
        <>
          <button
            type="button"
            onClick={() => selectNestedFilter("Category", ["All categories"])}
            className="flex w-full items-center gap-2.5  px-0.5 py-1 text-left text-[13px] text-[#1d2a2f] transition hover:bg-[#f3f7f9]"
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
                className="flex w-full items-center gap-2.5  px-0.5 py-1 text-left text-[13px] text-[#1d2a2f] transition hover:bg-[#f3f7f9] last:border-b-0"
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
            className="flex w-full items-center gap-2.5  px-0.5 py-1 text-left text-[13px] text-[#1d2a2f] transition hover:bg-[#f3f7f9]"
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
                className="flex w-full items-center gap-2.5  px-0.5 py-1 text-left text-[13px] text-[#1d2a2f] transition hover:bg-[#f3f7f9] last:border-b-0"
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
            className="flex w-full items-center gap-2.5  px-0.5 py-1 text-left text-[13px] text-[#1d2a2f] transition hover:bg-[#f3f7f9]"
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
                className="flex w-full items-center gap-2.5  px-0.5 py-1 text-left text-[13px] text-[#1d2a2f] transition hover:bg-[#f3f7f9] last:border-b-0"
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
          className="flex w-full items-center gap-2.5  px-0.5 py-1 text-left text-[13px] text-[#1d2a2f] transition hover:bg-[#f3f7f9]"
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
            className="flex w-full items-center justify-between  px-0.5 py-1 text-left text-[13px] text-[#1d2a2f] transition hover:bg-[#f3f7f9] last:border-b-0"
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
    if (partsPath.length === 0) {
      return Object.keys(FIND_PARTS_TREE).map((partGroup) => (
        <button
          key={partGroup}
          type="button"
          onClick={() => setPartsPath([partGroup])}
          className="flex w-full items-center justify-between  px-0.5 py-1 text-left text-[13px] text-[#1d2a2f] transition hover:bg-[#f3f7f9] last:border-b-0"
        >
          <span>{partGroup}</span>
          <ChevronRight className="h-4 w-4 text-[#7a838b]" />
        </button>
      ));
    }

    const partGroup = partsPath[0];
    const items = FIND_PARTS_TREE[partGroup] ?? [];

    return (
      <>
        <button
          type="button"
          onClick={() => selectNestedFilter("Find Parts", [partGroup, "All"])}
          className="flex w-full items-center justify-between  px-0.5 py-1 text-left text-[13px] text-[#1d2a2f] transition hover:bg-[#f3f7f9]"
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
            className="flex w-full items-center justify-between  px-0.5 py-1 text-left text-[13px] text-[#1d2a2f] transition hover:bg-[#f3f7f9] last:border-b-0"
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

  const renderCheckboxPanelFor = (groupLabel: string) => {
    const options = FILTER_GROUPS.find((group) => group.label === groupLabel)?.options ?? [];

    return options.map((option) => {
      const selected = isOptionSelected(groupLabel, option.value);

      return (
        <button
          key={option.value}
          type="button"
          onClick={() => {
            if (selected) {
              removeFilter(buildFilterId(groupLabel, option.value));
              return;
            }
            addFilter(groupLabel, option.label, option.value);
          }}
          className={`flex w-full items-center gap-2 px-0.5 py-1 text-left text-[13px] text-[#1d2a2f] hover:text-primary ${
            selected ? "font-medium" : ""
          }`}
        >
          {renderSelectionIndicator(selected)}
          <span>{option.label}</span>
        </button>
      );
    });
  };

  const renderPanelContent = () => {
    if (activeGroupConfig?.type === "category") return renderCategoryPanel();
    if (activeGroupConfig?.type === "parts") return renderPartsPanel();
    return renderCheckboxPanelFor(activeGroup ?? "");
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


  const renderGroupBody = (groupLabel: string) => {
    if (groupLabel === "Category") return renderCategoryPanel();
    if (groupLabel === "Find Parts") return renderPartsPanel();
    return renderCheckboxPanelFor(groupLabel);
  };

  return (
    <aside className="w-full text-[#0f1111]">
      {hasActiveFilters && (
        <div className="mb-3 border-b border-[#e3e6e6] pb-3">
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-sm text-primary hover:underline"
          >
            Clear filters
          </button>
          <div className="mt-2 flex flex-col gap-1.5">
            {activeFilters.map((filter) => (
              <span key={filter.id} className="inline-flex items-center gap-1 text-xs text-[#0f1111]">
                <button
                  type="button"
                  onClick={() => removeFilter(filter.id)}
                  aria-label={`Remove ${filter.label} filter`}
                  className="text-[#565959] hover:text-[#0f1111]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <span className="truncate">{filter.label}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {FILTER_GROUPS.map((group) => {
        const path = group.label === "Category" ? navPath : group.label === "Find Parts" ? partsPath : [];
        const setPath = group.label === "Category" ? setNavPath : setPartsPath;

        return (
          <section key={group.label} className="border-b border-[#e3e6e6] py-3">
            <h2 className="mb-2 text-[15px] font-bold">{group.label}</h2>
            {path.length > 0 && (
              <button
                type="button"
                onClick={() => setPath((current) => current.slice(0, -1))}
                className="mb-1 flex items-center gap-1 text-[13px] font-bold text-[#0f1111] hover:text-primary hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {path[path.length - 1]}
              </button>
            )}
            <div className="max-h-64 overflow-y-auto pr-1">{renderGroupBody(group.label)}</div>
          </section>
        );
      })}
    </aside>
  );
}
