<<<<<<< HEAD
import { useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Spin } from "antd";
import { activeBrandConfig } from "../config/brandConfig";
import {
  catalogConfig,
  getAllProductsForNode,
} from "../data/catalogData";
import { 
  fetchCategoriesByParent, 
  buildCategoryTree,
  getNodeBySlugPath,
  getChildren,
  getAncestors,
  type CategoryTree as CategoryTreeType,
} from "../services/categoryService";
import { fetchProductsByCategory } from "../services/productService";
import { useCatalogState } from "../hooks/useCatalogState";
=======
import { useState, useMemo, useCallback, useEffect } from "react";
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
>>>>>>> main
import { filterAttributeRegistry } from "../data/catalogData";
import CatalogBreadcrumb from "../components/catalog/CatalogBreadcrumb";
import SubcategoryCardGrid from "../components/catalog/SubcategoryCardGrid";
import CategoryTreeComponent from "../components/catalog/CategoryTree";
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

// Image base URL configuration
const IMAGE_BASE_URL = import.meta.env.VITE_PIM_IMAGE_BASE_URL || "https://ndomsdevstorageacc.blob.core.windows.net";

function HybridCollectionPage({ 
  slugPath, 
  tree,
  categoryId,
  showCategoriesAsProducts = false,
}: { 
  slugPath: string[];
  tree: CategoryTreeType;
  categoryId: string;
  showCategoriesAsProducts?: boolean;
}) {
  const config = activeBrandConfig;
  const node = getNodeBySlugPath(tree, slugPath)!;
  const nodeId = node.id;

  // Fetch products from API for this category
  const { data: productsResponse, isLoading: productsLoading } = useQuery({
    queryKey: ["products", categoryId],
    queryFn: () => fetchProductsByCategory(categoryId, 0, 9999),
    staleTime: 5 * 60 * 1000,
    enabled: !showCategoriesAsProducts, // Only fetch if not showing categories as products
  });

  // Convert API products to CatalogProduct format
  const apiProducts = useMemo(() => {
    if (!productsResponse?.content) return [];
    
    return productsResponse.content.map((item) => ({
      id: item.id,
      name: item.productName || item.familyLabels?.en || "Unknown Product",
      sku: item.upcId,
      imageUrl: item.imageIconPath 
        ? `${IMAGE_BASE_URL}${item.imageIconPath}`
        : "https://via.placeholder.com/300x300?text=No+Image",
      price: 99.99, // Default price - would come from price API in real scenario
      availabilityStatus: "in-stock" as const,
      brand: undefined,
    }));
  }, [productsResponse]);

  const catalog = useCatalogState(nodeId, 9999, node.filtersAvailable);
<<<<<<< HEAD
  const children = getChildren(tree, node.id);
  const ancestors = getAncestors(tree, node.id);
  
  // Always show tree from the level 1 ancestor when viewing products
  // This allows navigation to sibling categories at the same level
  const treeRoot = ancestors.find((a) => a.level === 1) || (node.level === 1 ? node : null);
  
  // Show tree sidebar when at level 2 or deeper (per catalogConfig.treeVisibilityStartLevel)
  const shouldShowTree = node.level >= catalogConfig.treeVisibilityStartLevel && treeRoot;
=======
  const children = getChildren(node.id);
  const ancestors = getAncestors(node.id);
  const treeRoot =
    ancestors.find((a) => a.level === 1) || (node.level === 1 ? node : null);
>>>>>>> main

  const [viewMode, setViewMode] = useState<CollectionViewMode>("table");
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [tablePage, setTablePage] = useState(1);

  // Use API products if available, fallback to mock data
  const products = apiProducts.length > 0 ? apiProducts : catalog.filteredProducts;

  // Convert child categories to "product" format if showCategoriesAsProducts is true
  const categoriesAsProducts = useMemo(() => {
    if (!showCategoriesAsProducts) return [];
    
    return children.map((child) => ({
      id: child.id,
      name: child.label,
      sku: child.id,
      imageUrl: child.heroImage || "https://via.placeholder.com/300x300?text=Category",
      price: 0,
      availabilityStatus: "in-stock" as const,
      brand: undefined,
      // Add custom flag to identify this as a category
      _isCategory: true,
      _categoryNode: child,
    }));
  }, [showCategoriesAsProducts, children]);

  const displayItems = showCategoriesAsProducts ? categoriesAsProducts : products;

  // When a tab is active, load that child node's products directly
  // and apply the same filters/sorting from the parent catalog state
  const displayProducts = useMemo(() => {
    if (showCategoriesAsProducts) {
      // When showing categories as products, don't apply filtering
      return displayItems;
    }
    
    if (!activeTab) return displayItems;

    let tabProducts = getAllProductsForNode(activeTab);

    // Apply active filters (same logic as useCatalogState)
    for (const [key, values] of Object.entries(catalog.activeFilters)) {
      if (values.length === 0) continue;
      const def = filterAttributeRegistry.find((d) => d.key === key);
      if (!def) continue;
      tabProducts = tabProducts.filter((p) => {
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
<<<<<<< HEAD
      tabProducts = tabProducts.filter(
        (p) => p.price >= catalog.priceRange!.min && p.price <= catalog.priceRange!.max,
=======
      products = products.filter(
        (p) =>
          p.price >= catalog.priceRange!.min &&
          p.price <= catalog.priceRange!.max,
>>>>>>> main
      );
    }

    // Apply sorting
    const sorted = [...tabProducts];
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
<<<<<<< HEAD
  }, [activeTab, displayItems, catalog.activeFilters, catalog.priceRange, catalog.sortBy, showCategoriesAsProducts]);
=======
  }, [
    activeTab,
    catalog.filteredProducts,
    catalog.activeFilters,
    catalog.priceRange,
    catalog.sortBy,
  ]);
>>>>>>> main

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

  if (productsLoading) {
    return (
      <div className="max-w-content-wide mx-auto px-6 py-12 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-content-wide mx-auto px-6 py-8">
      <CatalogBreadcrumb node={node} tree={tree} />

      <div className="flex gap-6">
        {/* Left Sidebar: Tree + Filters */}
        {shouldShowTree && (
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
<<<<<<< HEAD
            <CategoryTreeComponent activeNodeId={activeTab || node.id} rootNodeId={treeRoot!.id} tree={tree} />
=======
            <CategoryTree
              activeNodeId={activeTab || node.id}
              rootNodeId={treeRoot.id}
            />
>>>>>>> main

            {/* Hide filters when showing categories as products */}
            {!showCategoriesAsProducts && catalog.resolvedFilters.length > 0 && (
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
            totalFamilies={showCategoriesAsProducts ? displayProducts.length : catalog.allProducts.length}
            subcategoryCount={showCategoriesAsProducts ? 0 : children.length}
            hasActiveFilters={!showCategoriesAsProducts && (catalog.hasActiveFilters || activeTab !== null)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortBy={catalog.sortBy}
            onSortChange={catalog.setSortBy}
          />

          {/* Active Filter Chips - hide when showing categories as products */}
          {!showCategoriesAsProducts && (
            <ActiveFilterChips
              activeFilters={catalog.activeFilters}
              priceRange={catalog.priceRange}
              onRemoveValue={catalog.removeFilterValue}
              onRemoveFilter={catalog.removeFilter}
              onClearAll={catalog.clearAllFilters}
              onClearPriceRange={() => catalog.setPriceRange(null)}
            />
          )}

          {/* Subcategory Tabs - hide when showing categories as products */}
          {!showCategoriesAsProducts && children.length > 0 && (
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
              showCategoriesAsProducts={showCategoriesAsProducts}
              tree={tree}
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
<<<<<<< HEAD
  
  // Fetch categories from API (includes imageUrl and assetId fields)
  const parentId = "08d6ff04-11c5-4e5b-a1c8-11ac167e849b";
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ["categories", parentId],
    queryFn: () => fetchCategoriesByParent(parentId),
    staleTime: 5 * 60 * 1000,
  });
  
  // Build tree from API data
  const tree = useMemo(() => {
    if (!categories || categories.length === 0) return null;
    return buildCategoryTree(categories, parentId);
  }, [categories, parentId]);
  
  // Find the current node from the tree
  const node = tree ? getNodeBySlugPath(tree, slugPath) : null;
=======
  const modeInfo = useCatalogMode(slugPath);

  // Global or Brand mode — no slug path
  if (modeInfo.mode === "global" || modeInfo.mode === "brand") {
    return <GlobalCatalogPage modeInfo={modeInfo} />;
  }

  // Category mode — resolve node from slug
  const node = getNodeBySlugPath(slugPath);
>>>>>>> main

  // Show loading state while fetching categories
  if (isLoading) {
    return (
      <div className="max-w-content-wide mx-auto px-6 py-12 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }
  
  // Show error state if API fails
  if (error) {
    return (
      <div className="max-w-content-wide mx-auto px-6 py-12 text-center">
        <h1 className="text-xl font-semibold mb-2" style={{ color: config.primaryColor }}>
          Error Loading Categories
        </h1>
        <p className="text-sm" style={{ color: config.secondaryColor }}>
          {error instanceof Error ? error.message : 'Failed to load categories. Please try again.'}
        </p>
      </div>
    );
  }
  
  if (!node || !tree) {
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

<<<<<<< HEAD
  // If node has children, check if they should be shown as list or cards
  if (node.hasChildren) {
    const children = getChildren(tree, node.id);
    
    if (children.length > 0) {
      const childrenHaveSubcategories = children.some(child => child.hasChildren);
      
      // Show as cards when children have subcategories (intermediate level - user navigates deeper)
      // Show as list when children are leaf nodes (final level - quick add to cart)
      if (childrenHaveSubcategories) {
        // Children have more subcategories - show card view for navigation
        return (
          <div className="max-w-content-wide mx-auto px-6 py-8">
            {node.level > 0 && <CatalogBreadcrumb node={node} tree={tree} />}
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
            <SubcategoryCardGrid node={node} children={children} tree={tree} />
          </div>
        );
      } else {
        // Children are leaf nodes - show list view with quick add
        return <HybridCollectionPage slugPath={slugPath} tree={tree} categoryId={node.id} showCategoriesAsProducts={true} />;
      }
    }
=======
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
>>>>>>> main
  }

  // No children or is a leaf node - show products
  return <HybridCollectionPage slugPath={slugPath} tree={tree} categoryId={node.id} />;
}
