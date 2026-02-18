import { useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { InputNumber, Button } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../config/brandConfig";
import { getProductById, type CatalogProduct, type ProductVariant } from "../data/catalogData";
import { useOrder } from "../context/OrderContext";
import FulfillmentPanel from "../components/product-family/FulfillmentPanel";

export default function SkuDetailPage() {
  const config = activeBrandConfig;
  const { productId, variantId } = useParams<{ productId: string; variantId: string }>();
  const { addItem } = useOrder();

  const product = productId ? getProductById(decodeURIComponent(productId)) : null;
  const variant = product?.variants?.find((v) => v.id === variantId) || null;

  if (!product || !variant) {
    return (
      <div className="max-w-content mx-auto px-6 py-12 text-center">
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
    <div className="max-w-content mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <SkuBreadcrumb product={product} variant={variant} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        {/* Left: Image */}
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

        {/* Right: SKU Details */}
        <div>
          <SkuHeader product={product} variant={variant} />
          <SkuOrderSection product={product} variant={variant} addItem={addItem} />
          <FulfillmentSection variant={variant} />
          {product.specifications && product.specifications.length > 0 && (
            <SkuSpecifications specifications={product.specifications} />
          )}
        </div>
      </div>
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

function SkuHeader({ product, variant }: { product: CatalogProduct; variant: ProductVariant }) {
  const config = activeBrandConfig;
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
      <h1 className="text-xl font-semibold mb-1" style={{ color: config.primaryColor }}>
        {product.name}
      </h1>
      <p className="text-xs font-mono mb-2" style={{ color: config.secondaryColor }}>
        SKU: {variant.sku}
      </p>
      <p className="text-sm mb-3" style={{ color: config.primaryColor }}>
        {variantDesc}
      </p>

      {/* Badges */}
      {product.badges && product.badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {product.badges.map((b) => (
            <span
              key={b.label}
              className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ backgroundColor: b.bg || "#EEF2FF", color: b.color || "#4338CA" }}
            >
              {b.label}
            </span>
          ))}
        </div>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-lg font-semibold" style={{ color: config.primaryColor }}>
          ${variant.price.toFixed(2)}
        </span>
        {product.unitMeasure && (
          <span className="text-xs" style={{ color: config.secondaryColor }}>
            {product.unitMeasure}
          </span>
        )}
      </div>

      {/* Tier pricing */}
      {product.tierPricing && product.tierPricing.length > 1 && (
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

      {/* Description */}
      {product.description && (
        <p className="text-xs leading-relaxed" style={{ color: config.secondaryColor }}>
          {product.description}
        </p>
      )}
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
    addItem({
      id: variant.id,
      productId: product.id,
      productName: product.name,
      sku: variant.sku,
      variantAttributes: variant.attributes,
      quantity: qty,
      unitPrice: variant.price,
      imageUrl: product.imageUrl,
    });
  }, [variant, product, qty, addItem]);

  const disabled = variant.availabilityStatus === "out-of-stock";

  return (
    <div
      className="rounded-xl p-5 mb-5"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      {/* Constraints */}
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
