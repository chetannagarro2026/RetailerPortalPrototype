import { useState } from "react";
import { InputNumber } from "antd";
import { DownOutlined, RightOutlined, TagOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import type { CatalogProduct, ProductVariant } from "../../data/catalogData";
import { useAuth } from "../../context/AuthContext";
import { getVariantPromotions } from "../../context/PromotionContext";
import { resolveVariantPricing } from "../../utils/pricing";
import SkuAccordionContent from "./SkuAccordionContent";
import PromotionInfoDrawer from "../catalog/PromotionInfoDrawer";

interface SkuTableGroupProps {
  groupLabel: string | null;
  variants: ProductVariant[];
  columns: string[];
  product: CatalogProduct;
  expandedId: string | null;
  onToggleExpand: (variantId: string | null) => void;
  /** Externally-managed qty map: variantId → qty */
  qtyMap: Record<string, number>;
  /** Called when a single row's qty changes */
  onQtyChange: (variantId: string, qty: number) => void;
  /** Total column count for colspan on group label row */
  totalColSpan: number;
}

export default function SkuTableGroup({
  groupLabel,
  variants,
  columns,
  product,
  expandedId,
  onToggleExpand,
  qtyMap,
  onQtyChange,
  totalColSpan,
}: SkuTableGroupProps) {
  const config = activeBrandConfig;
  const minQty = product.minOrderQty || 1;
  const casePack = product.casePackQty || 0;

  if (variants.length === 0) return null;

  return (
    <>
      {/* Group Label Row — lightweight inline divider */}
      {groupLabel && (
        <tr>
          <td
            colSpan={totalColSpan}
            className="px-4 py-2.5"
            style={{
              backgroundColor: config.cardBg,
              borderLeft: `3px solid ${config.primaryColor}`,
              borderBottom: `1px solid ${config.borderColor}`,
            }}
          >
            <span className="text-[13px] font-semibold" style={{ color: config.primaryColor }}>
              {groupLabel}
            </span>
            <span className="text-[11px] font-normal ml-2.5" style={{ color: config.secondaryColor }}>
              ({variants.length} SKU{variants.length !== 1 ? "s" : ""})
            </span>
          </td>
        </tr>
      )}

      {/* Data Rows */}
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
            qty={qtyMap[v.id] ?? 0}
            minQty={minQty}
            casePack={casePack}
            onQtyChange={(val) => onQtyChange(v.id, val)}
            colSpan={totalColSpan}
          />
        );
      })}
    </>
  );
}

// ── Column count helper (exported for parent) ───────────────────────

export function getColSpan(columns: string[], isAuthenticated: boolean): number {
  // Chevron + attrs + SKU + Stock + ListPrice + Qty = 1 + cols + 4
  // Auth: + SpecialPrice + Promotions = 1 + cols + 6
  if (!isAuthenticated) return 1 + columns.length + 4;
  return 1 + columns.length + 6;
}

// ── SKU Row ─────────────────────────────────────────────────────────

function SkuRow({
  variant,
  columns,
  product,
  isExpanded,
  onToggle,
  qty,
  minQty,
  casePack,
  onQtyChange,
  colSpan,
}: {
  variant: ProductVariant;
  columns: string[];
  product: CatalogProduct;
  isExpanded: boolean;
  onToggle: () => void;
  qty: number;
  minQty: number;
  casePack: number;
  onQtyChange: (val: number) => void;
  colSpan: number;
}) {
  const config = activeBrandConfig;
  const { isAuthenticated } = useAuth();
  const isOOS = variant.availabilityStatus === "out-of-stock";
  const borderStyle = isExpanded ? "none" : `1px solid ${config.borderColor}`;

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
        <SkuPromoBadgeCell variant={variant} product={product} borderStyle={borderStyle} />

        {/* Qty — with validation styling */}
        <QtyCell
          variant={variant}
          qty={qty}
          minQty={minQty}
          casePack={casePack}
          onQtyChange={onQtyChange}
          borderStyle={borderStyle}
        />
      </tr>

      {/* Expanded Accordion */}
      {isExpanded && (
        <tr>
          <td
            colSpan={colSpan}
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
}: {
  variant: ProductVariant;
  product: CatalogProduct;
  borderStyle: string;
}) {
  const config = activeBrandConfig;
  const { isAuthenticated } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!isAuthenticated) return null;

  const promotions = getVariantPromotions(variant.id, product);

  if (promotions.length === 0) {
    return (
      <td className="px-3 py-2.5 text-center whitespace-nowrap" style={{ borderBottom: borderStyle }}>
        <span className="text-[10px]" style={{ color: config.secondaryColor }}>—</span>
      </td>
    );
  }

  return (
    <td className="px-3 py-2.5 text-center whitespace-nowrap" style={{ borderBottom: borderStyle }}>
      <button
        onClick={(e) => { e.stopPropagation(); setDrawerOpen(true); }}
        className="inline-flex items-center gap-1 text-[10px] font-semibold rounded px-2 py-0.5 cursor-pointer"
        style={{ backgroundColor: "#E1F5EE", color: "#085041", border: "none" }}
      >
        <TagOutlined style={{ fontSize: 10 }} />
        {promotions.length} {promotions.length === 1 ? "Promotion" : "Promotions"}
      </button>
      <PromotionInfoDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        productName={`${product.name} — ${variant.sku}`}
        promotions={promotions}
      />
    </td>
  );
}

// ── Qty Cell — with validation styling ──────────────────────────────

function QtyCell({
  variant,
  qty,
  minQty,
  casePack,
  onQtyChange,
  borderStyle,
}: {
  variant: ProductVariant;
  qty: number;
  minQty: number;
  casePack: number;
  onQtyChange: (val: number) => void;
  borderStyle: string;
}) {
  const isOOS = variant.availabilityStatus === "out-of-stock";
  const stock = variant.stockQty ?? 0;

  // Validation states
  const isBelowMin = qty > 0 && qty < minQty;
  const isAboveStock = qty > 0 && qty > stock && stock > 0;
  const isCasePackWarn = casePack > 1 && qty > 0 && qty >= minQty && !isAboveStock && qty % casePack !== 0;
  const isStaged = qty > 0 && qty >= minQty && !isCasePackWarn && !isAboveStock;

  // Input styling based on state
  let inputBorder = undefined;
  let inputBg = undefined;
  if (isBelowMin || isAboveStock) {
    inputBorder = "#FCA5A5";
    inputBg = "#FEF2F2";
  } else if (isCasePackWarn) {
    inputBorder = "#FDE68A";
    inputBg = "#FFFBEB";
  } else if (isStaged) {
    inputBorder = "#9FE1CB";
    inputBg = "#F0FDF4";
  }

  return (
    <td className="px-2 py-2.5 text-center whitespace-nowrap" style={{ borderBottom: borderStyle }}>
      <div className="inline-flex flex-col items-center gap-0.5">
        <InputNumber
          size="small"
          min={0}
          value={qty || undefined}
          placeholder="0"
          onChange={(val) => onQtyChange(val ?? 0)}
          disabled={isOOS}
          controls
          style={{
            width: 70,
            borderColor: inputBorder,
            backgroundColor: inputBg,
          }}
          className={(isBelowMin || isAboveStock) ? "sku-qty-error" : isCasePackWarn ? "sku-qty-warn" : isStaged ? "sku-qty-staged" : ""}
        />
        {isBelowMin && (
          <span className="text-[10px] font-medium leading-tight" style={{ color: "#DC2626" }}>
            Min: {minQty}
          </span>
        )}
        {isAboveStock && !isBelowMin && (
          <span className="text-[10px] font-medium leading-tight" style={{ color: "#DC2626" }}>
            Max: {stock}
          </span>
        )}
        {isCasePackWarn && (
          <span className="text-[10px] font-medium leading-tight" style={{ color: "#D97706" }}>
            Case pack: {casePack}
          </span>
        )}
      </div>
    </td>
  );
}
