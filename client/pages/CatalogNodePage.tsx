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
import { filterAttributeRegistry } from "../data/catalogData";
import CatalogBreadcrumb from "../components/catalog/CatalogBreadcrumb";
import SubcategoryCardGrid from "../components/catalog/SubcategoryCardGrid";
import CategoryTreeComponent from "../components/catalog/CategoryTree";
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
  const children = getChildren(tree, node.id);
  const ancestors = getAncestors(tree, node.id);
  
  // Always show tree from the level 1 ancestor when viewing products
  // This allows navigation to sibling categories at the same level
  const treeRoot = ancestors.find((a) => a.level === 1) || (node.level === 1 ? node : null);
  
  // Show tree sidebar when at level 2 or deeper (per catalogConfig.treeVisibilityStartLevel)
  const shouldShowTree = node.level >= catalogConfig.treeVisibilityStartLevel && treeRoot;

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
        const pv = Array.isArray(raw) ? raw : raw != null ? [String(raw)] : [];
        return pv.some((v) => values.includes(v));
      });
    }

    // Apply price range
    if (catalog.priceRange) {
      tabProducts = tabProducts.filter(
        (p) => p.price >= catalog.priceRange!.min && p.price <= catalog.priceRange!.max,
      );
    }

    // Apply sorting
    const sorted = [...tabProducts];
    switch (catalog.sortBy) {
      case "price-asc":  sorted.sort((a, b) => a.price - b.price); break;
      case "price-desc": sorted.sort((a, b) => b.price - a.price); break;
      case "alpha-asc":  sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "alpha-desc": sorted.sort((a, b) => b.name.localeCompare(a.name)); break;
      case "newest":     sorted.reverse(); break;
      default: break;
    }
    return sorted;
  }, [activeTab, displayItems, catalog.activeFilters, catalog.priceRange, catalog.sortBy, showCategoriesAsProducts]);

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
              maxHeight: "calc(100vh - var(--header-height) - var(--nav-height) - 48px)",
              borderRight: `1px solid ${config.borderColor}`,
            }}
          >
            <CategoryTreeComponent activeNodeId={activeTab || node.id} rootNodeId={treeRoot!.id} tree={tree} />

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
        <h1 className="text-xl font-semibold mb-2" style={{ color: config.primaryColor }}>
          Category Not Found
        </h1>
        <p className="text-sm" style={{ color: config.secondaryColor }}>
          The catalog path you requested does not exist.
        </p>
      </div>
    );
  }

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
  }

  // No children or is a leaf node - show products
  return <HybridCollectionPage slugPath={slugPath} tree={tree} categoryId={node.id} />;
}
