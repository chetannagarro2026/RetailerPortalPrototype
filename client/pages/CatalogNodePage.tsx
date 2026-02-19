import { useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { activeBrandConfig } from "../config/brandConfig";
import {
  catalogConfig,
  getNodeBySlugPath,
  getChildren,
  getAncestors,
  getAllProductsForNode,
} from "../data/catalogData";
import { useCatalogState, type SortKey } from "../hooks/useCatalogState";
import { filterAttributeRegistry } from "../data/catalogData";
import CatalogBreadcrumb from "../components/catalog/CatalogBreadcrumb";
import SubcategoryCardGrid from "../components/catalog/SubcategoryCardGrid";
import CategoryTree from "../components/catalog/CategoryTree";
import FilterPanel from "../components/catalog/FilterPanel";
import ActiveFilterChips from "../components/catalog/ActiveFilterChips";
import FamilyCardGrid from "../components/collection/FamilyCardGrid";

// Level 2 collection components
import CollectionHeader, { type CollectionViewMode } from "../components/collection/CollectionHeader";
import SubcategoryTabs from "../components/collection/SubcategoryTabs";
import HybridFamilyTable from "../components/collection/HybridFamilyTable";

// ═══════════════════════════════════════════════════════════════════
// HYBRID COLLECTION PAGE (Any node with products — N-level scalable)
// ═══════════════════════════════════════════════════════════════════

function HybridCollectionPage({ slugPath }: { slugPath: string[] }) {
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
        const pv = Array.isArray(raw) ? raw : raw != null ? [String(raw)] : [];
        return pv.some((v) => values.includes(v));
      });
    }

    // Apply price range
    if (catalog.priceRange) {
      products = products.filter(
        (p) => p.price >= catalog.priceRange!.min && p.price <= catalog.priceRange!.max,
      );
    }

    // Apply sorting
    const sorted = [...products];
    switch (catalog.sortBy) {
      case "price-asc":  sorted.sort((a, b) => a.price - b.price); break;
      case "price-desc": sorted.sort((a, b) => b.price - a.price); break;
      case "alpha-asc":  sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "alpha-desc": sorted.sort((a, b) => b.name.localeCompare(a.name)); break;
      case "newest":     sorted.reverse(); break;
      default: break;
    }
    return sorted;
  }, [activeTab, catalog.filteredProducts, catalog.activeFilters, catalog.priceRange, catalog.sortBy]);

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
              maxHeight: "calc(100vh - var(--header-height) - var(--nav-height) - 48px)",
              borderRight: `1px solid ${config.borderColor}`,
            }}
          >
            <CategoryTree activeNodeId={activeTab || node.id} rootNodeId={treeRoot.id} />

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
  const node = getNodeBySlugPath(slugPath);

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

  const hasProducts = node.productCount > 0;
  const isSubcategoryLanding = node.hasChildren && !hasProducts;

  if (isSubcategoryLanding) {
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

  return <HybridCollectionPage slugPath={slugPath} />;
}
