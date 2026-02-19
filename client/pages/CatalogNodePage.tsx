import { useState, useMemo, useCallback } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { activeBrandConfig } from "../config/brandConfig";
import {
  getNodeBySlugPath,
  getChildren,
  getAncestors,
  getAllProductsForNode,
  getAllCatalogProducts,
  getAllBrands,
} from "../data/catalogData";
import { useCatalogState, type SortKey, type ActiveFilters } from "../hooks/useCatalogState";
import { filterAttributeRegistry } from "../data/catalogData";
import CatalogBreadcrumb from "../components/catalog/CatalogBreadcrumb";
import SubcategoryCardGrid from "../components/catalog/SubcategoryCardGrid";
import CategoryTree from "../components/catalog/CategoryTree";
import FilterPanel from "../components/catalog/FilterPanel";
import ActiveFilterChips from "../components/catalog/ActiveFilterChips";
import FamilyCardGrid from "../components/collection/FamilyCardGrid";
import CollectionHeader, { type CollectionViewMode } from "../components/collection/CollectionHeader";
import SubcategoryTabs from "../components/collection/SubcategoryTabs";
import HybridFamilyTable from "../components/collection/HybridFamilyTable";

// ═══════════════════════════════════════════════════════════════════
// CATALOG MODE DETECTION
// ═══════════════════════════════════════════════════════════════════

type CatalogMode = "category" | "brand" | "global";

interface CatalogModeInfo {
  mode: CatalogMode;
  brandSlug?: string;
  brandName?: string;
}

function useCatalogMode(slugPath: string[]): CatalogModeInfo {
  const [searchParams] = useSearchParams();
  const brandSlug = searchParams.get("brand");

  if (slugPath.length > 0) {
    return { mode: "category" };
  }

  if (brandSlug) {
    const allBrands = getAllBrands();
    const matched = allBrands.find((b) => b.slug === brandSlug);
    return {
      mode: "brand",
      brandSlug,
      brandName: matched?.name || brandSlug,
    };
  }

  return { mode: "global" };
}

// ═══════════════════════════════════════════════════════════════════
// GLOBAL / BRAND CATALOG PAGE
// ═══════════════════════════════════════════════════════════════════

function GlobalCatalogPage({ modeInfo }: { modeInfo: CatalogModeInfo }) {
  const config = activeBrandConfig;

  // Load all products across the catalog
  const allGlobalProducts = useMemo(() => getAllCatalogProducts(), []);

  // Compute brand stats for header in brand mode
  const brandStats = useMemo(() => {
    if (modeInfo.mode !== "brand" || !modeInfo.brandName) return null;
    const brandProducts = allGlobalProducts.filter(
      (p) => p.brand === modeInfo.brandName,
    );
    const skuCount = brandProducts.reduce(
      (sum, p) => sum + (p.variants?.length || 1),
      0,
    );
    return { familyCount: brandProducts.length, skuCount };
  }, [allGlobalProducts, modeInfo]);

  // Initial filters: pre-select brand when in brand mode
  const initialFilters = useMemo<ActiveFilters | undefined>(() => {
    if (modeInfo.mode === "brand" && modeInfo.brandName) {
      return { brand: [modeInfo.brandName] };
    }
    return undefined;
  }, [modeInfo]);

  const catalog = useCatalogState(
    "__global__",
    9999,
    undefined, // all filters available
    allGlobalProducts,
    initialFilters,
  );

  const [viewMode, setViewMode] = useState<CollectionViewMode>("table");
  const [tablePage, setTablePage] = useState(1);

  const PAGE_SIZE = 20;
  const paginatedProducts = useMemo(() => {
    const start = (tablePage - 1) * PAGE_SIZE;
    return catalog.filteredProducts.slice(start, start + PAGE_SIZE);
  }, [catalog.filteredProducts, tablePage]);

  const title =
    modeInfo.mode === "brand" && modeInfo.brandName
      ? modeInfo.brandName
      : "All Products";

  // Detect if brand filter was removed (switch to global mode URL)
  const isBrandMode = modeInfo.mode === "brand";

  return (
    <div className="max-w-content-wide mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <GlobalBreadcrumb modeInfo={modeInfo} />

      {/* Brand header */}
      {isBrandMode && brandStats && (
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1
              className="text-xl font-semibold mb-0.5"
              style={{ color: config.primaryColor }}
            >
              {modeInfo.brandName}
            </h1>
            <p className="text-xs" style={{ color: config.secondaryColor }}>
              {brandStats.familyCount} Product Families &middot;{" "}
              {brandStats.skuCount.toLocaleString()} SKUs
            </p>
          </div>
          <Link
            to="/catalog"
            className="text-xs no-underline"
            style={{ color: config.secondaryColor }}
          >
            Clear Brand Filter
          </Link>
        </div>
      )}

      <div className="flex gap-6">
        {/* Left Sidebar: Full tree + Filters */}
        <aside
          className="shrink-0 sticky self-start overflow-y-auto pr-4"
          style={{
            width: 240,
            top: "calc(var(--header-height) + var(--nav-height) + 24px)",
            maxHeight:
              "calc(100vh - var(--header-height) - var(--nav-height) - 48px)",
            borderRight: `1px solid ${config.borderColor}`,
          }}
        >
          <CategoryTree activeNodeId="" rootNodeId="root" />

          {catalog.resolvedFilters.length > 0 && (
            <div
              className="mt-5 pt-5"
              style={{ borderTop: `1px solid ${config.borderColor}` }}
            >
              <FilterPanel
                resolvedFilters={catalog.resolvedFilters}
                activeFilters={catalog.activeFilters}
                priceRange={catalog.priceRange}
                onFilterChange={(key, values) => {
                  catalog.setFilter(key, values);
                  setTablePage(1);
                }}
                onPriceRangeChange={(range) => {
                  catalog.setPriceRange(range);
                  setTablePage(1);
                }}
              />
            </div>
          )}
        </aside>

        {/* Right: Content */}
        <div className="flex-1 min-w-0">
          {!isBrandMode && (
            <CollectionHeader
              title={title}
              familyCount={catalog.filteredProducts.length}
              totalFamilies={catalog.allProducts.length}
              subcategoryCount={0}
              hasActiveFilters={catalog.hasActiveFilters}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={catalog.sortBy}
              onSortChange={catalog.setSortBy}
            />
          )}

          {isBrandMode && (
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs" style={{ color: config.secondaryColor }}>
                {catalog.filteredProducts.length} Product Families
                {catalog.hasActiveFilters &&
                  ` (filtered from ${catalog.allProducts.length})`}
              </p>
              <div className="flex items-center gap-3">
                <ViewToggleInline mode={viewMode} onChange={setViewMode} />
                <SortSelectInline
                  sortBy={catalog.sortBy}
                  onChange={catalog.setSortBy}
                />
              </div>
            </div>
          )}

          <ActiveFilterChips
            activeFilters={catalog.activeFilters}
            priceRange={catalog.priceRange}
            onRemoveValue={catalog.removeFilterValue}
            onRemoveFilter={catalog.removeFilter}
            onClearAll={catalog.clearAllFilters}
            onClearPriceRange={() => catalog.setPriceRange(null)}
          />

          {viewMode === "table" ? (
            <HybridFamilyTable
              products={paginatedProducts}
              total={catalog.filteredProducts.length}
              page={tablePage}
              onPageChange={setTablePage}
              showCategory
            />
          ) : (
            <FamilyCardGrid
              products={paginatedProducts}
              total={catalog.filteredProducts.length}
              page={tablePage}
              onPageChange={setTablePage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// INLINE VIEW/SORT CONTROLS (for brand mode header)
// ═══════════════════════════════════════════════════════════════════

function ViewToggleInline({
  mode,
  onChange,
}: {
  mode: CollectionViewMode;
  onChange: (m: CollectionViewMode) => void;
}) {
  const config = activeBrandConfig;
  return (
    <div
      className="flex rounded-lg overflow-hidden"
      style={{ border: `1px solid ${config.borderColor}` }}
    >
      {(["table", "grid"] as const).map((key, i) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className="px-2.5 py-1 text-[11px] font-medium cursor-pointer transition-colors"
          style={{
            backgroundColor: mode === key ? config.primaryColor : "#fff",
            color: mode === key ? "#fff" : config.secondaryColor,
            border: "none",
            borderLeft: i > 0 ? `1px solid ${config.borderColor}` : "none",
          }}
        >
          {key === "table" ? "Table" : "Grid"}
        </button>
      ))}
    </div>
  );
}

function SortSelectInline({
  sortBy,
  onChange,
}: {
  sortBy: SortKey;
  onChange: (s: SortKey) => void;
}) {
  return (
    <select
      value={sortBy}
      onChange={(e) => onChange(e.target.value as SortKey)}
      className="text-xs border border-gray-200 rounded-md px-2 py-1"
    >
      <option value="relevance">Sort: Relevance</option>
      <option value="price-asc">Price: Low → High</option>
      <option value="price-desc">Price: High → Low</option>
      <option value="alpha-asc">Name: A → Z</option>
      <option value="alpha-desc">Name: Z → A</option>
      <option value="newest">Newest First</option>
      <option value="bestselling">Best Selling</option>
    </select>
  );
}

// ═══════════════════════════════════════════════════════════════════
// GLOBAL BREADCRUMB
// ═══════════════════════════════════════════════════════════════════

function GlobalBreadcrumb({ modeInfo }: { modeInfo: CatalogModeInfo }) {
  const config = activeBrandConfig;

  const crumbs =
    modeInfo.mode === "brand"
      ? [
          { label: "Home", href: "/" },
          { label: "Catalog", href: "/catalog" },
          { label: `Brand: ${modeInfo.brandName}`, href: "" },
        ]
      : [
          { label: "Home", href: "/" },
          { label: "Catalog", href: "" },
        ];

  return (
    <nav className="flex items-center gap-1.5 flex-wrap mb-4">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <span className="text-[8px]" style={{ color: config.secondaryColor }}>
                ›
              </span>
            )}
            {isLast ? (
              <span
                className="text-xs font-medium"
                style={{ color: config.primaryColor }}
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.href}
                className="text-xs no-underline transition-colors hover:underline"
                style={{ color: config.secondaryColor }}
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════
// HYBRID COLLECTION PAGE (Category Mode — Any node with products)
// ═══════════════════════════════════════════════════════════════════

function HybridCollectionPage({ slugPath }: { slugPath: string[] }) {
  const config = activeBrandConfig;
  const node = getNodeBySlugPath(slugPath)!;
  const nodeId = node.id;

  const catalog = useCatalogState(nodeId, 9999, node.filtersAvailable);
  const children = getChildren(node.id);
  const ancestors = getAncestors(node.id);
  const treeRoot =
    ancestors.find((a) => a.level === 1) || (node.level === 1 ? node : null);

  const [viewMode, setViewMode] = useState<CollectionViewMode>("table");
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [tablePage, setTablePage] = useState(1);

  // When a tab is active, load that child node's products directly
  // and apply the same filters/sorting from the parent catalog state
  const displayProducts = useMemo(() => {
    if (!activeTab) return catalog.filteredProducts;

    let products = getAllProductsForNode(activeTab);

    // Apply active filters (same logic as useCatalogState)
    for (const [key, values] of Object.entries(catalog.activeFilters)) {
      if (values.length === 0) continue;
      const def = filterAttributeRegistry.find((d) => d.key === key);
      if (!def) continue;
      products = products.filter((p) => {
        const raw = def.extract(p);
        const pv = Array.isArray(raw)
          ? raw
          : raw != null
            ? [String(raw)]
            : [];
        return pv.some((v) => values.includes(v));
      });
    }

    // Apply price range
    if (catalog.priceRange) {
      products = products.filter(
        (p) =>
          p.price >= catalog.priceRange!.min &&
          p.price <= catalog.priceRange!.max,
      );
    }

    // Apply sorting
    const sorted = [...products];
    switch (catalog.sortBy) {
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
        sorted.reverse();
        break;
      default:
        break;
    }
    return sorted;
  }, [
    activeTab,
    catalog.filteredProducts,
    catalog.activeFilters,
    catalog.priceRange,
    catalog.sortBy,
  ]);

  // Paginate for table view
  const PAGE_SIZE = 20;
  const paginatedProducts = useMemo(() => {
    const start = (tablePage - 1) * PAGE_SIZE;
    return displayProducts.slice(start, start + PAGE_SIZE);
  }, [displayProducts, tablePage]);

  const handleTabChange = useCallback((tabId: string | null) => {
    setActiveTab(tabId);
    setTablePage(1);
  }, []);

  return (
    <div className="max-w-content-wide mx-auto px-6 py-8">
      <CatalogBreadcrumb node={node} />

      <div className="flex gap-6">
        {/* Left Sidebar: Tree + Filters */}
        {treeRoot && (
          <aside
            className="shrink-0 sticky self-start overflow-y-auto pr-4"
            style={{
              width: 240,
              top: "calc(var(--header-height) + var(--nav-height) + 24px)",
              maxHeight:
                "calc(100vh - var(--header-height) - var(--nav-height) - 48px)",
              borderRight: `1px solid ${config.borderColor}`,
            }}
          >
            <CategoryTree
              activeNodeId={activeTab || node.id}
              rootNodeId={treeRoot.id}
            />

            {catalog.resolvedFilters.length > 0 && (
              <div
                className="mt-5 pt-5"
                style={{ borderTop: `1px solid ${config.borderColor}` }}
              >
                <FilterPanel
                  resolvedFilters={catalog.resolvedFilters}
                  activeFilters={catalog.activeFilters}
                  priceRange={catalog.priceRange}
                  onFilterChange={catalog.setFilter}
                  onPriceRangeChange={catalog.setPriceRange}
                />
              </div>
            )}
          </aside>
        )}

        {/* Right: Header + Tabs + Table/Grid */}
        <div className="flex-1 min-w-0">
          <CollectionHeader
            title={node.label}
            familyCount={displayProducts.length}
            totalFamilies={catalog.allProducts.length}
            subcategoryCount={children.length}
            hasActiveFilters={catalog.hasActiveFilters || activeTab !== null}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortBy={catalog.sortBy}
            onSortChange={catalog.setSortBy}
          />

          {/* Active Filter Chips */}
          <ActiveFilterChips
            activeFilters={catalog.activeFilters}
            priceRange={catalog.priceRange}
            onRemoveValue={catalog.removeFilterValue}
            onRemoveFilter={catalog.removeFilter}
            onClearAll={catalog.clearAllFilters}
            onClearPriceRange={() => catalog.setPriceRange(null)}
          />

          {/* Subcategory Tabs */}
          {children.length > 0 && (
            <SubcategoryTabs
              children={children}
              activeTabId={activeTab}
              onTabChange={handleTabChange}
            />
          )}

          {/* Content: Table (default) or Grid */}
          {viewMode === "table" ? (
            <HybridFamilyTable
              products={paginatedProducts}
              total={displayProducts.length}
              page={tablePage}
              onPageChange={setTablePage}
            />
          ) : (
            <FamilyCardGrid
              products={paginatedProducts}
              total={displayProducts.length}
              page={tablePage}
              onPageChange={setTablePage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT (Router entry point)
// ═══════════════════════════════════════════════════════════════════

export default function CatalogNodePage() {
  const config = activeBrandConfig;
  const { "*": splat } = useParams();
  const slugPath = splat ? splat.split("/").filter(Boolean) : [];
  const modeInfo = useCatalogMode(slugPath);

  // Global or Brand mode — no slug path
  if (modeInfo.mode === "global" || modeInfo.mode === "brand") {
    return <GlobalCatalogPage modeInfo={modeInfo} />;
  }

  // Category mode — resolve node from slug
  const node = getNodeBySlugPath(slugPath);

  if (!node) {
    return (
      <div className="max-w-content-wide mx-auto px-6 py-12 text-center">
        <h1
          className="text-xl font-semibold mb-2"
          style={{ color: config.primaryColor }}
        >
          Category Not Found
        </h1>
        <p className="text-sm" style={{ color: config.secondaryColor }}>
          The catalog path you requested does not exist.
        </p>
      </div>
    );
  }

  const hasProducts = node.productCount > 0;
  const isSubcategoryLanding = node.hasChildren && !hasProducts;

  if (isSubcategoryLanding) {
    return (
      <div className="max-w-content-wide mx-auto px-6 py-8">
        {node.level > 0 && <CatalogBreadcrumb node={node} />}
        <div className="mb-6">
          <h1
            className="text-xl font-semibold mb-1"
            style={{ color: config.primaryColor }}
          >
            {node.label}
          </h1>
          {node.level === 0 && (
            <p className="text-sm" style={{ color: config.secondaryColor }}>
              Browse the complete {config.brandName} portfolio.
            </p>
          )}
        </div>
        <SubcategoryCardGrid node={node} />
      </div>
    );
  }

  return <HybridCollectionPage slugPath={slugPath} />;
}
