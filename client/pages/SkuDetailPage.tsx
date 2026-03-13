import { useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { InputNumber, Button } from "antd";
import { ShoppingCartOutlined, DownOutlined, RightOutlined, TagOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../config/brandConfig";
import { getProductById, type CatalogProduct, type ProductVariant } from "../data/catalogData";
import { useOrder } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";
import { resolveVariantPricing, getEffectiveTierPricing } from "../utils/pricing";
import { getVariantPromotions } from "../context/PromotionContext";
import SkuPromotionPanel from "../components/promotions/SkuPromotionPanel";
import FulfillmentPanel from "../components/product-family/FulfillmentPanel";

export default function SkuDetailPage() {
  const config = activeBrandConfig;
  const { productId, variantId } = useParams<{ productId: string; variantId: string }>();
  const { addItem } = useOrder();
  const { isAuthenticated } = useAuth();

  const product = productId ? getProductById(decodeURIComponent(productId)) : null;
  const variant = product?.variants?.find((v) => v.id === variantId) || null;

  const [showPromoPanel, setShowPromoPanel] = useState(false);
  const handleOpenPromoPanel = useCallback(() => setShowPromoPanel(true), []);
  const handleClosePromoPanel = useCallback(() => setShowPromoPanel(false), []);

  if (!product || !variant) {
    return (
      <div className="max-w-content-wide mx-auto px-6 py-12 text-center">
        <h1 className="text-xl font-semibold mb-2" style={{ color: config.primaryColor }}>
          SKU Not Found
        </h1>
        <p className="text-sm mb-4" style={{ color: config.secondaryColor }}>
          The SKU you are looking for does not exist.
        </p>
        <Link to="/catalog" className="text-sm font-medium no-underline" style={{ color: config.primaryColor }}>
          &larr; Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-content-wide mx-auto px-6 py-8">
      <SkuBreadcrumb product={product} variant={variant} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        <div>
          <div
            className="w-full rounded-xl overflow-hidden"
            style={{ aspectRatio: "4/5", border: `1px solid ${config.borderColor}` }}
          >
            <img
              src={product.imageUrl}
              alt={`${product.name} - ${variant.sku}`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div>
          <SkuHeader product={product} variant={variant} onOpenPromoPanel={handleOpenPromoPanel} />
          <SkuOrderSection product={product} variant={variant} addItem={addItem} />
          <OfferDetailsSection product={product} variant={variant} />
          <FulfillmentSection variant={variant} />
          {product.specifications && product.specifications.length > 0 && (
            <SkuSpecifications specifications={product.specifications} />
          )}
        </div>
      </div>

      {/* SKU Promotion Selection Panel */}
      {isAuthenticated && showPromoPanel && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
            onClick={handleClosePromoPanel}
          />
          <aside
            className="fixed top-0 right-0 z-50 overflow-y-auto"
            style={{
              width: 420,
              height: "100vh",
              borderLeft: `1px solid ${config.borderColor}`,
              boxShadow: "-4px 0 24px rgba(0,0,0,0.1)",
            }}
          >
            <SkuPromotionPanel
              product={product}
              variant={variant}
              onClose={handleClosePromoPanel}
            />
          </aside>
        </>
      )}
    </div>
  );
}

// ── Breadcrumb ──────────────────────────────────────────────────────

function SkuBreadcrumb({ product, variant }: { product: CatalogProduct; variant: ProductVariant }) {
  const config = activeBrandConfig;

  return (
    <nav className="flex items-center gap-1.5 text-xs" style={{ color: config.secondaryColor }}>
      <Link to="/catalog" className="no-underline hover:underline" style={{ color: config.secondaryColor }}>
        Catalog
      </Link>
      <span>/</span>
      <Link
        to={`/product/${product.id}`}
        className="no-underline hover:underline"
        style={{ color: config.secondaryColor }}
      >
        {product.name}
      </Link>
      <span>/</span>
      <span className="font-medium" style={{ color: config.primaryColor }}>
        {variant.sku}
      </span>
    </nav>
  );
}

// ── SKU Header ──────────────────────────────────────────────────────

function SkuHeader({ product, variant, onOpenPromoPanel }: { product: CatalogProduct; variant: ProductVariant; onOpenPromoPanel?: () => void }) {
  const config = activeBrandConfig;
  const { isAuthenticated, showSignInModal } = useAuth();
  const pricing = resolveVariantPricing(variant, product);
  const promoCount = isAuthenticated ? getVariantPromotions(variant.id, product).length : 0;
  const variantDesc = Object.entries(variant.attributes)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");

  return (
    <div className="mb-6">
      {product.brand && (
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: config.secondaryColor }}>
          {product.brand}
        </p>
      )}
      <div className="flex items-center gap-1.5 mb-1">
        <h1 className="text-xl font-semibold" style={{ color: config.primaryColor }}>
          {product.name}
        </h1>
        {(() => {
          const allowedBadges = ["NEW", "LIMITED", "OFFER"];
          const badge = product.badges?.find((b) => allowedBadges.includes(b.label.toUpperCase()));
          if (!badge) return null;
          return (
            <span
              className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ backgroundColor: badge.bg || "#EEF2FF", color: badge.color || "#4338CA" }}
            >
              {badge.label}
            </span>
          );
        })()}
      </div>
      <p className="text-xs font-mono mb-2" style={{ color: config.secondaryColor }}>
        SKU: {variant.sku}
      </p>
      <p className="text-sm mb-3" style={{ color: config.primaryColor }}>
        {variantDesc}
      </p>

      {/* Pricing */}
      {!isAuthenticated ? (
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold" style={{ color: config.primaryColor }}>
              ${pricing.listPrice.toFixed(2)}
            </span>
            {product.unitMeasure && (
              <span className="text-xs" style={{ color: config.secondaryColor }}>{product.unitMeasure}</span>
            )}
          </div>
          <button
            onClick={() => showSignInModal("Sign in to view Special Price and promotions.")}
            className="text-xs mt-1 cursor-pointer bg-transparent border-none p-0 underline"
            style={{ color: "#2563EB" }}
          >
            Login to view Special Price
          </button>
        </div>
      ) : (
        <div className="mb-3">
          {/* Final Price — visually dominant */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xl font-bold" style={{ color: config.primaryColor }}>
              ${pricing.finalPrice.toFixed(2)}
            </span>
            {product.unitMeasure && (
              <span className="text-xs" style={{ color: config.secondaryColor }}>
                {product.unitMeasure}
              </span>
            )}
          </div>

          {/* Struck-through list price */}
          {pricing.hasSpecialPrice && (
            <span className="text-sm line-through" style={{ color: config.secondaryColor }}>
              ${pricing.listPrice.toFixed(2)}
            </span>
          )}

          {/* Savings */}
          {pricing.savings > 0 && (
            <p className="text-xs mt-1" style={{ color: "#16A34A" }}>
              You Save ${pricing.savings.toFixed(2)} ({pricing.savingsPercent}%)
            </p>
          )}

          {/* Promotions Available badge */}
          {promoCount > 0 && (
            <span
              onClick={onOpenPromoPanel}
              className="inline-flex items-center gap-1.5 text-xs font-semibold mt-2 px-3 py-1.5 rounded-full cursor-pointer transition-colors"
              style={{ backgroundColor: "#F0FDF4", color: "#16A34A" }}
            >
              <TagOutlined className="text-[11px]" />
              {promoCount} {promoCount === 1 ? "Promotion" : "Promotions"} Available
              <span className="text-[10px] ml-0.5">&#9662;</span>
            </span>
          )}
        </div>
      )}

      {/* Volume pricing (reflects final effective price) */}
      {isAuthenticated && (() => {
        const effectiveTiers = getEffectiveTierPricing(
          product.tierPricing,
          pricing.hasSpecialPrice ? pricing.specialPrice! / pricing.listPrice : undefined,
          pricing.promotionInfo?.discountPercent,
        );
        if (!effectiveTiers || effectiveTiers.length <= 1) return null;
        return (
          <div className="mb-3">
            <p className="text-[11px] font-semibold mb-1.5" style={{ color: config.secondaryColor }}>
              Volume Pricing
            </p>
            <div className="flex flex-wrap gap-2">
              {effectiveTiers.map((tier) => (
                <span
                  key={tier.minQty}
                  className="text-[11px] px-2.5 py-1 rounded-lg"
                  style={{
                    backgroundColor: config.cardBg,
                    color: config.primaryColor,
                    border: `1px solid ${config.borderColor}`,
                  }}
                >
                  {tier.minQty}+: <span className="font-semibold">${tier.price.toFixed(2)}</span>
                </span>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Guest tier pricing (list prices) */}
      {!isAuthenticated && product.tierPricing && product.tierPricing.length > 1 && (
        <div className="mb-3">
          <p className="text-[11px] font-semibold mb-1.5" style={{ color: config.secondaryColor }}>
            Volume Pricing
          </p>
          <div className="flex flex-wrap gap-2">
            {product.tierPricing.map((tier) => (
              <span
                key={tier.minQty}
                className="text-[11px] px-2.5 py-1 rounded-lg"
                style={{
                  backgroundColor: config.cardBg,
                  color: config.primaryColor,
                  border: `1px solid ${config.borderColor}`,
                }}
              >
                {tier.minQty}+: <span className="font-semibold">${tier.price.toFixed(2)}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {product.description && (
        <p className="text-xs leading-relaxed" style={{ color: config.secondaryColor }}>
          {product.description}
        </p>
      )}
    </div>
  );
}

// ── Offer Details Section ───────────────────────────────────────────

function OfferDetailsSection({ product, variant }: { product: CatalogProduct; variant: ProductVariant }) {
  const config = activeBrandConfig;
  const { isAuthenticated } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const promoInfo = variant.promotionInfo ?? product.promotionInfo;
  if (!isAuthenticated || !promoInfo) return null;

  return (
    <div
      className="rounded-xl mb-5 overflow-hidden"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 cursor-pointer bg-transparent border-none text-left"
        style={{ color: config.primaryColor }}
      >
        <span className="text-sm font-semibold">View Promotion Details</span>
        {expanded
          ? <DownOutlined className="text-[10px]" style={{ color: config.secondaryColor }} />
          : <RightOutlined className="text-[10px]" style={{ color: config.secondaryColor }} />}
      </button>

      {expanded && (
        <div className="px-5 pb-4 space-y-2.5">
          <DetailRow label="Promotion Type" value={promoInfo.label} />
          {promoInfo.minQty !== undefined && promoInfo.minQty > 1 && (
            <DetailRow label="Minimum Quantity" value={`${promoInfo.minQty} units`} />
          )}
          {promoInfo.validFrom && promoInfo.validTo && (
            <DetailRow label="Validity" value={`${promoInfo.validFrom} – ${promoInfo.validTo}`} />
          )}
          {promoInfo.scope && (
            <DetailRow label="Scope" value={promoInfo.scope === "sku" ? "SKU Level" : "Product Family"} />
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const config = activeBrandConfig;
  return (
    <div className="flex items-center text-xs" style={{ borderTop: `1px solid ${config.borderColor}`, paddingTop: 8 }}>
      <span className="w-36 shrink-0 font-medium" style={{ color: config.secondaryColor }}>{label}</span>
      <span style={{ color: config.primaryColor }}>{value}</span>
    </div>
  );
}

// ── Order Section ───────────────────────────────────────────────────

function SkuOrderSection({
  product,
  variant,
  addItem,
}: {
  product: CatalogProduct;
  variant: ProductVariant;
  addItem: ReturnType<typeof useOrder>["addItem"];
}) {
  const config = activeBrandConfig;
  const { isAuthenticated } = useAuth();
  const pricing = resolveVariantPricing(variant, product);
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

  const disabled = variant.availabilityStatus === "out-of-stock";

  return (
    <div
      className="rounded-xl p-5 mb-5"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      {(minQty > 1 || step > 1) && (
        <div className="text-[11px] mb-3" style={{ color: config.secondaryColor }}>
          {minQty > 1 && <span>Min order: {minQty} units</span>}
          {minQty > 1 && step > 1 && <span className="mx-2">·</span>}
          {step > 1 && <span>Case pack: {step} units</span>}
        </div>
      )}

      <div className="flex items-center gap-3">
        <InputNumber
          min={minQty}
          step={step}
          value={qty}
          onChange={handleQtyChange}
          disabled={disabled}
          style={{ width: 100 }}
        />
        <Button
          type="primary"
          size="large"
          icon={<ShoppingCartOutlined />}
          onClick={handleAdd}
          disabled={disabled}
          style={{
            flex: 1,
            height: 44,
            fontWeight: 600,
            borderRadius: 8,
            backgroundColor: disabled ? undefined : config.primaryColor,
          }}
        >
          Add to Cart
        </Button>
      </div>

      {disabled && (
        <p className="text-xs mt-2" style={{ color: "#DC2626" }}>
          This SKU is currently out of stock.
        </p>
      )}
    </div>
  );
}

// ── Fulfillment Section ─────────────────────────────────────────────

function FulfillmentSection({ variant }: { variant: ProductVariant }) {
  const config = activeBrandConfig;

  return (
    <div
      className="rounded-xl p-5 mb-5"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      <h3 className="text-sm font-semibold mb-3" style={{ color: config.primaryColor }}>
        Fulfillment
      </h3>
      <FulfillmentPanel variant={variant} />
    </div>
  );
}

// ── Specifications ──────────────────────────────────────────────────

function SkuSpecifications({ specifications }: { specifications: Array<{ label: string; value: string }> }) {
  const config = activeBrandConfig;

  return (
    <div
      className="rounded-xl p-5"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      <h3 className="text-sm font-semibold mb-3" style={{ color: config.primaryColor }}>
        Specifications
      </h3>
      <div className="divide-y" style={{ borderColor: config.borderColor }}>
        {specifications.map((spec) => (
          <div key={spec.label} className="flex items-center py-2.5 text-xs" style={{ borderColor: config.borderColor }}>
            <span className="w-36 shrink-0 font-medium" style={{ color: config.secondaryColor }}>
              {spec.label}
            </span>
            <span style={{ color: config.primaryColor }}>{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
