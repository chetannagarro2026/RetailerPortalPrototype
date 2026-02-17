import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { InputNumber, App } from "antd";
import { ShoppingCartOutlined, AppstoreOutlined } from "@ant-design/icons";
import { activeBrandConfig, type ProductCardVariant } from "../../config/brandConfig";
import { type CatalogProduct } from "../../data/catalogData";
import QuickMatrix from "./QuickMatrix";

interface ProductCardProps {
  product: CatalogProduct;
  variant: ProductCardVariant;
  /** ID of the currently expanded quick-matrix card (only one at a time) */
  expandedCardId?: string | null;
  /** Callback to expand/collapse quick matrix */
  onToggleExpand?: (productId: string | null) => void;
}

export default function ProductCard({ product, variant, expandedCardId, onToggleExpand }: ProductCardProps) {
  const isExpanded = expandedCardId === product.id;

  switch (variant) {
    case "compact":
      return <CompactCard product={product} isExpanded={isExpanded} onToggleExpand={onToggleExpand} />;
    case "detailed":
      return <DetailedCard product={product} isExpanded={isExpanded} onToggleExpand={onToggleExpand} />;
    default:
      return <StandardCard product={product} isExpanded={isExpanded} onToggleExpand={onToggleExpand} />;
  }
}

// ── Quick Matrix Toggle Button ──────────────────────────────────────

function QuickMatrixToggle({
  product,
  isExpanded,
  onToggle,
}: {
  product: CatalogProduct;
  isExpanded: boolean;
  onToggle?: (id: string | null) => void;
}) {
  const config = activeBrandConfig;
  const canShow =
    config.enableQuickMatrixInGrid &&
    product.variants &&
    product.variantAttributes &&
    product.variantAttributes.length > 0 &&
    product.variants.length <= config.quickMatrixVariantLimit;

  if (!canShow) return null;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle?.(isExpanded ? null : product.id);
      }}
      className="text-[10px] font-medium flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer transition-colors mb-1"
      style={{
        backgroundColor: isExpanded ? config.primaryColor : "transparent",
        color: isExpanded ? "#fff" : config.secondaryColor,
        border: `1px solid ${isExpanded ? config.primaryColor : config.borderColor}`,
      }}
    >
      <AppstoreOutlined className="text-[9px]" />
      {isExpanded ? "Close Matrix" : "Quick Order"}
    </button>
  );
}

// ── Standard Variant ────────────────────────────────────────────────

function StandardCard({ product, isExpanded, onToggleExpand }: { product: CatalogProduct; isExpanded: boolean; onToggleExpand?: (id: string | null) => void }) {
  const config = activeBrandConfig;

  return (
    <div
      className="group rounded-xl overflow-hidden transition-shadow duration-200 hover:shadow-md flex flex-col"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      <ProductImage product={product} aspectRatio="4/5" />

      <div className="p-3.5 flex flex-col flex-1">
        <ProductMeta product={product} maxAttributes={2} />
        <PricingBlock product={product} />
        <QuickMatrixToggle product={product} isExpanded={isExpanded} onToggle={onToggleExpand} />
        <QuantityAddBlock product={product} />
      </div>

      {isExpanded && (
        <QuickMatrix product={product} onClose={() => onToggleExpand?.(null)} />
      )}
    </div>
  );
}

// ── Compact Variant ─────────────────────────────────────────────────

function CompactCard({ product, isExpanded, onToggleExpand }: { product: CatalogProduct; isExpanded: boolean; onToggleExpand?: (id: string | null) => void }) {
  const config = activeBrandConfig;

  return (
    <div
      className="group rounded-lg overflow-hidden transition-shadow duration-200 hover:shadow-md flex flex-col"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      <ProductImage product={product} aspectRatio="1/1" />

      <div className="p-2.5 flex flex-col flex-1">
        <ProductMeta product={product} maxAttributes={0} compact />
        <PricingBlock product={product} compact />
        <QuickMatrixToggle product={product} isExpanded={isExpanded} onToggle={onToggleExpand} />
        <QuantityAddBlock product={product} compact />
      </div>

      {isExpanded && (
        <QuickMatrix product={product} onClose={() => onToggleExpand?.(null)} />
      )}
    </div>
  );
}

// ── Detailed Variant ────────────────────────────────────────────────

function DetailedCard({ product, isExpanded, onToggleExpand }: { product: CatalogProduct; isExpanded: boolean; onToggleExpand?: (id: string | null) => void }) {
  const config = activeBrandConfig;

  return (
    <div
      className="group rounded-xl overflow-hidden transition-shadow duration-200 hover:shadow-md flex flex-col"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      <ProductImage product={product} aspectRatio="4/5" />

      <div className="p-4 flex flex-col flex-1">
        <ProductMeta product={product} maxAttributes={4} />
        <PricingBlock product={product} showTiers />
        <QuickMatrixToggle product={product} isExpanded={isExpanded} onToggle={onToggleExpand} />
        <QuantityAddBlock product={product} />
      </div>

      {isExpanded && (
        <QuickMatrix product={product} onClose={() => onToggleExpand?.(null)} />
      )}
    </div>
  );
}

// ── Shared: Product Image ───────────────────────────────────────────

function ProductImage({
  product,
  aspectRatio,
}: {
  product: CatalogProduct;
  aspectRatio: string;
}) {
  return (
    <Link to={`/product/${product.id}`} className="block relative w-full overflow-hidden" style={{ aspectRatio }}>
      <img
        src={product.imageUrl}
        alt={product.name}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <BadgeStack badges={product.badges} />
      <AvailabilityIndicator status={product.availabilityStatus} />
    </Link>
  );
}

// ── Shared: Badge Stack ─────────────────────────────────────────────

function BadgeStack({ badges }: { badges?: CatalogProduct["badges"] }) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
      {badges.map((b) => (
        <span
          key={b.label}
          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: b.bg || "#EEF2FF",
            color: b.color || "#4338CA",
          }}
        >
          {b.label}
        </span>
      ))}
    </div>
  );
}

// ── Shared: Availability Indicator ──────────────────────────────────

const availabilityConfig: Record<string, { label: string; color: string }> = {
  "low-stock": { label: "Low Stock", color: "#D97706" },
  "out-of-stock": { label: "Out of Stock", color: "#DC2626" },
  "pre-order": { label: "Pre-Order", color: "#7C3AED" },
};

function AvailabilityIndicator({ status }: { status?: CatalogProduct["availabilityStatus"] }) {
  if (!status || status === "in-stock") return null;
  const cfg = availabilityConfig[status];
  if (!cfg) return null;

  return (
    <span
      className="absolute bottom-2 left-2.5 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
      style={{ backgroundColor: cfg.color, color: "#fff" }}
    >
      {cfg.label}
    </span>
  );
}

// ── Shared: Product Meta (name, sku, brand, attributes) ─────────────

function ProductMeta({
  product,
  maxAttributes,
  compact,
}: {
  product: CatalogProduct;
  maxAttributes: number;
  compact?: boolean;
}) {
  const config = activeBrandConfig;
  const attrs = (product.primaryDisplayAttributes || []).slice(0, maxAttributes);

  return (
    <div className="mb-2">
      {product.brand && (
        <p
          className={`${compact ? "text-[9px]" : "text-[10px]"} font-semibold uppercase tracking-widest mb-0.5`}
          style={{ color: config.secondaryColor }}
        >
          {product.brand}
        </p>
      )}
      <Link
        to={`/product/${product.id}`}
        className={`${compact ? "text-[11px]" : "text-xs"} font-medium leading-snug mb-0.5 line-clamp-2 no-underline hover:underline block`}
        style={{ color: config.primaryColor }}
      >
        {product.name}
      </Link>
      <p className={`${compact ? "text-[10px]" : "text-[11px]"} mb-0`} style={{ color: config.secondaryColor }}>
        {product.sku}
      </p>

      {attrs.length > 0 && (
        <div className="flex flex-wrap gap-x-3 mt-1">
          {attrs.map((attr) => (
            <span key={attr.label} className="text-[11px]" style={{ color: config.secondaryColor }}>
              {attr.label}: <span className="font-medium">{attr.value}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Shared: Pricing Block ───────────────────────────────────────────

function PricingBlock({
  product,
  compact,
  showTiers,
}: {
  product: CatalogProduct;
  compact?: boolean;
  showTiers?: boolean;
}) {
  const config = activeBrandConfig;

  return (
    <div className={`${compact ? "mb-2" : "mb-3"}`}>
      <div className="flex items-baseline gap-2">
        <span
          className={`${compact ? "text-xs" : "text-sm"} font-semibold`}
          style={{ color: config.primaryColor }}
        >
          ${product.price.toFixed(2)}
        </span>
        {product.originalPrice && (
          <span className="text-[11px] line-through" style={{ color: config.secondaryColor }}>
            ${product.originalPrice.toFixed(2)}
          </span>
        )}
        {product.unitMeasure && (
          <span className="text-[10px]" style={{ color: config.secondaryColor }}>
            {product.unitMeasure}
          </span>
        )}
      </div>

      {showTiers && product.tierPricing && product.tierPricing.length > 1 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {product.tierPricing.map((tier) => (
            <span
              key={tier.minQty}
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: config.cardBg,
                color: config.secondaryColor,
                border: `1px solid ${config.borderColor}`,
              }}
            >
              {tier.minQty}+: ${tier.price.toFixed(2)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Shared: Quantity + Add to Order ─────────────────────────────────

function QuantityAddBlock({
  product,
  compact,
}: {
  product: CatalogProduct;
  compact?: boolean;
}) {
  const config = activeBrandConfig;
  const { message } = App.useApp();
  const minQty = product.minOrderQty || 1;
  const step = product.casePackQty || 1;
  const [qty, setQty] = useState<number>(minQty);

  const handleQtyChange = useCallback(
    (value: number | null) => {
      if (value === null) return;
      const snapped = Math.max(minQty, Math.round(value / step) * step || step);
      setQty(snapped);
    },
    [minQty, step],
  );

  const handleAdd = useCallback(() => {
    message.success({ content: `${qty}× ${product.name} added to order`, duration: 2 });
  }, [qty, product.name, message]);

  const disabled = product.availabilityStatus === "out-of-stock";

  return (
    <div className="mt-auto">
      {(minQty > 1 || step > 1) && (
        <p className="text-[10px] mb-1" style={{ color: config.secondaryColor }}>
          {minQty > 1 && `Min: ${minQty}`}
          {minQty > 1 && step > 1 && " · "}
          {step > 1 && `Case pack: ${step}`}
        </p>
      )}
      <div className="flex items-center gap-2">
        <InputNumber
          min={minQty}
          max={9999}
          step={step}
          value={qty}
          onChange={handleQtyChange}
          size="small"
          className={compact ? "w-14" : "w-16"}
          disabled={disabled}
        />
        <button
          onClick={handleAdd}
          disabled={disabled}
          className={`flex-1 flex items-center justify-center gap-1.5 ${compact ? "text-[10px] py-1" : "text-[11px] py-1.5"} font-medium rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          style={{
            backgroundColor: disabled ? config.secondaryColor : config.primaryColor,
            color: "#fff",
            border: "none",
          }}
        >
          <ShoppingCartOutlined className="text-xs" />
          Add to Order
        </button>
      </div>
    </div>
  );
}
