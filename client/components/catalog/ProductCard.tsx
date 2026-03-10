import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { InputNumber } from "antd";
import { ShoppingCartOutlined, AppstoreOutlined } from "@ant-design/icons";
import { activeBrandConfig, type ProductCardVariant } from "../../config/brandConfig";
import { type CatalogProduct } from "../../data/catalogData";
import { useOrder } from "../../context/OrderContext";
import { useAuth } from "../../context/AuthContext";
import { resolveProductPricing, hasMixedPromotions, getEffectiveTierPricing } from "../../utils/pricing";
import QuickMatrix from "./QuickMatrix";

interface ProductCardProps {
  product: CatalogProduct;
  variant: ProductCardVariant;
  expandedCardId?: string | null;
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
  const { isAuthenticated, showSignInModal } = useAuth();
  const pricing = resolveProductPricing(product);
  const mixed = hasMixedPromotions(product);

  // Guest user: show list price + login nudge
  if (!isAuthenticated) {
    return (
      <div className={`${compact ? "mb-2" : "mb-3"}`}>
        <span
          className={`${compact ? "text-xs" : "text-sm"} font-semibold`}
          style={{ color: config.primaryColor }}
        >
          ${pricing.listPrice.toFixed(2)}
        </span>
        {product.unitMeasure && (
          <span className="text-[10px] ml-1" style={{ color: config.secondaryColor }}>
            {product.unitMeasure}
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            showSignInModal("Sign in to view Special Price and promotions.");
          }}
          className="block text-[10px] mt-0.5 cursor-pointer bg-transparent border-none p-0 underline"
          style={{ color: "#2563EB" }}
        >
          Login to view Special Price
        </button>
      </div>
    );
  }

  // Logged-in: show special price + promotion
  const hasPromo = pricing.hasPromotion;
  const effectiveTiers = showTiers
    ? getEffectiveTierPricing(
        product.tierPricing,
        pricing.hasSpecialPrice ? pricing.specialPrice! / pricing.listPrice : undefined,
        pricing.promotionInfo?.discountPercent,
      )
    : undefined;

  return (
    <div className={`${compact ? "mb-2" : "mb-3"}`}>
      <div className="flex items-baseline gap-2 flex-wrap">
        {/* Final price (dominant) */}
        <span
          className={`${compact ? "text-xs" : "text-sm"} font-semibold`}
          style={{ color: config.primaryColor }}
        >
          ${pricing.finalPrice.toFixed(2)}
        </span>
        {/* List price struck through */}
        <span className="text-[11px] line-through" style={{ color: config.secondaryColor }}>
          ${pricing.listPrice.toFixed(2)}
        </span>
        {product.unitMeasure && (
          <span className="text-[10px]" style={{ color: config.secondaryColor }}>
            {product.unitMeasure}
          </span>
        )}
      </div>

      {/* Promotion pill OR Special Price label */}
      {hasPromo ? (
        <span
          className="inline-block text-[10px] font-semibold mt-1 px-2 py-0.5 rounded-full"
          style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}
        >
          {pricing.promotionLabel}
        </span>
      ) : (
        <span className="block text-[10px] mt-0.5" style={{ color: "#16A34A" }}>
          Special Price
        </span>
      )}

      {/* Mixed SKU scenario */}
      {mixed && !hasPromo && (
        <span
          className="inline-block text-[10px] font-medium mt-1 px-2 py-0.5 rounded-full"
          style={{ backgroundColor: "#FFF7ED", color: "#9A3412" }}
        >
          Offers Available
        </span>
      )}

      {/* Volume pricing (reflects final effective price) */}
      {showTiers && effectiveTiers && effectiveTiers.length > 1 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {effectiveTiers.map((tier) => (
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
  const { addItem } = useOrder();
  const { isAuthenticated } = useAuth();
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
    const firstVariant = product.variants?.[0];
    const unitPrice = isAuthenticated
      ? (firstVariant?.finalPrice ?? firstVariant?.specialPrice ?? firstVariant?.price ?? product.finalPrice ?? product.specialPrice ?? product.price)
      : (firstVariant?.price ?? product.price);
    addItem({
      id: firstVariant?.id || product.id,
      productId: product.id,
      productName: product.name,
      sku: firstVariant?.sku || product.sku,
      variantAttributes: firstVariant?.attributes || {},
      quantity: qty,
      unitPrice,
      listPrice: firstVariant?.price ?? product.price,
      specialPrice: isAuthenticated ? (firstVariant?.specialPrice ?? product.specialPrice) : undefined,
      promotionLabel: isAuthenticated ? (firstVariant?.promotionLabel ?? product.promotionLabel) : undefined,
      imageUrl: product.imageUrl,
    });
  }, [qty, product, addItem, isAuthenticated]);

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
