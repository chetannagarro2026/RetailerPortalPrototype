import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Pagination } from "antd";
import {
  RightOutlined,
  DownOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { activeBrandConfig } from "../../config/brandConfig";
import type { CatalogProduct, CatalogNode, ProductVariant } from "../../data/catalogData";
import type { CategoryTree } from "../../services/categoryService";
import { getSlugPath } from "../../services/categoryService";
import { fetchProductsByCategory } from "../../services/productService";
import FamilyRowExpansion from "./FamilyRowExpansion";
import QuickAddPanel from "./QuickAddPanel";

const TABLE_PAGE_SIZE = 20;

// Extended type to handle categories shown as products
type ProductOrCategory = CatalogProduct & {
  _isCategory?: boolean;
  _categoryNode?: CatalogNode;
};

interface HybridFamilyTableProps {
  products: ProductOrCategory[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  showCategoriesAsProducts?: boolean;
  tree?: CategoryTree;
}

export default function HybridFamilyTable({
  products,
  total,
  page,
  onPageChange,
  showCategoriesAsProducts = false,
  tree,
}: HybridFamilyTableProps) {
  const config = activeBrandConfig;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [quickAddProduct, setQuickAddProduct] = useState<CatalogProduct | null>(null);
  const [quickAddCategoryId, setQuickAddCategoryId] = useState<string | null>(null);

  // Image base URL for category products
  const IMAGE_BASE_URL = import.meta.env.VITE_PIM_IMAGE_BASE_URL || "https://ndomsdevstorageacc.blob.core.windows.net";

  // Fetch products for the selected category when showing quick add for a category
  const { data: categoryProductsResponse } = useQuery({
    queryKey: ["category-products", quickAddCategoryId],
    queryFn: () => fetchProductsByCategory(quickAddCategoryId!, 0, 9999),
    enabled: !!quickAddCategoryId && showCategoriesAsProducts,
    staleTime: 5 * 60 * 1000,
  });

  // Convert API products to variants for quick add
  const categoryProductVariants = useMemo<ProductVariant[]>(() => {
    if (!categoryProductsResponse?.content || !quickAddCategoryId) return [];
    
    return categoryProductsResponse.content.map((item): ProductVariant => ({
      id: item.id,
      sku: item.upcId,
      attributes: {
        Product: item.productName || item.familyLabels?.en || "Unknown Product",
      },
      price: 99.99,
      availabilityStatus: "in-stock",
      stockQty: 100,
    }));
  }, [categoryProductsResponse, quickAddCategoryId]);

  const handleRowClick = useCallback(
    (productId: string) => {
      setExpandedId((prev) => (prev === productId ? null : productId));
    },
    [],
  );

  const handleQuickAdd = useCallback(
    (product: ProductOrCategory) => {
      if (product._isCategory && product._categoryNode) {
        // Handle category quick add - fetch products for this category
        setQuickAddCategoryId(product._categoryNode.id);
        setQuickAddProduct(null);
      } else {
        // Handle regular product quick add
        setQuickAddProduct(product);
        setQuickAddCategoryId(null);
      }
    },
    [],
  );

  const handleClosePanel = useCallback(() => {
    setQuickAddProduct(null);
    setQuickAddCategoryId(null);
  }, []);

  if (products.length === 0) {
    return (
      <div
        className="text-center py-16 text-sm rounded-xl"
        style={{ color: config.secondaryColor, border: `1px solid ${config.borderColor}` }}
      >
        {showCategoriesAsProducts 
          ? "No subcategories found." 
          : "No product families match the current filters."}
      </div>
    );
  }

  const panelOpen = !!quickAddProduct || !!quickAddCategoryId;
  
  // Determine which product to show in quick add panel
  const quickAddDisplayProduct = useMemo(() => {
    if (quickAddProduct) return quickAddProduct;
    if (quickAddCategoryId && categoryProductVariants.length > 0) {
      // Create a virtual "family" product from category products
      const categoryNode = products.find(p => p._isCategory && p._categoryNode?.id === quickAddCategoryId)?._categoryNode;
      return {
        id: quickAddCategoryId,
        name: categoryNode?.label || "Category Products",
        sku: quickAddCategoryId,
        imageUrl: categoryNode?.heroImage || "https://via.placeholder.com/300x300?text=Category",
        price: 0,
        availabilityStatus: "in-stock" as const,
        variants: categoryProductVariants,
        variantAttributes: [
          {
            name: "Product",
            values: categoryProductVariants.map(v => v.attributes.Product),
          }
        ],
      } as CatalogProduct;
    }
    return null;
  }, [quickAddProduct, quickAddCategoryId, categoryProductVariants, products]);

  return (
    <div
      className="flex gap-0"
      style={panelOpen ? {
        height: "calc(100vh - var(--header-height) - var(--nav-height) - 48px)",
      } : undefined}
    >
      {/* Main table area */}
      <div
        className="flex-1 min-w-0"
        style={panelOpen ? { overflow: "auto" } : undefined}
      >
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: `1px solid ${config.borderColor}`, minWidth: 580 }}
        >
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr style={{ backgroundColor: config.cardBg }}>
                <th className="w-8 px-3 py-2.5" style={{ borderBottom: `2px solid ${config.borderColor}` }} />
                <th
                  className="text-left px-3 py-2.5 font-semibold"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
                >
                  Image
                </th>
                <th
                  className="text-left px-3 py-2.5 font-semibold"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
                >
                  {showCategoriesAsProducts ? "Category Name" : "Family Name"}
                </th>
                <th
                  className="text-left px-3 py-2.5 font-semibold"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
                >
                  {showCategoriesAsProducts ? "Description" : "Brand"}
                </th>
                <th
                  className="text-left px-3 py-2.5 font-semibold"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
                >
                  {showCategoriesAsProducts ? "Product Count" : "Key Attributes"}
                </th>
                <th
                  className="text-right px-3 py-2.5 font-semibold"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
                >
                  {showCategoriesAsProducts ? "" : "Price Range"}
                </th>
                <th
                  className="text-center px-3 py-2.5 font-semibold"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
                >
                  {showCategoriesAsProducts ? "" : "SKUs"}
                </th>
                <th
                  className="text-center px-3 py-2.5 font-semibold"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isExpanded = expandedId === product.id;
                const isCategory = product._isCategory;
                
                return isCategory ? (
                  <CategoryRow
                    key={product.id}
                    category={product}
                    onQuickAdd={handleQuickAdd}
                    tree={tree}
                  />
                ) : (
                  <FamilyRow
                    key={product.id}
                    product={product}
                    isExpanded={isExpanded}
                    onRowClick={handleRowClick}
                    onQuickAdd={handleQuickAdd}
                  />
                );
              })}
            </tbody>
          </table>
        </div>

        {total > TABLE_PAGE_SIZE && (
          <div className="flex justify-center mt-6">
            <Pagination
              current={page}
              total={total}
              pageSize={TABLE_PAGE_SIZE}
              onChange={onPageChange}
              showSizeChanger={false}
              size="small"
            />
          </div>
        )}
      </div>

      {/* Quick Add Panel — in-flow, scrolls independently */}
      {quickAddDisplayProduct && (
        <div
          className="shrink-0 ml-4 flex flex-col shadow-lg rounded-xl overflow-hidden"
          style={{
            width: 400,
            height: "100%",
            border: `1px solid ${config.borderColor}`,
            backgroundColor: "#fff",
          }}
        >
          <QuickAddPanel
            key={quickAddDisplayProduct.id}
            product={quickAddDisplayProduct}
            familyLink={`/product/${quickAddDisplayProduct.id}`}
            onClose={handleClosePanel}
          />
        </div>
      )}
    </div>
  );
}

// ── Family Row ──────────────────────────────────────────────────────

function FamilyRow({
  product,
  isExpanded,
  onRowClick,
  onQuickAdd,
}: {
  product: CatalogProduct;
  isExpanded: boolean;
  onRowClick: (id: string) => void;
  onQuickAdd: (product: CatalogProduct) => void;
}) {
  const config = activeBrandConfig;
  const familyLink = `/product/${product.id}`;

  const { priceRange, skuCount, attrSummary } = useMemo(
    () => computeFamilyMeta(product),
    [product],
  );

  return (
    <>
      {/* Main Row */}
      <tr
        className="cursor-pointer transition-colors"
        onClick={() => onRowClick(product.id)}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = config.cardBg;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isExpanded ? config.cardBg : "transparent";
        }}
        style={{ backgroundColor: isExpanded ? config.cardBg : "transparent" }}
      >
        {/* Chevron */}
        <td
          className="px-3 py-3 text-center"
          style={{ borderBottom: isExpanded ? "none" : `1px solid ${config.borderColor}` }}
        >
          {isExpanded ? (
            <DownOutlined className="text-[9px]" style={{ color: config.secondaryColor }} />
          ) : (
            <RightOutlined className="text-[9px]" style={{ color: config.secondaryColor }} />
          )}
        </td>

        {/* Image */}
        <td
          className="px-3 py-2"
          style={{ borderBottom: isExpanded ? "none" : `1px solid ${config.borderColor}` }}
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-10 h-10 object-cover rounded-md"
          />
        </td>

        {/* Family Name */}
        <td
          className="px-3 py-2"
          style={{ borderBottom: isExpanded ? "none" : `1px solid ${config.borderColor}` }}
        >
          <Link
            to={familyLink}
            className="text-xs font-medium no-underline hover:underline"
            style={{ color: config.primaryColor }}
            onClick={(e) => e.stopPropagation()}
          >
            {product.name}
          </Link>
          <div className="text-[10px] font-mono mt-0.5" style={{ color: config.secondaryColor }}>
            {product.sku}
          </div>
        </td>

        {/* Brand */}
        <td
          className="px-3 py-2 text-[11px]"
          style={{ color: config.secondaryColor, borderBottom: isExpanded ? "none" : `1px solid ${config.borderColor}` }}
        >
          {product.brand || "—"}
        </td>

        {/* Key Attributes */}
        <td
          className="px-3 py-2 text-[11px]"
          style={{ color: config.secondaryColor, borderBottom: isExpanded ? "none" : `1px solid ${config.borderColor}` }}
        >
          {attrSummary}
        </td>

        {/* Price Range */}
        <td
          className="px-3 py-2 text-right text-[11px] font-medium whitespace-nowrap"
          style={{ color: config.primaryColor, borderBottom: isExpanded ? "none" : `1px solid ${config.borderColor}` }}
        >
          {priceRange}
        </td>

        {/* SKU Count */}
        <td
          className="px-3 py-2 text-center"
          style={{ borderBottom: isExpanded ? "none" : `1px solid ${config.borderColor}` }}
        >
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: config.cardBg, color: config.primaryColor }}
          >
            {skuCount}
          </span>
        </td>

        {/* Actions */}
        <td
          className="px-3 py-2 text-center"
          style={{ borderBottom: isExpanded ? "none" : `1px solid ${config.borderColor}` }}
        >
          {!isExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(product);
              }}
              className="inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-md cursor-pointer transition-colors"
              style={{
                backgroundColor: config.primaryColor,
                color: "#fff",
                border: "none",
              }}
            >
              <ShoppingCartOutlined className="text-[9px]" />
              Quick Add
            </button>
          )}
        </td>
      </tr>

      {/* Expansion Row */}
      {isExpanded && (
        <tr>
          <td
            colSpan={8}
            className="p-0"
            style={{ borderBottom: `1px solid ${config.borderColor}` }}
          >
            <FamilyRowExpansion
              product={product}
              familyLink={familyLink}
              onQuickAdd={() => onQuickAdd(product)}
            />
          </td>
        </tr>
      )}
    </>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────

function computeFamilyMeta(product: CatalogProduct) {
  const variants = product.variants || [];
  const skuCount = variants.length;

  // Price range from variants
  let minPrice = Infinity;
  let maxPrice = -Infinity;
  for (const v of variants) {
    if (v.price < minPrice) minPrice = v.price;
    if (v.price > maxPrice) maxPrice = v.price;
  }

  let priceRange: string;
  if (skuCount === 0) {
    priceRange = `$${product.price.toFixed(2)}`;
  } else if (minPrice === maxPrice) {
    priceRange = `$${minPrice.toFixed(2)}`;
  } else {
    priceRange = `$${minPrice.toFixed(2)} – $${maxPrice.toFixed(2)}`;
  }

  // Key attribute summary from variantAttributes (dynamic, industry-neutral)
  const parts: string[] = [];
  if (product.variantAttributes) {
    for (const attr of product.variantAttributes) {
      const uniqueCount = attr.values.length;
      parts.push(`${uniqueCount} ${attr.name}${uniqueCount !== 1 ? "s" : ""}`);
    }
  }
  const attrSummary = parts.length > 0 ? parts.join(" · ") : "—";

  return { priceRange, skuCount, attrSummary };
}

// ── Category Row ────────────────────────────────────────────────────

function CategoryRow({
  category,
  onQuickAdd,
  tree,
}: {
  category: ProductOrCategory;
  onQuickAdd: (category: ProductOrCategory) => void;
  tree?: CategoryTree;
}) {
  const config = activeBrandConfig;
  const categoryNode = category._categoryNode!;
  
  // Build proper slug path using the tree
  const slugPath = tree ? getSlugPath(tree, categoryNode.id) : [categoryNode.slug];
  const categoryLink = `/catalog/${slugPath.join("/")}`;

  return (
    <>
      <tr
        className="cursor-pointer transition-colors hover:bg-opacity-50"
        style={{
          borderBottom: `1px solid ${config.borderColor}`,
          backgroundColor: "transparent",
        }}
      >
        {/* Expand toggle - empty for categories */}
        <td className="px-3 py-3" />

        {/* Image */}
        <td className="px-3 py-3">
          <img
            src={category.imageUrl}
            alt={category.name}
            className="w-12 h-12 object-cover rounded"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/48x48?text=Cat";
            }}
          />
        </td>

        {/* Category Name */}
        <td className="px-3 py-3">
          <Link
            to={categoryLink}
            className="font-medium hover:underline"
            style={{ color: config.primaryColor }}
          >
            {category.name}
          </Link>
        </td>

        {/* Description */}
        <td className="px-3 py-3" style={{ color: config.secondaryColor }}>
          {categoryNode.description || "—"}
        </td>

        {/* Product Count */}
        <td className="px-3 py-3 text-center" style={{ color: config.secondaryColor }}>
          {categoryNode.productCount || 0} products
        </td>

        {/* Empty columns for alignment */}
        <td className="px-3 py-3" />
        <td className="px-3 py-3" />

        {/* Actions */}
        <td className="px-3 py-3 text-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd(category);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={{
              color: "#fff",
              backgroundColor: config.primaryColor,
            }}
          >
            <ShoppingCartOutlined className="text-sm" />
            Quick Add
          </button>
        </td>
      </tr>
    </>
  );
}
