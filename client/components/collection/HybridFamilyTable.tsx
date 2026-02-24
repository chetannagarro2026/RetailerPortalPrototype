import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Pagination } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import type { CatalogProduct } from "../../data/catalogData";
import type { CategoryTree } from "../../services/categoryService";
import QuickAddPanel from "./QuickAddPanel";

const TABLE_PAGE_SIZE = 20;

interface HybridFamilyTableProps {
  products: CatalogProduct[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  tree?: CategoryTree;
}

export default function HybridFamilyTable({
  products,
  total,
  page,
  onPageChange,
}: HybridFamilyTableProps) {
  const config = activeBrandConfig;
  const [quickAddProduct, setQuickAddProduct] = useState<CatalogProduct | null>(null);

  const handleQuickAdd = useCallback((product: CatalogProduct) => {
    setQuickAddProduct(product);
  }, []);

  const handleClosePanel = useCallback(() => {
    setQuickAddProduct(null);
  }, []);

  if (products.length === 0) {
    return (
      <div
        className="text-center py-16 text-sm rounded-xl"
        style={{ color: config.secondaryColor, border: `1px solid ${config.borderColor}` }}
      >
        No products match the current filters.
      </div>
    );
  }

  const panelOpen = !!quickAddProduct;

  return (
    <div
      className="flex gap-0"
      style={panelOpen ? {
        height: "calc(100vh - var(--header-height) - var(--nav-height) - 200px)",
      } : undefined}
    >
      {/* Main table area */}
      <div
        className="flex-1 min-w-0"
        style={panelOpen ? { overflow: "auto" } : undefined}
      >
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: `1px solid ${config.borderColor}`, minWidth: 500 }}
        >
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr style={{ backgroundColor: config.cardBg }}>
                <th
                  className="text-left px-4 py-3 font-semibold"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
                >
                  Image
                </th>
                <th
                  className="text-left px-4 py-3 font-semibold"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
                >
                  Product Name
                </th>
                <th
                  className="text-left px-4 py-3 font-semibold"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
                >
                  UPC
                </th>
                <th
                  className="text-right px-4 py-3 font-semibold"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
                >
                  Price
                </th>
                <th
                  className="text-center px-4 py-3 font-semibold"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
                >
                  Stock
                </th>
                <th
                  className="text-center px-4 py-3 font-semibold"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  isSelected={quickAddProduct?.id === product.id}
                  onQuickAdd={handleQuickAdd}
                />
              ))}
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
      {quickAddProduct && (
        <div
          className="shrink-0 ml-4 flex flex-col shadow-lg rounded-xl overflow-hidden"
          style={{
            width: 420,
            height: "100%",
            border: `1px solid ${config.borderColor}`,
            backgroundColor: "#fff",
          }}
        >
          <QuickAddPanel
            key={quickAddProduct.id}
            product={quickAddProduct}
            familyLink={`/product/${quickAddProduct.upc}`}
            onClose={handleClosePanel}
          />
        </div>
      )}
    </div>
  );
}

// ── Product Row ─────────────────────────────────────────────────────

function ProductRow({
  product,
  isSelected,
  onQuickAdd,
}: {
  product: CatalogProduct;
  isSelected: boolean;
  onQuickAdd: (product: CatalogProduct) => void;
}) {
  const config = activeBrandConfig;
  const productLink = `/product/${product.upc}`;

  const stockStatus = product.availabilityStatus || "in-stock";
  const stockLabel = stockStatus === "in-stock" ? "In Stock" : 
                     stockStatus === "low-stock" ? "Low Stock" : 
                     stockStatus === "out-of-stock" ? "Out of Stock" : "Pre-Order";
  const stockColor = stockStatus === "in-stock" ? "#16A34A" : 
                     stockStatus === "low-stock" ? "#D97706" : 
                     stockStatus === "out-of-stock" ? "#DC2626" : "#7C3AED";

  return (
    <tr
      className="transition-colors"
      style={{
        backgroundColor: isSelected ? config.cardBg : "transparent",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = config.cardBg;
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {/* Image */}
      <td
        className="px-4 py-3"
        style={{ borderBottom: `1px solid ${config.borderColor}` }}
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-12 h-12 object-cover rounded-lg"
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/48x48?text=No+Img";
          }}
        />
      </td>

      {/* Product Name */}
      <td
        className="px-4 py-3"
        style={{ borderBottom: `1px solid ${config.borderColor}` }}
      >
        <Link
          to={productLink}
          className="text-sm font-medium no-underline hover:underline block"
          style={{ color: config.primaryColor }}
        >
          {product.name}
        </Link>
        {product.brand && (
          <div className="text-[10px] mt-0.5" style={{ color: config.secondaryColor }}>
            {product.brand}
          </div>
        )}
      </td>

      {/* UPC */}
      <td
        className="px-4 py-3"
        style={{ borderBottom: `1px solid ${config.borderColor}` }}
      >
        <span className="text-[11px] font-mono" style={{ color: config.secondaryColor }}>
          {product.upc}
        </span>
      </td>

      {/* Price */}
      <td
        className="px-4 py-3 text-right"
        style={{ borderBottom: `1px solid ${config.borderColor}` }}
      >
        <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
          ${product.price.toFixed(2)}
        </span>
        {product.originalPrice && product.originalPrice > product.price && (
          <span className="text-[10px] line-through ml-1.5" style={{ color: config.secondaryColor }}>
            ${product.originalPrice.toFixed(2)}
          </span>
        )}
      </td>

      {/* Stock Status */}
      <td
        className="px-4 py-3 text-center"
        style={{ borderBottom: `1px solid ${config.borderColor}` }}
      >
        <span
          className="text-[10px] font-semibold px-2 py-1 rounded-full"
          style={{
            backgroundColor: `${stockColor}15`,
            color: stockColor,
          }}
        >
          {stockLabel}
        </span>
      </td>

      {/* Actions */}
      <td
        className="px-4 py-3 text-center"
        style={{ borderBottom: `1px solid ${config.borderColor}` }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickAdd(product);
          }}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-all"
          style={{
            backgroundColor: isSelected ? "#fff" : config.primaryColor,
            color: isSelected ? config.primaryColor : "#fff",
            border: isSelected ? `1px solid ${config.primaryColor}` : "none",
          }}
        >
          <ShoppingCartOutlined className="text-xs" />
          {isSelected ? "Selected" : "Quick Add"}
        </button>
      </td>
    </tr>
  );
}
