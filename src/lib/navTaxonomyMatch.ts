import {
  CATEGORY_TREE,
  TOP_CATEGORIES,
  getNavBackendKeys,
} from "@/components/browse/filterConfig";
import {
  domainSlugFromFilterValue,
  matchesDomainSlug,
  productSearchText,
  type CategoryMatchable,
} from "@/lib/browseCategoryMatch";

const norm = (value: string) =>
  value
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/[^\w\s&]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const STOP = new Set(["and", "the", "all", "categories", "&", ""]);

function tokensFromLabel(label: string): string[] {
  return norm(label)
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP.has(token));
}

const EXTRA_KEYWORDS: Record<string, string[]> = {
  "batteries & charging": ["battery", "batteries", "lithium", "agm", "charger", "chargers", "inverter", "inverters", "victron", "mppt"],
  "power generation": ["solar", "panel", "panels", "photovoltaic", "pv", "generator", "generators", "wind"],
  "solar panels": ["solar", "panel", "panels", "photovoltaic", "pv", "pv logic"],
  "battery chargers": ["charger", "chargers", "mppt", "charge controller", "charging"],
  "shore power": ["shore", "inlet", "adapter", "cord", "cable"],
  lighting: ["light", "lights", "led", "navigation light", "spotlight"],
  navigation: ["chartplotter", "gps", "radar", "ais", "autopilot", "compass"],
  "bow thrusters": ["bow", "thruster", "sleipner", "side power"],
  "stern thrusters": ["stern", "thruster", "sleipner"],
  "fuel, cooling & exhaust": ["exhaust", "cooling", "fuel", "manifold", "muffler"],
  "engine parts & service": ["filter", "impeller", "belt", "service kit", "anode", "gasket", "spark plug"],
  "steering & manoeuvring": ["steering", "rudder", "thruster", "trim tab", "joystick"],
  "bilge & washdown": ["bilge", "pump", "washdown"],
  sanitation: ["toilet", "macerator", "holding tank", "sanitation"],
  "paint & antifouling": ["antifoul", "antifouling", "paint", "primer"],
};

function addStemVariants(keywords: Set<string>) {
  for (const word of [...keywords]) {
    if (word.endsWith("ies") && word.length > 4) keywords.add(`${word.slice(0, -3)}y`);
    if (word.endsWith("es") && word.length > 4) keywords.add(word.slice(0, -2));
    if (word.endsWith("s") && word.length > 3) keywords.add(word.slice(0, -1));
  }
}

function expandLabelKeywords(label: string, childLabels: string[] = []): string[] {
  const keywords = new Set<string>();
  for (const token of tokensFromLabel(label)) keywords.add(token);
  for (const child of childLabels) {
    for (const token of tokensFromLabel(child)) keywords.add(token);
  }
  addStemVariants(keywords);
  const extra = EXTRA_KEYWORDS[norm(label)];
  if (extra) extra.forEach((kw) => keywords.add(norm(kw)));
  return [...keywords].filter((kw) => kw.length > 1);
}

const REFINE_KEYWORDS = new Map<string, string[]>();

function buildRefineIndex() {
  if (REFINE_KEYWORDS.size > 0) return;

  for (const backend of TOP_CATEGORIES) {
    const subgroups = CATEGORY_TREE[backend];
    if (!subgroups) continue;

    const allItems = Object.values(subgroups).flat();
    REFINE_KEYWORDS.set(norm(backend), expandLabelKeywords(backend, allItems));

    for (const [subgroup, items] of Object.entries(subgroups)) {
      REFINE_KEYWORDS.set(norm(subgroup), expandLabelKeywords(subgroup, items));
      for (const item of items) {
        REFINE_KEYWORDS.set(norm(item), expandLabelKeywords(item, [item]));
      }
    }
  }
}

export function keywordsForRefineLabel(refine: string): string[] {
  buildRefineIndex();
  const key = norm(refine);
  return REFINE_KEYWORDS.get(key) ?? expandLabelKeywords(refine, []);
}

function textMatchesKeywords(text: string, keywords: string[]): boolean {
  if (keywords.length === 0) return true;
  return keywords.some((kw) => kw.length > 1 && text.includes(kw));
}

/** Header ?cat= + ?refine= (subgroup or product type from mega-menu). */
export function matchesBrowseRefine(
  product: CategoryMatchable,
  cat: string | null,
  refine: string | null,
): boolean {
  if (cat && !matchesDomainSlug(product, cat)) return false;

  const label = (refine || "").trim();
  if (!label) return true;

  const text = productSearchText(product);
  const keywords = keywordsForRefineLabel(label);
  if (textMatchesKeywords(text, keywords)) return true;

  const tokens = tokensFromLabel(label);
  return tokens.some((token) => text.includes(token));
}

/** FilterBar chip path, e.g. electrical>electrical & power>batteries & charging>all */
export function matchesCategoryFilterPath(product: CategoryMatchable, filterValue: string): boolean {
  const parts = filterValue
    .split(">")
    .map((part) => part.trim())
    .filter((part) => part && !/^all(\s+categories)?$/i.test(part));

  if (parts.length === 0) return true;

  const slug = domainSlugFromFilterValue(filterValue);
  if (!slug || !matchesDomainSlug(product, slug)) return false;

  if (parts.length === 1) return true;

  const refineLabel = parts[parts.length - 1];
  if (norm(refineLabel) === norm(slug)) return true;

  return matchesBrowseRefine(product, slug, refineLabel);
}

/** Last taxonomy segment to put in ?refine= for mega-menu links. */
export function refineLabelFromBrowseParts(parts: string[]): string | null {
  if (parts.length <= 1) return null;

  const navLabel = parts[0];
  const backends = getNavBackendKeys(navLabel);
  const multi = backends.length > 1;

  if (parts.length === 2) {
    const second = parts[1]?.trim() ?? "";
    if (multi && (backends as readonly string[]).includes(second)) return second;
    return null;
  }

  return parts[parts.length - 1]?.trim() || null;
}
