import { activeBrandConfig } from "../../config/brandConfig";
import type { CatalogProduct } from "../../data/catalogData";

interface PDPHeaderProps {
  product: CatalogProduct;
}

export default function PDPHeader({ product }: PDPHeaderProps) {
  const config = activeBrandConfig;

  return (
    <div>
      {/* Brand */}
      {product.brand && (
        <p
          className="text-[11px] font-semibold uppercase tracking-widest mb-1"
          style={{ color: config.secondaryColor }}
        >
          {product.brand}
        </p>
      )}

      {/* Title */}
      <h1 className="text-xl font-semibold mb-1" style={{ color: config.primaryColor }}>
        {product.name}
      </h1>

      {/* UPC */}
      <p className="text-xs mb-3" style={{ color: config.secondaryColor }}>
        UPC: {product.upc}
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

      {/* Base Price */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-lg font-semibold" style={{ color: config.primaryColor }}>
          ${product.price.toFixed(2)}
        </span>
        {product.originalPrice && (
          <span className="text-sm line-through" style={{ color: config.secondaryColor }}>
            ${product.originalPrice.toFixed(2)}
          </span>
        )}
        {product.unitMeasure && (
          <span className="text-xs" style={{ color: config.secondaryColor }}>
            {product.unitMeasure}
          </span>
        )}
      </div>

      {/* Tier Pricing */}
      {product.tierPricing && product.tierPricing.length > 1 && (
        <div className="mb-4">
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
                {tier.minQty}+ units: <span className="font-semibold">${tier.price.toFixed(2)}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Order constraints */}
      {((product.minOrderQty && product.minOrderQty > 1) || product.casePackQty) && (
        <div
          className="text-[11px] px-3 py-2 rounded-lg mb-4"
          style={{ backgroundColor: config.cardBg, color: config.secondaryColor }}
        >
          {product.minOrderQty && product.minOrderQty > 1 && (
            <span>Minimum order: <span className="font-medium">{product.minOrderQty} units</span></span>
          )}
          {product.minOrderQty && product.minOrderQty > 1 && product.casePackQty && <span className="mx-2">·</span>}
          {product.casePackQty && (
            <span>Case pack: <span className="font-medium">{product.casePackQty} units</span></span>
          )}
        </div>
      )}

      {/* Display Attributes */}
      {product.primaryDisplayAttributes && product.primaryDisplayAttributes.length > 0 && (
        <div className="space-y-1.5 mb-4">
          {product.primaryDisplayAttributes.map((attr) => (
            <div key={attr.label} className="flex items-center text-xs">
              <span className="w-20 shrink-0" style={{ color: config.secondaryColor }}>
                {attr.label}
              </span>
              <span className="font-medium" style={{ color: config.primaryColor }}>
                {attr.value}
              </span>
            </div>
          ))}
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
