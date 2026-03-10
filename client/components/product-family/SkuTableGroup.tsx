import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import type { CatalogProduct, ProductVariant } from "../../data/catalogData";
import { useAuth } from "../../context/AuthContext";
import { resolveVariantPricing } from "../../utils/pricing";
import SkuAccordionContent from "./SkuAccordionContent";

interface SkuTableGroupProps {
  groupLabel: string | null;
  variants: ProductVariant[];
  /** Attribute keys to show as columns (excluding the grouping attribute) */
  columns: string[];
  product: CatalogProduct;
  expandedId: string | null;
  onToggleExpand: (variantId: string | null) => void;
}

const STOCK_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  "in-stock": { label: "", color: "#16A34A", bg: "" },
  "low-stock": { label: "Low", color: "#9A3412", bg: "#FFF7ED" },
  "out-of-stock": { label: "OOS", color: "#DC2626", bg: "#FEF2F2" },
  "pre-order": { label: "Pre", color: "#7C3AED", bg: "#F5F3FF" },
};

export default function SkuTableGroup({
  groupLabel,
  variants,
  columns,
  product,
  expandedId,
  onToggleExpand,
}: SkuTableGroupProps) {
  const config = activeBrandConfig;

  if (variants.length === 0) return null;

  return (
    <div className="mb-6">
      {/* Group Header */}
      {groupLabel && (
        <div
          className="px-4 py-2.5 rounded-t-lg text-xs font-semibold"
          style={{
            backgroundColor: config.primaryColor,
            color: "#fff",
          }}
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
              <th className="w-8 px-2 py-2.5" style={{ borderBottom: `2px solid ${config.borderColor}` }} />
              {columns.map((col) => (
                <th
                  key={col}
                  className="text-left px-3 py-2.5 font-semibold whitespace-nowrap"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
                >
                  {col}
                </th>
              ))}
              <th
                className="text-left px-3 py-2.5 font-semibold whitespace-nowrap"
                style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
              >
                SKU
              </th>
              <th
                className="text-center px-3 py-2.5 font-semibold whitespace-nowrap"
                style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
              >
                Stock
              </th>
              <th
                className="text-right px-3 py-2.5 font-semibold whitespace-nowrap"
                style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
              >
                List Price
              </th>
              <th
                className="text-right px-3 py-2.5 font-semibold whitespace-nowrap"
                style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
              >
                Special Price
              </th>
              <th
                className="text-center px-3 py-2.5 font-semibold whitespace-nowrap"
                style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
              >
                Promotion
              </th>
              <th
                className="text-right px-3 py-2.5 font-semibold whitespace-nowrap"
                style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
              >
                Final Price
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
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── SKU Row with Accordion ──────────────────────────────────────────

function SkuRow({
  variant,
  columns,
  product,
  isExpanded,
  onToggle,
}: {
  variant: ProductVariant;
  columns: string[];
  product: CatalogProduct;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const config = activeBrandConfig;
  const disabled = variant.availabilityStatus === "out-of-stock";
  const stock = STOCK_BADGE[variant.availabilityStatus] || STOCK_BADGE["in-stock"];

  return (
    <>
      {/* Collapsed Row — entire row is click target */}
      <tr
        onClick={onToggle}
        className="transition-colors"
        style={{
          cursor: "pointer",
          backgroundColor: isExpanded ? config.cardBg : "transparent",
          opacity: disabled ? 0.5 : 1,
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
          className="px-2 py-2.5 text-center"
          style={{ borderBottom: isExpanded ? "none" : `1px solid ${config.borderColor}`, color: config.secondaryColor }}
        >
          {isExpanded
            ? <DownOutlined className="text-[10px]" />
            : <RightOutlined className="text-[10px]" />}
        </td>

        {/* Attribute Columns */}
        {columns.map((col) => (
          <td
            key={col}
            className="px-3 py-2.5 whitespace-nowrap"
            style={{
              color: config.primaryColor,
              borderBottom: isExpanded ? "none" : `1px solid ${config.borderColor}`,
            }}
          >
            {variant.attributes[col] || "—"}
          </td>
        ))}

        {/* SKU */}
        <td
          className="px-3 py-2.5 font-mono text-[11px] whitespace-nowrap"
          style={{
            color: config.secondaryColor,
            borderBottom: isExpanded ? "none" : `1px solid ${config.borderColor}`,
          }}
        >
          {variant.sku}
        </td>

        {/* Stock */}
        <td
          className="px-3 py-2.5 text-center whitespace-nowrap"
          style={{ borderBottom: isExpanded ? "none" : `1px solid ${config.borderColor}` }}
        >
          {stock.label ? (
            <span
              className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
              style={{ backgroundColor: stock.bg, color: stock.color }}
            >
              {stock.label} {variant.stockQty}
            </span>
          ) : (
            <span className="text-[10px]" style={{ color: stock.color }}>
              {variant.stockQty}
            </span>
          )}
        </td>

        {/* List Price / Special Price / Promotion / Final Price */}
        <SkuPricingCells variant={variant} product={product} isExpanded={isExpanded} />
      </tr>

      {/* Expanded Accordion Content — lazy rendered */}
      {isExpanded && (
        <tr>
          <td
            colSpan={columns.length + 7}
            style={{ padding: 0, borderBottom: `1px solid ${config.borderColor}` }}
          >
            <SkuAccordionContent product={product} variant={variant} />
          </td>
        </tr>
      )}
    </>
  );
}

// ── SKU Pricing Cells ───────────────────────────────────────────────

function SkuPricingCells({
  variant,
  product,
  isExpanded,
}: {
  variant: ProductVariant;
  product: CatalogProduct;
  isExpanded: boolean;
}) {
  const config = activeBrandConfig;
  const { isAuthenticated } = useAuth();
  const pricing = resolveVariantPricing(variant, product);
  const borderStyle = isExpanded ? "none" : `1px solid ${config.borderColor}`;

  if (!isAuthenticated) {
    return (
      <>
        <td className="px-3 py-2.5 text-right font-medium whitespace-nowrap" style={{ color: config.primaryColor, borderBottom: borderStyle }}>
          ${pricing.listPrice.toFixed(2)}
        </td>
        <td className="px-3 py-2.5 text-right text-[10px] whitespace-nowrap" style={{ color: "#2563EB", borderBottom: borderStyle }}>
          Login to view
        </td>
        <td className="px-3 py-2.5 text-center whitespace-nowrap" style={{ color: config.secondaryColor, borderBottom: borderStyle }}>
          —
        </td>
        <td className="px-3 py-2.5 text-right font-medium whitespace-nowrap" style={{ color: config.primaryColor, borderBottom: borderStyle }}>
          ${pricing.listPrice.toFixed(2)}
        </td>
      </>
    );
  }

  return (
    <>
      {/* List Price */}
      <td className="px-3 py-2.5 text-right whitespace-nowrap" style={{ borderBottom: borderStyle }}>
        <span className={pricing.hasSpecialPrice ? "line-through" : "font-medium"} style={{ color: pricing.hasSpecialPrice ? config.secondaryColor : config.primaryColor }}>
          ${pricing.listPrice.toFixed(2)}
        </span>
      </td>
      {/* Special Price */}
      <td className="px-3 py-2.5 text-right font-medium whitespace-nowrap" style={{ color: pricing.hasSpecialPrice ? config.primaryColor : config.secondaryColor, borderBottom: borderStyle }}>
        {pricing.hasSpecialPrice ? `$${pricing.specialPrice!.toFixed(2)}` : "—"}
      </td>
      {/* Promotion */}
      <td className="px-3 py-2.5 text-center whitespace-nowrap" style={{ borderBottom: borderStyle }}>
        {pricing.hasPromotion ? (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}>
            {pricing.promotionLabel}
          </span>
        ) : (
          <span style={{ color: config.secondaryColor }}>—</span>
        )}
      </td>
      {/* Final Price */}
      <td className="px-3 py-2.5 text-right font-semibold whitespace-nowrap" style={{ color: config.primaryColor, borderBottom: borderStyle }}>
        ${pricing.finalPrice.toFixed(2)}
      </td>
    </>
  );
}
