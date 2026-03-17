import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Pagination, Tooltip } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { activeBrandConfig, formatPrice } from "../../config/brandConfig";
import type { CatalogProduct } from "../../data/catalogData";
import type { CategoryTree } from "../../services/categoryService";
import QuickAddPanel from "./QuickAddPanel";
import { useAuth } from "@/context/AuthContext";

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
  const { isAuthenticated } = useAuth();
  const [quickAddProduct, setQuickAddProduct] = useState<CatalogProduct | null>(null);

  const handleQuickAdd = useCallback((product: CatalogProduct) => {
    // Toggle: close panel if same product is clicked again, otherwise open with new product
    setQuickAddProduct((current) => 
      current?.id === product.id ? null : product
    );
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
        maxWidth: "100%",
        overflowX: "auto",
      } : undefined}
    >
      {/* Main table area */}
      <div
        className="flex-1 min-w-0"
        style={panelOpen ? { overflow: "auto", minWidth: 540 } : undefined}
      >
        <div
          className="rounded-xl overflow-auto"
          style={{ border: `1px solid ${config.borderColor}`, minWidth: panelOpen ? 540 : 800 }}
        >
          <table className="w-full border-collapse text-xs" style={{ tableLayout: "fixed", overflowX: "scroll" }}>
            <thead>
              <tr style={{ backgroundColor: config.cardBg }}>
                <th
                  className="text-left px-4 py-3 font-semibold"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}`, width: "80px" }}
                >
                  Image
                </th>
                <th
                  className="text-left px-4 py-3 font-semibold"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}`, width: "140px" }}
                >
                  Product Name
                </th>
                <th
                  className="text-left px-4 py-3 font-semibold"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}`, width: "100px" }}
                >
                  UPC
                </th>
                <th
                  className="text-right px-4 py-3 font-semibold"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}`, width: "120px" }}
                >
                  {isAuthenticated ? "Special Price" : "Price"}
                </th>
                {isAuthenticated && (
                  <th
                    className="text-right px-4 py-3 font-semibold"
                    style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}`, width: "100px" }}
                  >
                    Savings
                  </th>
                )}
                <th
                  className="text-center px-4 py-3 font-semibold"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}`, width: "100px" }}
                >
                  Stock
                </th>
                <th
                  className="text-center px-4 py-3 font-semibold"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}`, width: "120px" }}
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
                  isAuthenticated={isAuthenticated}
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
            maxWidth: "370px",
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
  isAuthenticated,
  onQuickAdd,
}: {
  product: CatalogProduct;
  isSelected: boolean;
  isAuthenticated: boolean;
  onQuickAdd: (product: CatalogProduct) => void;
}) {
  const config = activeBrandConfig;
  const productLink = `/product/${product.upc}`;

  const { showSignInModal } = useAuth();

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
          className="w-12 h-12 object-contain rounded-lg"
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/48x48?text=No+Img";
          }}
        />
      </td>

      {/* Product Name */}
      <td
        className="px-4 py-3"
        style={{ borderBottom: `1px solid ${config.borderColor}`, maxWidth: "300px", wordBreak: "break-word" }}
      >
        <Tooltip title={product.name} placement="topLeft">
          <Link
            to={productLink}
            className="text-sm font-medium no-underline hover:underline block line-clamp-2"
            style={{ color: config.primaryColor }}
          >
            {product.name}
          </Link>
        </Tooltip>
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
        <div className="flex items-center justify-end whitespace-nowrap gap-1.5">
          <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
            {isAuthenticated 
              ? formatPrice(product.price)
              : formatPrice(product.originalPrice || product.price)
            }
          </span>
          {isAuthenticated && product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[10px] line-through" style={{ color: config.secondaryColor }}>
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
        {!isAuthenticated && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                showSignInModal("Sign in to view Special Price and promotions.");
              }}
              className="text-[9px] mt-0.5 cursor-pointer bg-transparent border-none p-0 underline w-full text-right"
              style={{ color: "#2563EB" }}
            >
              Login to view Special Price
            </button>
          )}
      </td>

      {/* Savings */}
      {isAuthenticated && (
        <td
          className="px-4 py-3 text-right"
          style={{ borderBottom: `1px solid ${config.borderColor}` }}
        >
          {product.originalPrice && product.originalPrice > product.price ? (
            <div className="flex items-center justify-end whitespace-nowrap">
              <span className="text-sm font-semibold" style={{ color: "#16A34A" }}>
                {formatPrice(product.originalPrice - product.price)}
              </span>
              <span
                className="text-sm font-semibold ml-1"
                style={{ color: "#16A34A" }}
              >
                ({Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%)
              </span>
            </div>
          ) : (
            <span className="text-[10px]" style={{ color: config.secondaryColor }}>
              —
            </span>
          )}
        </td>
      )}

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
