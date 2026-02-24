import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Pagination } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import type { CatalogProduct } from "../../data/catalogData";
import QuickAddPanel from "./QuickAddPanel";

const PAGE_SIZE = 20;

interface FamilyCardGridProps {
  products: CatalogProduct[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
}

export default function FamilyCardGrid({
  products,
  total,
  page,
  onPageChange,
}: FamilyCardGridProps) {
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
      className="flex gap-4"
      style={panelOpen ? {
        height: "calc(100vh - var(--header-height) - var(--nav-height) - 200px)",
      } : undefined}
    >
      {/* Grid area */}
      <div
        className="flex-1 min-w-0"
        style={panelOpen ? { overflow: "auto" } : undefined}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSelected={quickAddProduct?.id === product.id}
              onQuickAdd={handleQuickAdd}
            />
          ))}
        </div>

        {total > PAGE_SIZE && (
          <div className="flex justify-center mt-8">
            <Pagination
              current={page}
              total={total}
              pageSize={PAGE_SIZE}
              onChange={onPageChange}
              showSizeChanger={false}
              size="small"
            />
          </div>
        )}
      </div>

      {/* Quick Add Panel */}
      {quickAddProduct && (
        <div
          className="shrink-0 flex flex-col shadow-lg rounded-xl overflow-hidden"
          style={{
            width: 380,
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

// ── Product Card ────────────────────────────────────────────────────

function ProductCard({
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
    <div
      className="group rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg flex flex-col"
      style={{
        border: isSelected ? `2px solid ${config.primaryColor}` : `1px solid ${config.borderColor}`,
        backgroundColor: "#fff",
      }}
    >
      {/* Image */}
      <Link to={productLink} className="block relative w-full overflow-hidden" style={{ aspectRatio: "1/1" }}>
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/300x300?text=No+Image";
          }}
        />
        {/* Stock Badge */}
        <span
          className="absolute top-2 right-2 text-[9px] font-semibold px-2 py-1 rounded-full"
          style={{
            backgroundColor: `${stockColor}e6`,
            color: "#fff",
          }}
        >
          {stockLabel}
        </span>
        {/* Badges */}
        {product.badges && product.badges.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.badges.map((b) => (
              <span
                key={b.label}
                className="text-[9px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full"
                style={{ backgroundColor: b.bg || "#EEF2FF", color: b.color || "#4338CA" }}
              >
                {b.label}
              </span>
            ))}
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        {product.brand && (
          <p
            className="text-[9px] font-semibold uppercase tracking-widest mb-1"
            style={{ color: config.secondaryColor }}
          >
            {product.brand}
          </p>
        )}

        <Link
          to={productLink}
          className="text-xs font-medium leading-snug mb-1.5 line-clamp-2 no-underline hover:underline"
          style={{ color: config.primaryColor }}
        >
          {product.name}
        </Link>

        {/* UPC */}
        <p className="text-[9px] font-mono mb-2" style={{ color: config.secondaryColor }}>
          {product.upc}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-base font-bold" style={{ color: config.primaryColor }}>
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs line-through" style={{ color: config.secondaryColor }}>
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Quick Add Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onQuickAdd(product);
          }}
          className="mt-auto w-full flex items-center justify-center gap-1.5 text-[11px] font-semibold py-2 rounded-lg cursor-pointer transition-all"
          style={{
            backgroundColor: isSelected ? "#fff" : config.primaryColor,
            color: isSelected ? config.primaryColor : "#fff",
            border: isSelected ? `1px solid ${config.primaryColor}` : "none",
          }}
        >
          <ShoppingCartOutlined className="text-xs" />
          {isSelected ? "Selected" : "Quick Add"}
        </button>
      </div>
    </div>
  );
}
