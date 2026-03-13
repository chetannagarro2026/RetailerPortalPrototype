import { DownOutlined, RightOutlined, TagOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import Tag, { DropdownIndicator } from "../ui/Tag";
import type { CatalogProduct, ProductVariant } from "../../data/catalogData";
import { useAuth } from "../../context/AuthContext";
import { usePromotions, getVariantPromotions } from "../../context/PromotionContext";
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
  /** Called when user clicks the promo badge on a variant row */
  onOpenPromoPanel?: (variantId: string) => void;
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
  onOpenPromoPanel,
}: SkuTableGroupProps) {
  const config = activeBrandConfig;
  const { isAuthenticated } = useAuth();

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
                {isAuthenticated ? "Special Price" : "Price"}
              </th>
              {isAuthenticated && (
                <th
                  className="text-right px-3 py-2.5 font-semibold whitespace-nowrap"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
                >
                  Savings
                </th>
              )}
              {isAuthenticated && (
                <th
                  className="text-center px-3 py-2.5 font-semibold whitespace-nowrap"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
                >
                  Promos
                </th>
              )}
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

// ── SKU Row with Accordion ──────────────────────────────────────────

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

        {/* Pricing cells */}
        <SkuPricingCells variant={variant} product={product} isExpanded={isExpanded} />

        {/* Promo Badge */}
        <SkuPromoBadgeCell
          variant={variant}
          product={product}
          isExpanded={isExpanded}
          onOpenPromoPanel={onOpenPromoPanel}
        />
      </tr>

      {/* Expanded Accordion Content — lazy rendered */}
      {isExpanded && (
        <tr>
          <td
            colSpan={columns.length + (isAuthenticated ? 6 : 4)}
            style={{ padding: 0, borderBottom: `1px solid ${config.borderColor}` }}
          >
            <SkuAccordionContent product={product} variant={variant} />
          </td>
        </tr>
      )}
    </>
  );
}

// ── SKU Promo Badge Cell ────────────────────────────────────────────

function SkuPromoBadgeCell({
  variant,
  product,
  isExpanded,
  onOpenPromoPanel,
}: {
  variant: ProductVariant;
  product: CatalogProduct;
  isExpanded: boolean;
  onOpenPromoPanel?: (variantId: string) => void;
}) {
  const config = activeBrandConfig;
  const { isAuthenticated } = useAuth();
  const { getAppliedPromotion } = usePromotions();

  if (!isAuthenticated) return null;

  const promotions = getVariantPromotions(variant.id, product);
  const appliedPromo = getAppliedPromotion(variant.id);
  const borderStyle = isExpanded ? "none" : `1px solid ${config.borderColor}`;

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
  const { getAppliedPromotion, computeFinalPrice, computeSavingsPerUnit } = usePromotions();
  const pricing = resolveVariantPricing(variant, product);
  const borderStyle = isExpanded ? "none" : `1px solid ${config.borderColor}`;

  if (!isAuthenticated) {
    return (
      <td className="px-3 py-2.5 text-right font-medium whitespace-nowrap" style={{ color: config.primaryColor, borderBottom: borderStyle }}>
        ${pricing.listPrice.toFixed(2)}
      </td>
    );
  }

  // Check if a promotion is applied via context
  const appliedPromo = getAppliedPromotion(variant.id);
  const basePrice = pricing.finalPrice; // special price or list price
  const effectivePrice = appliedPromo
    ? computeFinalPrice(variant.id, basePrice)
    : pricing.finalPrice;
  const promoSavings = appliedPromo
    ? computeSavingsPerUnit(variant.id, basePrice)
    : 0;
  const totalSavings = pricing.listPrice - effectivePrice;
  const totalSavingsPercent = pricing.listPrice > 0 ? Math.round((totalSavings / pricing.listPrice) * 100) : 0;

  return (
    <>
      {/* Final Price + struck-through list price */}
      <td className="px-3 py-2.5 text-right whitespace-nowrap" style={{ borderBottom: borderStyle }}>
        <span className="font-semibold" style={{ color: appliedPromo ? "#16A34A" : config.primaryColor }}>
          ${effectivePrice.toFixed(2)}
        </span>
        {(pricing.hasSpecialPrice || appliedPromo) && (
          <>
            <br />
            <span className="text-[10px] line-through" style={{ color: config.secondaryColor }}>
              Was ${pricing.listPrice.toFixed(2)}
            </span>
          </>
        )}
        {appliedPromo && (
          <>
            <br />
            <span className="text-[9px] font-medium" style={{ color: "#4338CA" }}>
              {appliedPromo.label}
            </span>
          </>
        )}
      </td>
      {/* Savings */}
      <td className="px-3 py-2.5 text-right whitespace-nowrap" style={{ borderBottom: borderStyle }}>
        {totalSavings > 0 ? (
          <span className="text-[10px]" style={{ color: "#16A34A" }}>
            ${totalSavings.toFixed(2)} ({totalSavingsPercent}%)
          </span>
        ) : (
          <span style={{ color: config.secondaryColor }}>—</span>
        )}
      </td>
    </>
  );
}
