import { TagOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import type { CatalogProduct } from "../../data/catalogData";
import { useAuth } from "../../context/AuthContext";
import { resolveProductPricing, getEffectiveTierPricing, countProductPromotions } from "../../utils/pricing";

interface PDPHeaderProps {
  product: CatalogProduct;
}

export default function PDPHeader({ product }: PDPHeaderProps) {
  const config = activeBrandConfig;
  const { isAuthenticated, showSignInModal } = useAuth();
  const pricing = resolveProductPricing(product);

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

      {/* SKU */}
      <p className="text-xs mb-3" style={{ color: config.secondaryColor }}>
        SKU: {product.sku}
      </p>


      {/* Promotions Available Badge */}
      {isAuthenticated && countProductPromotions(product) > 0 && (
        <div className="mb-3">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full cursor-default"
            style={{ backgroundColor: "#F0FDF4", color: "#16A34A" }}
          >
            <TagOutlined className="text-[11px]" />
            {countProductPromotions(product)} {countProductPromotions(product) === 1 ? "Promotion" : "Promotions"} Available
          </span>
        </div>
      )}

      {/* Pricing */}
      <PdpPricingBlock
        pricing={pricing}
        product={product}
        isAuthenticated={isAuthenticated}
        showSignInModal={showSignInModal}
      />

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

// ── PDP Pricing Block ───────────────────────────────────────────────

function PdpPricingBlock({
  pricing,
  product,
  isAuthenticated,
  showSignInModal,
}: {
  pricing: ReturnType<typeof resolveProductPricing>;
  product: CatalogProduct;
  isAuthenticated: boolean;
  showSignInModal: (msg: string) => void;
}) {
  const config = activeBrandConfig;

  // Guest view
  if (!isAuthenticated) {
    return (
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold" style={{ color: config.primaryColor }}>
            ${pricing.listPrice.toFixed(2)}
          </span>
          {product.unitMeasure && (
            <span className="text-xs" style={{ color: config.secondaryColor }}>
              {product.unitMeasure}
            </span>
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
    );
  }

  // Logged-in view
  const effectiveTiers = getEffectiveTierPricing(
    product.tierPricing,
    pricing.hasSpecialPrice ? pricing.specialPrice! / pricing.listPrice : undefined,
    pricing.promotionInfo?.discountPercent,
  );

  return (
    <div className="mb-4">
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

      {/* Savings line */}
      {pricing.savings > 0 && (
        <p className="text-xs mt-1" style={{ color: "#16A34A" }}>
          You Save ${pricing.savings.toFixed(2)} ({pricing.savingsPercent}%)
        </p>
      )}

      {/* Compact inline promotion pill — below savings */}
      {pricing.hasPromotion && (
        <span
          className="inline-block text-[10px] font-medium mt-1.5 px-2.5 py-0.5 rounded-full"
          style={{ backgroundColor: "#F0F4FF", color: "#4338CA" }}
        >
          {pricing.promotionLabel} applied
        </span>
      )}

      {/* Volume Pricing (reflects final effective price) */}
      {effectiveTiers && effectiveTiers.length > 1 && (
        <div className="mt-3">
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
                {tier.minQty}+ units: <span className="font-semibold">${tier.price.toFixed(2)}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
