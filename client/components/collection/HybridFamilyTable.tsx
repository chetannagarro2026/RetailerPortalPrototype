import { useState, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Pagination } from "antd";
import {
  RightOutlined,
  DownOutlined,
  ShoppingCartOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { Tooltip } from "antd";
import Tag from "../ui/Tag";
import { activeBrandConfig } from "../../config/brandConfig";
import type { CatalogProduct } from "../../data/catalogData";
import { useAuth } from "../../context/AuthContext";
import { getFinalPriceRange, countProductPromotions, getProductPromotionLabels } from "../../utils/pricing";
import FamilyRowExpansion from "./FamilyRowExpansion";
import QuickAddPanel from "./QuickAddPanel";

const TABLE_PAGE_SIZE = 20;

interface HybridFamilyTableProps {
  products: CatalogProduct[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  /** Show a Category column (used in global/brand mode) */
  showCategory?: boolean;
}

export default function HybridFamilyTable({
  products,
  total,
  page,
  onPageChange,
  showCategory = false,
}: HybridFamilyTableProps) {
  const config = activeBrandConfig;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [quickAddProduct, setQuickAddProduct] = useState<CatalogProduct | null>(null);

  const handleRowClick = useCallback(
    (productId: string) => {
      setExpandedId((prev) => (prev === productId ? null : productId));
    },
    [],
  );

  const handleQuickAdd = useCallback(
    (product: CatalogProduct) => {
      setQuickAddProduct(product);
    },
    [],
  );

  const handleClosePanel = useCallback(() => {
    setQuickAddProduct(null);
  }, []);

  if (products.length === 0) {
    return (
      <div
        className="text-center py-16 text-sm rounded-xl"
        style={{ color: config.secondaryColor, border: `1px solid ${config.borderColor}` }}
      >
        No product families match the current filters.
      </div>
    );
  }

  const panelOpen = !!quickAddProduct;

  // ── Drag-to-resize state ──
  const containerRef = useRef<HTMLDivElement>(null);
  const [panelWidth, setPanelWidth] = useState(420);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    startX.current = e.clientX;
    startW.current = panelWidth;

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const delta = startX.current - ev.clientX;
      const containerW = containerRef.current?.offsetWidth || 1200;
      const minPanel = 280;
      const maxPanel = containerW - 400; // leave at least 400px for left table
      setPanelWidth(Math.max(minPanel, Math.min(maxPanel, startW.current + delta)));
    };
    const onUp = () => {
      dragging.current = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [panelWidth]);

  return (
    <div
      ref={containerRef}
      className="flex"
      style={panelOpen ? {
        height: "calc(100vh - var(--header-height) - var(--nav-height) - 48px)",
      } : undefined}
    >
      {/* Main table area */}
      <div
        className="min-w-0"
        style={panelOpen ? { overflow: "auto", flex: 1 } : { flex: 1 }}
      >
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: `1px solid ${config.borderColor}`, minWidth: 580 }}
        >
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr style={{ backgroundColor: config.cardBg }}>
                <th className="w-6 px-1.5 py-2" style={{ borderBottom: `2px solid ${config.borderColor}` }} />
                <th
                  className="text-left px-2 py-2 font-semibold"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
                >
                  Image
                </th>
                <th
                  className="text-left px-2 py-2 font-semibold"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
                >
                  Family Name
                </th>
                <th
                  className="text-left px-2 py-2 font-semibold"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
                >
                  Brand
                </th>
                {showCategory && (
                  <th
                    className="text-left px-2 py-2 font-semibold"
                    style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
                  >
                    Category
                  </th>
                )}
                <th
                  className="text-left px-2 py-2 font-semibold"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
                >
                  Key Attributes
                </th>
                <th
                  className="text-right px-2 py-2 font-semibold whitespace-nowrap"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
                >
                  Price Range
                </th>
                <th
                  className="text-center px-2 py-2 font-semibold"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
                >
                  SKUs
                </th>
                <th
                  className="text-center px-2 py-2 font-semibold"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isExpanded = expandedId === product.id;
                return (
                  <FamilyRow
                    key={product.id}
                    product={product}
                    isExpanded={isExpanded}
                    onRowClick={handleRowClick}
                    onQuickAdd={handleQuickAdd}
                    showCategory={showCategory}
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

      {/* Drag handle */}
      {quickAddProduct && (
        <div
          onMouseDown={onDragStart}
          className="shrink-0 flex items-center justify-center cursor-col-resize group"
          style={{ width: 8 }}
          title="Drag to resize"
        >
          <div
            className="w-1 h-10 rounded-full transition-colors group-hover:h-16"
            style={{ backgroundColor: config.borderColor }}
          />
        </div>
      )}

      {/* Quick Add Panel — in-flow, scrolls independently */}
      {quickAddProduct && (
        <div
          className="shrink-0 flex flex-col shadow-lg rounded-xl overflow-hidden"
          style={{
            width: panelWidth,
            height: "100%",
            border: `1px solid ${config.borderColor}`,
            backgroundColor: "#fff",
          }}
        >
          <QuickAddPanel
            key={quickAddProduct.id}
            product={quickAddProduct}
            familyLink={`/product/${quickAddProduct.id}`}
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
  showCategory = false,
}: {
  product: CatalogProduct;
  isExpanded: boolean;
  onRowClick: (id: string) => void;
  onQuickAdd: (product: CatalogProduct) => void;
  showCategory?: boolean;
}) {
  const config = activeBrandConfig;
  const familyLink = `/product/${product.id}`;

  const { isAuthenticated, showSignInModal } = useAuth();
  const { priceRange, listPriceRange, hasOffers, skuCount, attrSummary, promoCount, promoLabels } = useMemo(
    () => computeFamilyMeta(product, isAuthenticated),
    [product, isAuthenticated],
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
          className="px-1.5 py-2 text-center"
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
          className="px-2 py-2"
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
          className="px-2 py-2"
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
          className="px-2 py-2 text-[11px]"
          style={{ color: config.secondaryColor, borderBottom: isExpanded ? "none" : `1px solid ${config.borderColor}` }}
        >
          {product.brand || "—"}
        </td>

        {/* Category (global/brand mode) */}
        {showCategory && (
          <td
            className="px-2 py-2 text-[11px]"
            style={{ color: config.secondaryColor, borderBottom: isExpanded ? "none" : `1px solid ${config.borderColor}` }}
          >
            {product.attributes?.category || "—"}
          </td>
        )}

        {/* Key Attributes */}
        <td
          className="px-2 py-2 text-[11px]"
          style={{ color: config.secondaryColor, borderBottom: isExpanded ? "none" : `1px solid ${config.borderColor}` }}
        >
          {attrSummary}
        </td>

        {/* Price Range */}
        <td
          className="px-2 py-2 text-[11px] whitespace-nowrap"
          style={{ borderBottom: isExpanded ? "none" : `1px solid ${config.borderColor}` }}
        >
          <div className="flex flex-col items-center justify-center gap-0.5">
            {isAuthenticated && listPriceRange && (
              <div className="line-through" style={{ color: config.secondaryColor }}>{listPriceRange}</div>
            )}
            <div className="font-medium" style={{ color: config.primaryColor, marginBottom: 4 }}>{priceRange}</div>
            {isAuthenticated && promoCount > 0 && (
              <Tooltip
                title={
                  <div>
                    <div className="text-[11px] font-semibold mb-1">Available Promotions</div>
                    {promoLabels.map((label: string, i: number) => (
                      <div key={i} className="text-[11px]">&bull; {label}</div>
                    ))}
                    {promoCount > 3 && (
                      <div className="text-[10px] mt-1 opacity-70">+{promoCount - 3} more</div>
                    )}
                  </div>
                }
                placement="bottom"
              >
                <span>
                  <Tag variant="promotion" size="compact" icon={<TagOutlined style={{ fontSize: 10, fontWeight: 800 }} />}>
                    {promoCount} {promoCount === 1 ? "Promotion" : "Promotions"}
                  </Tag>
                </span>
              </Tooltip>
            )}
            {!isAuthenticated && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showSignInModal("Sign in to view Special Price and promotions.");
                }}
                className="text-[9px] cursor-pointer bg-transparent border-none p-0 underline"
                style={{ color: "#2563EB" }}
              >
                Login to view Special Price
              </button>
            )}
          </div>
        </td>

        {/* SKU Count */}
        <td
          className="px-2 py-2 text-center"
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
          className="px-2 py-2 text-center"
          style={{ borderBottom: isExpanded ? "none" : `1px solid ${config.borderColor}` }}
        >
          {!isExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(product);
              }}
              className="inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-md cursor-pointer transition-colors whitespace-nowrap"
              style={{
                backgroundColor: config.primaryColor,
                color: "#fff",
                border: "none",
              }}
            >
              <ShoppingCartOutlined className="text-[9px]" />
              Quick&nbsp;Add
            </button>
          )}
        </td>
      </tr>

      {/* Expansion Row */}
      {isExpanded && (
        <tr>
          <td
            colSpan={showCategory ? 9 : 8}
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

function computeFamilyMeta(product: CatalogProduct, isAuthenticated: boolean) {
  const variants = product.variants || [];
  const skuCount = variants.length;

  const range = getFinalPriceRange(product, isAuthenticated);
  let priceRange: string;
  if (skuCount === 0) {
    priceRange = `$${range.min.toFixed(2)}`;
  } else if (range.min === range.max) {
    priceRange = `$${range.min.toFixed(2)}`;
  } else {
    priceRange = `$${range.min.toFixed(2)} – $${range.max.toFixed(2)}`;
  }

  // List price range for strikethrough
  let listPriceRange: string | null = null;
  if (isAuthenticated) {
    let minList = Infinity;
    let maxList = -Infinity;
    if (variants.length === 0) {
      minList = maxList = product.price;
    } else {
      for (const v of variants) {
        if (v.price < minList) minList = v.price;
        if (v.price > maxList) maxList = v.price;
      }
    }
    if (minList !== range.min || maxList !== range.max) {
      listPriceRange = minList === maxList
        ? `$${minList.toFixed(2)}`
        : `$${minList.toFixed(2)} – $${maxList.toFixed(2)}`;
    }
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

  const promoCount = countProductPromotions(product);
  const promoLabels = getProductPromotionLabels(product, 3);

  return { priceRange, listPriceRange, hasOffers: range.hasOffers, skuCount, attrSummary, promoCount, promoLabels };
}
