import { useState, useMemo, useCallback } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Spin } from "antd";
import { activeBrandConfig } from "../config/brandConfig";
import { apiConfig } from "../config/apiConfig";
import { useAuth } from "../context/AuthContext";
import {
  catalogConfig,
  getAllProductsForNode,
} from "../data/catalogData";
import { 
  type CategoryTree as CategoryTreeType,
} from "../services/categoryService";
import { useCategoryContext, type EnrichedCategoryTree } from "../context/CategoryContext";
import { fetchProductsByCategory, fetchBestPrices, type PriceRequestItem } from "../services/productService";
import { fetchCategoryByCode, type CategoryItem } from "../services/categoryService";
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
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════

type CatalogMode = "category" | "brand";

interface CatalogModeInfo {
  mode: CatalogMode;
  brandCode?: string;
}

function useCatalogMode(slugPath: string[]): CatalogModeInfo {
  const [searchParams] = useSearchParams();
  const brandCode = searchParams.get("brand");

  if (slugPath.length > 0) {
    return { mode: "category" };
  }

  if (brandCode) {
    return {
      mode: "brand",
      brandCode,
    };
  }

  return { mode: "category" };
}

// ═══════════════════════════════════════════════════════════════════
// GLOBAL BRAND PAGE
// ═══════════════════════════════════════════════════════════════════

function GlobalBrandPage({ brandCode }: { brandCode: string }) {
  const config = activeBrandConfig;
  const { user, isAuthenticated } = useAuth();
  const { tree } = useCategoryContext();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Fetch brand details
  const { data: brandData, isLoading: brandLoading, error: brandError } = useQuery({
    queryKey: ["brand", brandCode],
    queryFn: () => fetchCategoryByCode(brandCode),
    staleTime: 10 * 60 * 1000,
  });

  // Determine which category to fetch products for
  const categoryIdToFetch = selectedCategoryId || brandData?.id;

  // Fetch products for brand or selected category
  const { data: productsResponse, isLoading: productsLoading } = useQuery({
    queryKey: ["productsByCategory", categoryIdToFetch, isAuthenticated],
    queryFn: () => {
      if (!categoryIdToFetch) throw new Error("Category ID not available");
      return fetchProductsByCategory(categoryIdToFetch);
    },
    enabled: !!categoryIdToFetch,
    staleTime: 5 * 60 * 1000,
  });

  // Get UPCs from products for price fetching
  const productUpcs = useMemo(() => {
    if (!productsResponse?.content) return [];
    return productsResponse.content.map((item) => item.upcId).filter(Boolean);
  }, [productsResponse]);

  // Fetch prices for the products
  const { data: pricesResponse, isLoading: pricesLoading } = useQuery({
    queryKey: ["bestPrices", productUpcs, isAuthenticated],
    queryFn: () => {
      const payload: PriceRequestItem[] = productUpcs.map((upc) => {
        const item: PriceRequestItem = {
          upc,
          channelCode: apiConfig.priceChannelCode,
        };
        if (isAuthenticated && user?.accountId) {
          item.accoundId = parseInt(user.accountId, 10);
        }
        return item;
      });
      return fetchBestPrices(payload);
    },
    enabled: productUpcs.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const priceMap = pricesResponse?.productPrice ?? {};

  // Convert API products to display format with prices
  const apiProducts = useMemo(() => {
    if (!productsResponse?.content) return [];

    return productsResponse.content.map((item) => {
      const priceInfo = priceMap[item.upcId];
      return {
        id: item.id,
        name: item.name || "Unknown Product",
        upc: item.upcId,
        imageUrl: item.imageIconPath
          ? `${IMAGE_BASE_URL}${item.imageIconPath}`
          : "https://via.placeholder.com/300x300?text=No+Image",
        price: priceInfo ? Number(priceInfo.listPrice) : 0,
        originalPrice: priceInfo ? Number(priceInfo.basePrice) : undefined,
        availabilityStatus: "in-stock" as const,
        brand: undefined,
      };
    });
  }, [productsResponse, priceMap]);

  const [viewMode, setViewMode] = useState<CollectionViewMode>("table");
  const [tablePage, setTablePage] = useState(1);

  const handleCategoryClick = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setTablePage(1);
  }, []);

  const PAGE_SIZE = 20;
  const paginatedProducts = useMemo(() => {
    const start = (tablePage - 1) * PAGE_SIZE;
    return apiProducts.slice(start, start + PAGE_SIZE);
  }, [apiProducts, tablePage]);

  // Helper to get selected category data
  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId || !tree) return null;
    return tree.nodes.get(selectedCategoryId) || null;
  }, [selectedCategoryId, tree]);

  // Show initial loading state with layout structure to prevent width shift
  if (brandLoading || (!brandData && !brandError)) {
    return (
      <div className="max-w-content-wide mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Left Sidebar: Placeholder */}
          {tree && (
            <aside
              className="shrink-0 pr-4"
              style={{
                width: 240,
                borderRight: `1px solid ${config.borderColor}`,
              }}
            >
              {/* Empty sidebar space */}
            </aside>
          )}
          
          {/* Right: Loading Content */}
          <div className="flex-1 min-w-0 flex justify-center items-center" style={{ minHeight: "500px" }}>
            <Spin size="large" />
          </div>
        </div>
      </div>
    );
  }

  if (brandError || !brandData) {
    return (
      <div className="max-w-content-wide mx-auto px-6 py-12 text-center">
        <h1 className="text-xl font-semibold mb-2" style={{ color: config.primaryColor }}>
          Brand Not Found
        </h1>
        <p className="text-sm mb-4" style={{ color: config.secondaryColor }}>
          The brand you requested does not exist.
        </p>
        <Link to="/" className="text-sm font-medium no-underline" style={{ color: config.primaryColor }}>
          &larr; Back to Home
        </Link>
      </div>
    );
  }

  const brandName = brandData.labels?.en || brandData.name;
  const productCount = brandData.productIds?.length || 0;

  return (
    <div className="max-w-content-wide mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 flex-wrap mb-4">
        <Link
          to="/"
          className="text-xs no-underline transition-colors hover:underline"
          style={{ color: config.secondaryColor }}
        >
          Home
        </Link>
        <span className="text-[8px]" style={{ color: config.secondaryColor }}>
          ›
        </span>
        <Link
          to="/catalog"
          className="text-xs no-underline transition-colors hover:underline"
          style={{ color: config.secondaryColor }}
        >
          Catalog
        </Link>
        <span className="text-[8px]" style={{ color: config.secondaryColor }}>
          ›
        </span>
        <span className="text-xs font-medium" style={{ color: config.primaryColor }}>
          {brandName}
        </span>
      </nav>

      {/* Brand header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold mb-0.5" style={{ color: config.primaryColor }}>
            {selectedCategory ? selectedCategory.label : brandName}
          </h1>
          <p className="text-xs" style={{ color: config.secondaryColor }}>
            {apiProducts.length.toLocaleString()} {apiProducts.length === 1 ? "Product" : "Products"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedCategoryId && (
            <button
              onClick={() => setSelectedCategoryId(null)}
              className="text-xs no-underline px-3 py-1.5 rounded-md transition-colors"
              style={{
                color: config.secondaryColor,
                border: `1px solid ${config.borderColor}`,
                background: "white",
                cursor: "pointer"
              }}
            >
              View all brand products
            </button>
          )}
          <Link
            to="/"
            className="text-xs no-underline px-3 py-1.5 rounded-md transition-colors"
            style={{
              color: config.secondaryColor,
              border: `1px solid ${config.borderColor}`,
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left Sidebar: Category Tree */}
        {tree && (
          <aside
            className="shrink-0 sticky self-start overflow-y-auto pr-4"
            style={{
              width: 240,
              top: "calc(var(--header-height) + var(--nav-height) + 24px)",
              maxHeight: "calc(100vh - var(--header-height) - var(--nav-height) - 48px)",
              borderRight: `1px solid ${config.borderColor}`,
            }}
          >
            <CategoryTreeComponent 
              activeNodeId={selectedCategoryId || ""} 
              rootNodeId="root" 
              tree={tree} 
              disableNavigation 
              onCategoryClick={handleCategoryClick}
            />
          </aside>
        )}

        {/* Right: Content */}
        <div className="flex-1 min-w-0">
          {/* View mode toggle */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs" style={{ color: config.secondaryColor }}>
              Showing {apiProducts.length.toLocaleString()} products
            </p>
            <div className="flex items-center gap-3">
              <div
                className="flex rounded-lg overflow-hidden"
                style={{ border: `1px solid ${config.borderColor}` }}
              >
                {(["table", "grid"] as const).map((key, i) => (
                  <button
                    key={key}
                    onClick={() => setViewMode(key)}
                    className="px-2.5 py-1 text-[11px] font-medium cursor-pointer transition-colors"
                    style={{
                      backgroundColor: viewMode === key ? config.primaryColor : "#fff",
                      color: viewMode === key ? "#fff" : config.secondaryColor,
                      border: "none",
                      borderLeft: i > 0 ? `1px solid ${config.borderColor}` : "none",
                    }}
                  >
                    {key === "table" ? "Table" : "Grid"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Loading state */}
          {productsLoading || pricesLoading ? (
            <div className="flex justify-center items-center" style={{ minHeight: "500px" }}>
              <Spin size="large" />
            </div>
          ) : apiProducts.length === 0 ? (
            <div
              className="rounded-xl flex items-center justify-center"
              style={{ 
                border: `1px dashed ${config.borderColor}`, 
                backgroundColor: config.cardBg,
                minHeight: "500px"
              }}
            >
              <span className="text-sm" style={{ color: config.secondaryColor }}>
                No products found.
              </span>
            </div>
          ) : (
            /* Content: Table or Grid */
            <>
              {viewMode === "table" ? (
                <HybridFamilyTable
                  products={paginatedProducts}
                  total={apiProducts.length}
                  page={tablePage}
                  onPageChange={setTablePage}
                />
              ) : (
                <FamilyCardGrid
                  products={paginatedProducts}
                  total={apiProducts.length}
                  page={tablePage}
                  onPageChange={setTablePage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// HYBRID COLLECTION PAGE (Any node with products — N-level scalable)
// ═══════════════════════════════════════════════════════════════════

// Image base URL configuration
const IMAGE_BASE_URL = import.meta.env.VITE_PIM_IMAGE_BASE_URL || "https://ndomsdevstorageacc.blob.core.windows.net";

function HybridCollectionPage({ 
  slugPath, 
  tree,
  categoryId,
}: { 
  slugPath: string[];
  tree: EnrichedCategoryTree;
  categoryId: string;
}) {
  const config = activeBrandConfig;
  const { user, isAuthenticated } = useAuth();
  const { getNodeBySlugPath, getChildren, getAncestors } = useCategoryContext();
  const node = getNodeBySlugPath(slugPath)!;
  const nodeId = node.id;

  // Fetch products from API for this category
  const { data: productsResponse, isLoading: productsLoading } = useQuery({
    queryKey: ["products", categoryId],
    queryFn: () => fetchProductsByCategory(categoryId, 0, 9999),
    staleTime: 5 * 60 * 1000,
  });

  // Get UPCs from products for price fetching
  const productUpcs = useMemo(() => {
    if (!productsResponse?.content) return [];
    return productsResponse.content.map((item) => item.upcId).filter(Boolean);
  }, [productsResponse]);

  // Fetch prices for the products
  const { data: pricesResponse, isLoading: pricesLoading } = useQuery({
    queryKey: ["bestPrices", productUpcs, isAuthenticated],
    queryFn: () => {
      const payload: PriceRequestItem[] = productUpcs.map((upc) => {
        const item: PriceRequestItem = {
          upc,
          channelCode: apiConfig.priceChannelCode,
        };
        // Only include accoundId if user is authenticated
        if (isAuthenticated && user?.accountId) {
          item.accoundId = parseInt(user.accountId, 10);
        }
        return item;
      });
      return fetchBestPrices(payload);
    },
    enabled: productUpcs.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const priceMap = pricesResponse?.productPrice ?? {};

  // Convert API products to CatalogProduct format with prices
  const apiProducts = useMemo(() => {
    if (!productsResponse?.content) return [];
    
    return productsResponse.content.map((item) => {
      const priceInfo = priceMap[item.upcId];
      return {
        id: item.id,
        name: item.name || "Unknown Product",
        upc: item.upcId,
        imageUrl: item.imageIconPath 
          ? `${IMAGE_BASE_URL}${item.imageIconPath}`
          : "https://via.placeholder.com/300x300?text=No+Image",
        price: priceInfo ? Number(priceInfo.listPrice) : 0,
        originalPrice: priceInfo ? Number(priceInfo.basePrice) : undefined,
        availabilityStatus: "in-stock" as const,
        brand: undefined,
      };
    });
  }, [productsResponse, priceMap]);

  const catalog = useCatalogState(nodeId, 9999, node.filtersAvailable);
  const children = getChildren(node.id);
  const ancestors = getAncestors(node.id);
  
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

  // Apply sorting to products
  const sortProducts = useCallback((productsToSort: typeof products) => {
    const sorted = [...productsToSort];
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
      case "relevance":
      default:
        // relevance = original API order, no sorting needed
        break;
    }
    return sorted;
  }, [catalog.sortBy]);

  // When a tab is active, load that child node's products directly
  // and apply the same filters/sorting from the parent catalog state
  const displayProducts = useMemo(() => {
    if (!activeTab) {
      // Apply sorting to main products
      return sortProducts(products);
    }

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
    return sortProducts(tabProducts);
  }, [activeTab, products, sortProducts, catalog.activeFilters, catalog.priceRange]);

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
      <div className="max-w-content-wide mx-auto px-6 py-8">
        <CatalogBreadcrumb node={node} tree={tree} />
        
        <div className="flex gap-6">
          {/* Left Sidebar: Placeholder */}
          {shouldShowTree && (
            <aside
              className="shrink-0 pr-4"
              style={{
                width: 240,
                borderRight: `1px solid ${config.borderColor}`,
              }}
            >
              {/* Empty sidebar space */}
            </aside>
          )}
          
          {/* Right: Loading Content */}
          <div className="flex-1 min-w-0 flex justify-center items-center" style={{ minHeight: "500px" }}>
            <Spin size="large" />
          </div>
        </div>
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

          <ActiveFilterChips
            activeFilters={catalog.activeFilters}
            priceRange={catalog.priceRange}
            onRemoveValue={catalog.removeFilterValue}
            onRemoveFilter={catalog.removeFilter}
            onClearAll={catalog.clearAllFilters}
            onClearPriceRange={() => catalog.setPriceRange(null)}
          />

          {children.length > 0 && (
            <SubcategoryTabs
              children={children}
              activeTabId={activeTab}
              onTabChange={handleTabChange}
            />
          )}

          {viewMode === "table" ? (
            <HybridFamilyTable
              products={paginatedProducts}
              total={displayProducts.length}
              page={tablePage}
              onPageChange={setTablePage}
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
  const modeInfo = useCatalogMode(slugPath);

  // Brand mode — show brand products
  if (modeInfo.mode === "brand" && modeInfo.brandCode) {
    return <GlobalBrandPage brandCode={modeInfo.brandCode} />;
  }

  // Category mode — use category context
  const { tree, isLoading, error, getNodeBySlugPath, getChildren } = useCategoryContext();
  
  // Find the current node from the tree
  const node = tree ? getNodeBySlugPath(slugPath) : null;

  // Show loading state while fetching categories
  if (isLoading) {
    return (
      <div className="max-w-content-wide mx-auto px-6 py-12 flex justify-center items-center" style={{ minHeight: "500px" }}>
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

  // If node has children, show subcategory cards for navigation
  if (node.hasChildren) {
    const children = getChildren(node.id);
    
    if (children.length > 0) {
      // Show card view for navigation - users can click to see products
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
    }
  }

  // No children or is a leaf node - show products
  return <HybridCollectionPage slugPath={slugPath} tree={tree} categoryId={node.id} />;
}
