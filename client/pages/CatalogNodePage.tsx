import { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { activeBrandConfig } from "../config/brandConfig";
import {
  getNodeBySlugPath,
  getChildren,
  getAncestors,
  getAllCatalogProducts,
  getAllBrands,
} from "../data/catalogData";
import { useCatalogState, type SortKey, type ActiveFilters } from "../hooks/useCatalogState";
import CatalogBreadcrumb from "../components/catalog/CatalogBreadcrumb";
import SubcategoryCardGrid from "../components/catalog/SubcategoryCardGrid";
import CategoryTree from "../components/catalog/CategoryTree";
import FilterPanel from "../components/catalog/FilterPanel";
import ActiveFilterChips from "../components/catalog/ActiveFilterChips";
import FamilyCardGrid from "../components/collection/FamilyCardGrid";
import { type CollectionViewMode } from "../components/collection/CollectionHeader";
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

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    <div className="w-full px-4 pt-2 pb-4">
      {/* Breadcrumb — full width, aligned with sidebar left edge */}
      <GlobalBreadcrumb modeInfo={modeInfo} />

      {/* Page Title Row: title+subtitle left, controls right */}
      <div className="flex items-start justify-between" style={{ marginBottom: 16 }}>
        <div>
          <h1
            className="text-lg font-semibold"
            style={{ color: config.primaryColor }}
          >
            {isBrandMode && modeInfo.brandName ? modeInfo.brandName : title}
            <span className="text-lg font-light" style={{ color: config.secondaryColor }}>
              {" "}&ndash; {catalog.filteredProducts.length} Product Famil{catalog.filteredProducts.length !== 1 ? "ies" : "y"}
              {catalog.hasActiveFilters &&
                ` (filtered from ${catalog.allProducts.length})`}
              {isBrandMode && brandStats && ` \u00b7 ${brandStats.skuCount.toLocaleString()} SKUs`}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {isBrandMode && (
            <Link
              to="/catalog"
              className="text-xs no-underline"
              style={{ color: config.secondaryColor }}
            >
              Clear Brand Filter
            </Link>
          )}
          <ViewToggleInline mode={viewMode} onChange={setViewMode} />
          <SortSelectInline sortBy={catalog.sortBy} onChange={catalog.setSortBy} />
        </div>
      </div>

      <div className="flex" style={{ gap: 24 }}>
        {/* Left Sidebar: Full tree + Filters */}
        <aside
          className="shrink-0 self-stretch overflow-y-auto pr-4"
          style={{
            width: 240,
            borderTop: "1px solid #E5E7EB",
            borderRight: "1px solid #E5E7EB",
          }}
        >
          <CategoryTree activeNodeId="" rootNodeId="root" />

          {catalog.resolvedFilters.length > 0 && (
            <div
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
    <nav className="flex items-center gap-1.5 flex-wrap" style={{ marginBottom: 4 }}>
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <span className="text-[16px] text-center" style={{ color: config.secondaryColor }}>
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
                className="text-xs font-semibold no-underline transition-colors hover:underline"
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
  const [tablePage, setTablePage] = useState(1);

  const displayProducts = catalog.filteredProducts;

  // Paginate for table view
  const PAGE_SIZE = 20;
  const paginatedProducts = useMemo(() => {
    const start = (tablePage - 1) * PAGE_SIZE;
    return displayProducts.slice(start, start + PAGE_SIZE);
  }, [displayProducts, tablePage]);

  return (
    <div className="w-full px-4 py-4">
      {/* Breadcrumb — full width, aligned with sidebar left edge */}
      <CatalogBreadcrumb node={node} />

      {/* Page Title Row: title+subtitle left, controls right */}
      <div className="flex items-start justify-between" style={{ marginBottom: 16 }}>
        <div>
          <h1
            className="text-lg font-semibold"
            style={{ color: config.primaryColor }}
          >
            {node.label}
            <span className="text-lg font-light" style={{ color: config.secondaryColor }}>
              {" "}&ndash; {displayProducts.length} Product Famil{displayProducts.length !== 1 ? "ies" : "y"}
              {catalog.hasActiveFilters &&
                ` (filtered from ${catalog.allProducts.length})`}
              {children.length > 0 && ` \u00b7 ${children.length} Subcategories`}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggleInline mode={viewMode} onChange={setViewMode} />
          <SortSelectInline sortBy={catalog.sortBy} onChange={catalog.setSortBy} />
        </div>
      </div>

      <div className="flex" style={{ gap: 24 }}>
        {/* Left Sidebar: Tree + Filters */}
        {treeRoot && (
          <aside
            className="shrink-0 self-stretch overflow-y-auto pr-4"
            style={{
              width: 240,
              borderTop: "1px solid #E5E7EB",
              borderRight: "1px solid #E5E7EB",
            }}
          >
            <CategoryTree
              activeNodeId={node.id}
              rootNodeId={treeRoot.id}
            />

            {catalog.resolvedFilters.length > 0 && (
              <div
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

        {/* Right: Tabs + Table/Grid */}
        <div className="flex-1 min-w-0">
          {/* Active Filter Chips */}
          <ActiveFilterChips
            activeFilters={catalog.activeFilters}
            priceRange={catalog.priceRange}
            onRemoveValue={catalog.removeFilterValue}
            onRemoveFilter={catalog.removeFilter}
            onClearAll={catalog.clearAllFilters}
            onClearPriceRange={() => catalog.setPriceRange(null)}
          />

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
      <div className="w-full px-4 py-4 text-center">
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
      <div className="w-full px-4 py-4">
        {node.level > 0 && (
          <CatalogBreadcrumb node={node} />
        )}
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
