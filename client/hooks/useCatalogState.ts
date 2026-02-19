import { useState, useMemo, useCallback } from "react";
import {
  type CatalogProduct,
  type FilterAttributeDef,
  filterAttributeRegistry,
  getAllProductsForNode,
} from "../data/catalogData";

// ── Types ───────────────────────────────────────────────────────────

export type SortKey =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "alpha-asc"
  | "alpha-desc"
  | "newest"
  | "bestselling";

/** Active filters: key → set of selected string values (for checkbox/boolean) or [min, max] for range */
export type ActiveFilters = Record<string, string[]>;

export interface PriceRange {
  min: number;
  max: number;
}

/** A filter option extracted from the product dataset */
export interface FilterOption {
  value: string;
  count: number;
}

/** Resolved filter data for a single attribute */
export interface ResolvedFilter {
  def: FilterAttributeDef;
  options: FilterOption[];
  /** For range filters */
  range?: PriceRange;
}

export interface CatalogState {
  // State
  activeFilters: ActiveFilters;
  priceRange: PriceRange | null;
  sortBy: SortKey;
  page: number;

  // Derived
  allProducts: CatalogProduct[];
  filteredProducts: CatalogProduct[];
  paginatedProducts: CatalogProduct[];
  filteredTotal: number;
  resolvedFilters: ResolvedFilter[];

  // Actions
  setFilter: (key: string, values: string[]) => void;
  removeFilter: (key: string) => void;
  removeFilterValue: (key: string, value: string) => void;
  clearAllFilters: () => void;
  setPriceRange: (range: PriceRange | null) => void;
  setSortBy: (sort: SortKey) => void;
  setPage: (page: number) => void;
  hasActiveFilters: boolean;
}

// ── Hook ────────────────────────────────────────────────────────────

export function useCatalogState(
  nodeId: string,
  pageSize: number,
  filtersAvailable?: string[],
  /** When provided, use these products directly instead of loading from nodeId */
  injectedProducts?: CatalogProduct[],
  /** Initial filters to apply on mount (e.g. brand pre-selection) */
  initialFilters?: ActiveFilters,
): CatalogState {
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(initialFilters ?? {});
  const [priceRange, setPriceRangeState] = useState<PriceRange | null>(null);
  const [sortBy, setSortByState] = useState<SortKey>("relevance");
  const [page, setPageState] = useState(1);

  // Generate all products for this node (memoized by nodeId), or use injected products
  const allProducts = useMemo(
    () => injectedProducts ?? getAllProductsForNode(nodeId),
    [nodeId, injectedProducts],
  );

  // Resolve available filters from the full product set
  const resolvedFilters = useMemo<ResolvedFilter[]>(() => {
    const results: ResolvedFilter[] = [];

    // Only show filters whitelisted by the current category node
    const registry = filtersAvailable
      ? filterAttributeRegistry.filter((d) => filtersAvailable.includes(d.key))
      : filterAttributeRegistry;

    for (const def of registry) {
      if (!def.isFilterable) continue;

      if (def.filterType === "range") {
        // Compute min/max from products
        let min = Infinity;
        let max = -Infinity;
        for (const p of allProducts) {
          const val = def.extract(p);
          if (typeof val === "number") {
            if (val < min) min = val;
            if (val > max) max = val;
          }
        }
        if (min < max) {
          results.push({ def, options: [], range: { min, max } });
        }
        continue;
      }

      // Checkbox/boolean: collect unique values with counts
      const valueCounts = new Map<string, number>();
      for (const p of allProducts) {
        const raw = def.extract(p);
        const vals = Array.isArray(raw) ? raw : raw != null ? [String(raw)] : [];
        for (const v of vals) {
          valueCounts.set(v, (valueCounts.get(v) || 0) + 1);
        }
      }

      if (valueCounts.size === 0) continue;

      const options: FilterOption[] = Array.from(valueCounts.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count);

      results.push({ def, options });
    }

    return results;
  }, [allProducts, filtersAvailable]);

  // Apply filters (AND across attributes, OR within same attribute)
  const filteredProducts = useMemo(() => {
    let result = allProducts;

    // Apply checkbox/boolean filters
    for (const [key, values] of Object.entries(activeFilters)) {
      if (values.length === 0) continue;
      const def = filterAttributeRegistry.find((d) => d.key === key);
      if (!def) continue;

      result = result.filter((p) => {
        const raw = def.extract(p);
        const productValues = Array.isArray(raw)
          ? raw
          : raw != null
            ? [String(raw)]
            : [];
        // OR within same attribute: product matches if any of its values is selected
        return productValues.some((v) => values.includes(v));
      });
    }

    // Apply price range filter
    if (priceRange) {
      result = result.filter(
        (p) => p.price >= priceRange.min && p.price <= priceRange.max,
      );
    }

    return result;
  }, [allProducts, activeFilters, priceRange]);

  // Apply sorting
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "alpha-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "alpha-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
        // Reverse of default order (highest index first)
        sorted.reverse();
        break;
      case "bestselling":
        // Prioritize products with "Bestseller" badge
        sorted.sort((a, b) => {
          const aBS = a.badges?.some((bg) => bg.label === "Bestseller") ? 1 : 0;
          const bBS = b.badges?.some((bg) => bg.label === "Bestseller") ? 1 : 0;
          return bBS - aBS;
        });
        break;
      default:
        break; // relevance = default order
    }
    return sorted;
  }, [filteredProducts, sortBy]);

  // Paginate
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedProducts.slice(start, start + pageSize);
  }, [sortedProducts, page, pageSize]);

  // Actions
  const setFilter = useCallback((key: string, values: string[]) => {
    setActiveFilters((prev) => ({ ...prev, [key]: values }));
    setPageState(1); // reset to page 1 on filter change
  }, []);

  const removeFilter = useCallback((key: string) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setPageState(1);
  }, []);

  const removeFilterValue = useCallback((key: string, value: string) => {
    setActiveFilters((prev) => {
      const values = (prev[key] || []).filter((v) => v !== value);
      if (values.length === 0) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: values };
    });
    setPageState(1);
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
    setPriceRangeState(null);
    setPageState(1);
  }, []);

  const setPriceRange = useCallback((range: PriceRange | null) => {
    setPriceRangeState(range);
    setPageState(1);
  }, []);

  const setSortBy = useCallback((sort: SortKey) => {
    setSortByState(sort);
    setPageState(1);
  }, []);

  const hasActiveFilters =
    Object.keys(activeFilters).some((k) => activeFilters[k].length > 0) ||
    priceRange !== null;

  return {
    activeFilters,
    priceRange,
    sortBy,
    page,
    allProducts,
    filteredProducts: sortedProducts,
    paginatedProducts,
    filteredTotal: sortedProducts.length,
    resolvedFilters,
    setFilter,
    removeFilter,
    removeFilterValue,
    clearAllFilters,
    setPriceRange,
    setSortBy,
    setPage: setPageState,
    hasActiveFilters,
  };
}
