import { useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Select } from "antd";
import { AppstoreOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../config/brandConfig";
import {
  catalogConfig,
  getNodeBySlugPath,
  getChildren,
  getAncestors,
  getAllProductsForNode,
  type CatalogProduct,
} from "../data/catalogData";
import { useCatalogState, type SortKey } from "../hooks/useCatalogState";
import CatalogBreadcrumb from "../components/catalog/CatalogBreadcrumb";
import SubcategoryCardGrid from "../components/catalog/SubcategoryCardGrid";
import CategoryTree from "../components/catalog/CategoryTree";
import FilterPanel from "../components/catalog/FilterPanel";
import ActiveFilterChips from "../components/catalog/ActiveFilterChips";
import CatalogProductGrid from "../components/catalog/CatalogProductGrid";
import SpreadsheetView from "../components/catalog/SpreadsheetView";

// Level 2 collection components
import CollectionHeader, { type CollectionViewMode } from "../components/collection/CollectionHeader";
import SubcategoryTabs from "../components/collection/SubcategoryTabs";
import HybridFamilyTable from "../components/collection/HybridFamilyTable";

type ViewMode = "grid" | "table";

export default function CatalogNodePage() {
  const config = activeBrandConfig;
  const { "*": splat } = useParams();
  const slugPath = splat ? splat.split("/").filter(Boolean) : [];
  const node = getNodeBySlugPath(slugPath);

  // Determine if this is a Level 2 collection page
  const isLevel2 = node !== null && node.level === 2;

  if (!node) {
    return (
      <div className="max-w-content-wide mx-auto px-6 py-12 text-center">
        <h1 className="text-xl font-semibold mb-2" style={{ color: config.primaryColor }}>
          Category Not Found
        </h1>
        <p className="text-sm" style={{ color: config.secondaryColor }}>
          The catalog path you requested does not exist.
        </p>
      </div>
    );
  }

  const showSubcategoryGrid =
    node.level < catalogConfig.treeVisibilityStartLevel && node.hasChildren;

  // ── Level 0 / 1: Subcategory Card Grid ────────────────────────
  if (showSubcategoryGrid) {
    return (
      <div className="max-w-content-wide mx-auto px-6 py-8">
        {node.level > 0 && <CatalogBreadcrumb node={node} />}
        <div className="mb-6">
          <h1 className="text-xl font-semibold mb-1" style={{ color: config.primaryColor }}>
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

  // ── Level 2: Hybrid Collection Page ───────────────────────────
  if (isLevel2) {
    return <Level2CollectionPage slugPath={slugPath} />;
  }

  // ── Level 3+: Standard Layout (Tree + Filters + Grid/Table) ───
  return <Level3PlusPage slugPath={slugPath} />;
}

// ═══════════════════════════════════════════════════════════════════
// LEVEL 2 — COLLECTION PAGE (Hybrid Family Table + Quick Add Panel)
// ═══════════════════════════════════════════════════════════════════

function Level2CollectionPage({ slugPath }: { slugPath: string[] }) {
  const config = activeBrandConfig;
  const node = getNodeBySlugPath(slugPath)!;
  const nodeId = node.id;

  const catalog = useCatalogState(nodeId, 9999, node.filtersAvailable);
  const children = getChildren(node.id);
  const ancestors = getAncestors(node.id);
  const treeRoot = ancestors.find((a) => a.level === 1) || (node.level === 1 ? node : null);

  const [viewMode, setViewMode] = useState<CollectionViewMode>("table");
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [tablePage, setTablePage] = useState(1);

  // When we have an active subcategory tab, gather that subcategory's products
  const tabProducts = useMemo(() => {
    if (!activeTab) return null;
    return getAllProductsForNode(activeTab);
  }, [activeTab]);

  // Combine: if tab is active, merge tab products with the main filtered set via intersection
  // If no tab, use the catalog's filtered products directly
  const displayProducts = useMemo(() => {
    const base = catalog.filteredProducts;
    if (!activeTab || !tabProducts) return base;

    // Filter the main set to only include products whose families match
    // the subcategory tab. Since tab products come from a child node,
    // we use their IDs as a set for intersection.
    const tabIds = new Set(tabProducts.map((p) => p.id));
    return base.filter((p) => tabIds.has(p.id));
  }, [catalog.filteredProducts, activeTab, tabProducts]);

  // Paginate for table view
  const PAGE_SIZE = 20;
  const paginatedProducts = useMemo(() => {
    const start = (tablePage - 1) * PAGE_SIZE;
    return displayProducts.slice(start, start + PAGE_SIZE);
  }, [displayProducts, tablePage]);

  // Products for grid view (use existing catalog pagination)
  const gridProducts = useMemo(() => {
    const start = (tablePage - 1) * catalogConfig.pageSize;
    return displayProducts.slice(start, start + catalogConfig.pageSize);
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
              maxHeight: "calc(100vh - var(--header-height) - var(--nav-height) - 48px)",
              borderRight: `1px solid ${config.borderColor}`,
            }}
          >
            <CategoryTree activeNodeId={node.id} rootNodeId={treeRoot.id} />

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
            <CatalogProductGrid
              products={gridProducts}
              total={displayProducts.length}
              page={tablePage}
              pageSize={catalogConfig.pageSize}
              onPageChange={setTablePage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// LEVEL 3+ — STANDARD LAYOUT (Tree + Filters + Grid/Spreadsheet)
// ═══════════════════════════════════════════════════════════════════

function Level3PlusPage({ slugPath }: { slugPath: string[] }) {
  const config = activeBrandConfig;
  const node = getNodeBySlugPath(slugPath)!;
  const nodeId = node.id;

  const catalog = useCatalogState(nodeId, catalogConfig.pageSize, node.filtersAvailable);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const showTree = node.level >= catalogConfig.treeVisibilityStartLevel;
  const ancestors = getAncestors(node.id);
  const treeRoot = ancestors.find((a) => a.level === 1) || (node.level === 1 ? node : null);
  const children = getChildren(node.id);

  return (
    <div className="max-w-content-wide mx-auto px-6 py-8">
      <CatalogBreadcrumb node={node} />

      <div className="flex gap-6">
        {showTree && treeRoot && (
          <aside
            className="shrink-0 sticky self-start overflow-y-auto pr-4"
            style={{
              width: 240,
              top: "calc(var(--header-height) + var(--nav-height) + 24px)",
              maxHeight: "calc(100vh - var(--header-height) - var(--nav-height) - 48px)",
              borderRight: `1px solid ${config.borderColor}`,
            }}
          >
            <CategoryTree activeNodeId={node.id} rootNodeId={treeRoot.id} />

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

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-lg font-semibold mb-0.5" style={{ color: config.primaryColor }}>
                {node.label}
              </h1>
              <p className="text-xs" style={{ color: config.secondaryColor }}>
                {catalog.filteredTotal} product{catalog.filteredTotal !== 1 ? "s" : ""}
                {catalog.hasActiveFilters && ` (filtered from ${catalog.allProducts.length})`}
                {children.length > 0 && ` · ${children.length} subcategories`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {config.enableSpreadsheetMode && (
                <LegacyViewToggle mode={viewMode} onChange={setViewMode} />
              )}
              <Select
                value={catalog.sortBy}
                onChange={(val) => catalog.setSortBy(val as SortKey)}
                size="small"
                style={{ width: 180 }}
                options={[
                  { value: "relevance", label: "Sort: Relevance" },
                  { value: "price-asc", label: "Price: Low → High" },
                  { value: "price-desc", label: "Price: High → Low" },
                  { value: "alpha-asc", label: "Name: A → Z" },
                  { value: "alpha-desc", label: "Name: Z → A" },
                  { value: "newest", label: "Newest First" },
                  { value: "bestselling", label: "Best Selling" },
                ]}
              />
            </div>
          </div>

          <ActiveFilterChips
            activeFilters={catalog.activeFilters}
            priceRange={catalog.priceRange}
            onRemoveValue={catalog.removeFilterValue}
            onRemoveFilter={catalog.removeFilter}
            onClearAll={catalog.clearAllFilters}
            onClearPriceRange={() => catalog.setPriceRange(null)}
          />

          {children.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {children.map((child) => (
                <a
                  key={child.id}
                  href={`/catalog/${[...slugPath, child.slug].join("/")}`}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-full no-underline transition-colors"
                  style={{
                    border: `1px solid ${config.borderColor}`,
                    color: config.primaryColor,
                    backgroundColor: "#fff",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = config.cardBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff";
                  }}
                >
                  {child.label} ({child.productCount})
                </a>
              ))}
            </div>
          )}

          {viewMode === "grid" ? (
            <CatalogProductGrid
              products={catalog.paginatedProducts}
              total={catalog.filteredTotal}
              page={catalog.page}
              pageSize={catalogConfig.pageSize}
              onPageChange={catalog.setPage}
            />
          ) : (
            <SpreadsheetView
              products={catalog.paginatedProducts}
              total={catalog.filteredTotal}
              page={catalog.page}
              pageSize={catalogConfig.pageSize}
              onPageChange={catalog.setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Legacy View Toggle for Level 3+ ─────────────────────────────────

function LegacyViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  const config = activeBrandConfig;

  return (
    <div
      className="flex rounded-lg overflow-hidden"
      style={{ border: `1px solid ${config.borderColor}` }}
    >
      <button
        onClick={() => onChange("grid")}
        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium cursor-pointer transition-colors"
        style={{
          backgroundColor: mode === "grid" ? config.primaryColor : "#fff",
          color: mode === "grid" ? "#fff" : config.secondaryColor,
          border: "none",
        }}
      >
        <AppstoreOutlined className="text-xs" />
        Grid
      </button>
      <button
        onClick={() => onChange("table")}
        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium cursor-pointer transition-colors"
        style={{
          backgroundColor: mode === "table" ? config.primaryColor : "#fff",
          color: mode === "table" ? "#fff" : config.secondaryColor,
          border: "none",
          borderLeft: `1px solid ${config.borderColor}`,
        }}
      >
        <UnorderedListOutlined className="text-xs" />
        Table
      </button>
    </div>
  );
}
