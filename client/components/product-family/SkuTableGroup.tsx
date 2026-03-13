import { useState, useCallback } from "react";
import { InputNumber } from "antd";
import { DownOutlined, RightOutlined, TagOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import Tag, { DropdownIndicator } from "../ui/Tag";
import type { CatalogProduct, ProductVariant } from "../../data/catalogData";
import { useAuth } from "../../context/AuthContext";
import { useOrder } from "../../context/OrderContext";
import { usePromotions, getVariantPromotions } from "../../context/PromotionContext";
import { resolveVariantPricing } from "../../utils/pricing";
import SkuAccordionContent from "./SkuAccordionContent";

interface SkuTableGroupProps {
  groupLabel: string | null;
  variants: ProductVariant[];
  columns: string[];
  product: CatalogProduct;
  expandedId: string | null;
  onToggleExpand: (variantId: string | null) => void;
  onOpenPromoPanel?: (variantId: string) => void;
}

// ── Column count helper ─────────────────────────────────────────────

function getColSpan(columns: string[], isAuthenticated: boolean): number {
  // Guest:  Chevron + attrs + SKU + Stock + ListPrice + Qty + Add = 1 + cols + 5
  // Auth:   + SpecialPrice + Promotions = 1 + cols + 7
  if (!isAuthenticated) return 1 + columns.length + 5;
  return 1 + columns.length + 7;
}

export default function SkuTableGroup({
  groupLabel,
  variants,
  columns,
  product,
  expandedId,
  onToggleExpand,
  onOpenPromoPanel,
}: SkuTableGroupProps) {
  const config = activeBrandConfig;
  const { isAuthenticated } = useAuth();

  if (variants.length === 0) return null;

  const thStyle = (align: string = "left") => ({
    color: config.primaryColor,
    borderBottom: `2px solid ${config.borderColor}`,
    textAlign: align as any,
  });

  return (
    <div className="mb-6">
      {/* Group Header */}
      {groupLabel && (
        <div
          className="px-4 py-2.5 rounded-t-lg text-xs font-semibold"
          style={{ backgroundColor: config.primaryColor, color: "#fff" }}
        >
          {groupLabel}
          <span className="font-normal ml-2 opacity-80">
            ({variants.length} SKU{variants.length !== 1 ? "s" : ""})
          </span>
        </div>
      )}

      {/* Table */}
      <div
        className="overflow-x-auto"
        style={{
          border: `1px solid ${config.borderColor}`,
          borderRadius: groupLabel ? "0 0 10px 10px" : 10,
        }}
      >
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={{ backgroundColor: config.cardBg }}>
              {/* Chevron */}
              <th className="w-8 px-2 py-2.5" style={{ borderBottom: `2px solid ${config.borderColor}` }} />

              {/* Dynamic variant attribute columns */}
              {columns.map((col) => (
                <th key={col} className="text-left px-3 py-2.5 font-semibold whitespace-nowrap" style={thStyle("left")}>
                  {col}
                </th>
              ))}

              {/* SKU */}
              <th className="text-left px-3 py-2.5 font-semibold whitespace-nowrap" style={thStyle("left")}>
                SKU
              </th>

              {/* Stock */}
              <th className="text-center px-3 py-2.5 font-semibold whitespace-nowrap" style={thStyle("center")}>
                Stock
              </th>

              {/* List Price — always visible */}
              <th className="text-right px-3 py-2.5 font-semibold whitespace-nowrap" style={thStyle("right")}>
                List Price
              </th>

              {/* Special Price — authenticated only */}
              {isAuthenticated && (
                <th className="text-right px-3 py-2.5 font-semibold whitespace-nowrap" style={thStyle("right")}>
                  Special Price
                </th>
              )}

              {/* Promotions — authenticated only */}
              {isAuthenticated && (
                <th className="text-center px-3 py-2.5 font-semibold whitespace-nowrap" style={thStyle("center")}>
                  Promotions
                </th>
              )}

              {/* Qty */}
              <th className="text-center px-3 py-2.5 font-semibold whitespace-nowrap" style={thStyle("center")}>
                Qty
              </th>

              {/* Add to Cart */}
              <th className="text-center px-3 py-2.5 font-semibold whitespace-nowrap" style={thStyle("center")}>
                Add to Cart
              </th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => {
              const isExpanded = expandedId === v.id;
              return (
                <SkuRow
                  key={v.id}
                  variant={v}
                  columns={columns}
                  product={product}
                  isExpanded={isExpanded}
                  onToggle={() => onToggleExpand(isExpanded ? null : v.id)}
                  onOpenPromoPanel={onOpenPromoPanel}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── SKU Row ─────────────────────────────────────────────────────────

function SkuRow({
  variant,
  columns,
  product,
  isExpanded,
  onToggle,
  onOpenPromoPanel,
}: {
  variant: ProductVariant;
  columns: string[];
  product: CatalogProduct;
  isExpanded: boolean;
  onToggle: () => void;
  onOpenPromoPanel?: (variantId: string) => void;
}) {
  const config = activeBrandConfig;
  const { isAuthenticated } = useAuth();
  const isOOS = variant.availabilityStatus === "out-of-stock";
  const borderStyle = isExpanded ? "none" : `1px solid ${config.borderColor}`;

  // Shared qty state between QtyCell and AddToCartCell
  const minQty = product.minOrderQty || 1;
  const step = product.casePackQty || 1;
  const [qty, setQty] = useState(minQty);
  const handleQtyChange = useCallback(
    (val: number | null) => {
      if (val === null) return;
      setQty(Math.max(minQty, Math.round(val / step) * step || step));
    },
    [minQty, step],
  );

  return (
    <>
      <tr
        className="transition-colors"
        style={{
          backgroundColor: isExpanded ? config.cardBg : "transparent",
          opacity: isOOS ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isExpanded) e.currentTarget.style.backgroundColor = config.cardBg;
        }}
        onMouseLeave={(e) => {
          if (!isExpanded) e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        {/* Chevron */}
        <td
          className="px-2 py-2.5 text-center cursor-pointer"
          style={{ borderBottom: borderStyle, color: config.secondaryColor }}
          onClick={onToggle}
        >
          {isExpanded ? <DownOutlined className="text-[10px]" /> : <RightOutlined className="text-[10px]" />}
        </td>

        {/* Attribute Columns */}
        {columns.map((col) => (
          <td
            key={col}
            className="px-3 py-2.5 whitespace-nowrap cursor-pointer"
            style={{ color: config.primaryColor, borderBottom: borderStyle }}
            onClick={onToggle}
          >
            {variant.attributes[col] || "—"}
          </td>
        ))}

        {/* SKU */}
        <td
          className="px-3 py-2.5 font-mono text-[11px] whitespace-nowrap cursor-pointer"
          style={{ color: config.secondaryColor, borderBottom: borderStyle }}
          onClick={onToggle}
        >
          {variant.sku}
        </td>

        {/* Stock */}
        <StockCell variant={variant} borderStyle={borderStyle} />

        {/* List Price */}
        <ListPriceCell variant={variant} product={product} borderStyle={borderStyle} />

        {/* Special Price — auth only */}
        <SpecialPriceCell variant={variant} product={product} borderStyle={borderStyle} />

        {/* Promotions — auth only */}
        <SkuPromoBadgeCell variant={variant} product={product} borderStyle={borderStyle} onOpenPromoPanel={onOpenPromoPanel} />

        {/* Qty */}
        <QtyCell
          variant={variant}
          qty={qty}
          minQty={minQty}
          step={step}
          onQtyChange={handleQtyChange}
          borderStyle={borderStyle}
        />

        {/* Add to Cart */}
        <AddToCartCell variant={variant} product={product} qty={qty} borderStyle={borderStyle} />
      </tr>

      {/* Expanded Accordion */}
      {isExpanded && (
        <tr>
          <td
            colSpan={getColSpan(columns, isAuthenticated)}
            style={{ padding: 0, borderBottom: `1px solid ${config.borderColor}` }}
          >
            <SkuAccordionContent product={product} variant={variant} />
          </td>
        </tr>
      )}
    </>
  );
}

// ── Stock Cell ──────────────────────────────────────────────────────

function StockCell({ variant, borderStyle }: { variant: ProductVariant; borderStyle: string }) {
  const config = activeBrandConfig;
  const qty = variant.stockQty ?? 0;

  let message = "";
  let messageColor = "";

  if (qty === 0) {
    message = "Out of Stock";
    messageColor = "#DC2626";
  } else if (qty <= 10) {
    message = "Low Quantity";
    messageColor = "#EA580C";
  } else if (qty <= 50) {
    message = "Running Low";
    messageColor = "#D97706";
  }
  // qty > 50 — no message

  return (
    <td className="px-3 py-2.5 text-center whitespace-nowrap" style={{ borderBottom: borderStyle }}>
      <span
        className="text-xs font-semibold block"
        style={{ color: qty === 0 ? "#DC2626" : config.primaryColor }}
      >
        {qty}
      </span>
      {message && (
        <span className="text-[9px] block mt-0.5" style={{ color: messageColor }}>
          {message}
        </span>
      )}
    </td>
  );
}

// ── List Price Cell ─────────────────────────────────────────────────

function ListPriceCell({
  variant,
  product,
  borderStyle,
}: {
  variant: ProductVariant;
  product: CatalogProduct;
  borderStyle: string;
}) {
  const config = activeBrandConfig;
  const pricing = resolveVariantPricing(variant, product);

  return (
    <td className="px-3 py-2.5 text-right whitespace-nowrap" style={{ borderBottom: borderStyle }}>
      <span className="font-medium" style={{ color: config.primaryColor }}>
        ${pricing.listPrice.toFixed(2)}
      </span>
    </td>
  );
}

// ── Special Price Cell ──────────────────────────────────────────────

function SpecialPriceCell({
  variant,
  product,
  borderStyle,
}: {
  variant: ProductVariant;
  product: CatalogProduct;
  borderStyle: string;
}) {
  const config = activeBrandConfig;
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const pricing = resolveVariantPricing(variant, product);
  const specialPrice = pricing.hasSpecialPrice ? pricing.finalPrice : pricing.listPrice;
  const savingsPercent =
    pricing.hasSpecialPrice && pricing.listPrice > 0
      ? Math.round(((pricing.listPrice - specialPrice) / pricing.listPrice) * 100)
      : 0;

  return (
    <td className="px-3 py-2.5 text-right whitespace-nowrap" style={{ borderBottom: borderStyle }}>
      <span className="font-semibold" style={{ color: config.primaryColor }}>
        ${specialPrice.toFixed(2)}
      </span>
      {savingsPercent > 0 && (
        <span className="text-[10px] block mt-0.5" style={{ color: "#16A34A" }}>
          Save {savingsPercent}%
        </span>
      )}
    </td>
  );
}

// ── Promo Badge Cell ────────────────────────────────────────────────

function SkuPromoBadgeCell({
  variant,
  product,
  borderStyle,
  onOpenPromoPanel,
}: {
  variant: ProductVariant;
  product: CatalogProduct;
  borderStyle: string;
  onOpenPromoPanel?: (variantId: string) => void;
}) {
  const config = activeBrandConfig;
  const { isAuthenticated } = useAuth();
  const { getAppliedPromotion } = usePromotions();

  if (!isAuthenticated) return null;

  const promotions = getVariantPromotions(variant.id, product);
  const appliedPromo = getAppliedPromotion(variant.id);

  if (promotions.length === 0) {
    return (
      <td className="px-3 py-2.5 text-center whitespace-nowrap" style={{ borderBottom: borderStyle }}>
        <span className="text-[10px]" style={{ color: config.secondaryColor }}>—</span>
      </td>
    );
  }

  return (
    <td className="px-3 py-2.5 text-center whitespace-nowrap" style={{ borderBottom: borderStyle }}>
      <Tag
        variant={appliedPromo ? "applied" : "promotion"}
        icon={<TagOutlined />}
        suffix={<DropdownIndicator />}
        onClick={(e) => {
          e.stopPropagation();
          onOpenPromoPanel?.(variant.id);
        }}
        title={appliedPromo ? `Applied: ${appliedPromo.label}` : `${promotions.length} available`}
      >
        {appliedPromo
          ? <>{appliedPromo.label} Applied</>
          : <>{promotions.length} {promotions.length === 1 ? "Promotion" : "Promotions"}</>
        }
      </Tag>
    </td>
  );
}

// ── Qty Cell ────────────────────────────────────────────────────────

function QtyCell({
  variant,
  qty,
  minQty,
  step,
  onQtyChange,
  borderStyle,
}: {
  variant: ProductVariant;
  qty: number;
  minQty: number;
  step: number;
  onQtyChange: (val: number | null) => void;
  borderStyle: string;
}) {
  const isOOS = variant.availabilityStatus === "out-of-stock";

  return (
    <td className="px-2 py-2.5 text-center whitespace-nowrap" style={{ borderBottom: borderStyle }}>
      <InputNumber
        size="small"
        min={minQty}
        step={step}
        value={qty}
        onChange={onQtyChange}
        disabled={isOOS}
        controls
        style={{ width: 70 }}
      />
    </td>
  );
}

// ── Add to Cart Cell ────────────────────────────────────────────────

function AddToCartCell({
  variant,
  product,
  qty,
  borderStyle,
}: {
  variant: ProductVariant;
  product: CatalogProduct;
  qty: number;
  borderStyle: string;
}) {
  const config = activeBrandConfig;
  const { addItem } = useOrder();
  const { isAuthenticated } = useAuth();
  const isOOS = variant.availabilityStatus === "out-of-stock";
  const pricing = resolveVariantPricing(variant, product);

  const handleAdd = useCallback(() => {
    const unitPrice = isAuthenticated ? pricing.finalPrice : pricing.listPrice;
    addItem({
      id: variant.id,
      productId: product.id,
      productName: product.name,
      sku: variant.sku,
      variantAttributes: variant.attributes,
      quantity: qty,
      unitPrice,
      listPrice: pricing.listPrice,
      specialPrice: isAuthenticated ? pricing.specialPrice : undefined,
      promotionLabel: isAuthenticated ? pricing.promotionLabel : undefined,
      imageUrl: product.imageUrl,
    });
  }, [variant, product, qty, addItem, isAuthenticated, pricing]);

  return (
    <td className="px-2 py-2.5 text-center whitespace-nowrap" style={{ borderBottom: borderStyle }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleAdd();
        }}
        disabled={isOOS}
        className="inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: isOOS ? config.secondaryColor : config.primaryColor,
          color: "#fff",
          border: "none",
        }}
      >
        <ShoppingCartOutlined className="text-[10px]" />
        {isOOS ? "Unavailable" : "Add"}
      </button>
    </td>
  );
}
