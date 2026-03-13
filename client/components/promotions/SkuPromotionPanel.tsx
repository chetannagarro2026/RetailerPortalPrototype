import { CloseOutlined, CheckCircleFilled, TagOutlined, StarFilled } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import Tag from "../ui/Tag";
import type { CatalogProduct, ProductVariant, PromotionInfo } from "../../data/catalogData";
import { usePromotions, getVariantPromotions } from "../../context/PromotionContext";

interface SkuPromotionPanelProps {
  product: CatalogProduct;
  variant: ProductVariant;
  onClose: () => void;
}

/** Compute per-unit savings for a promotion */
function computePromoSavings(promo: PromotionInfo, basePrice: number): number {
  if (promo.type === "discount" && promo.discountPercent) {
    return Math.round(basePrice * (promo.discountPercent / 100) * 100) / 100;
  }
  if ((promo.type === "bogo" || promo.type === "free-goods") && promo.freeQty && promo.qualifyingQty) {
    const effectiveDiscount = promo.freeQty / (promo.qualifyingQty + promo.freeQty);
    return Math.round(basePrice * effectiveDiscount * 100) / 100;
  }
  return 0;
}

/** Find the promotion index with highest savings */
function findRecommendedIndex(promotions: PromotionInfo[], basePrice: number): number {
  if (promotions.length === 0) return -1;
  let bestIdx = 0;
  let bestSavings = computePromoSavings(promotions[0], basePrice);
  for (let i = 1; i < promotions.length; i++) {
    const s = computePromoSavings(promotions[i], basePrice);
    if (s > bestSavings) {
      bestSavings = s;
      bestIdx = i;
    }
  }
  return bestSavings > 0 ? bestIdx : -1;
}

export default function SkuPromotionPanel({ product, variant, onClose }: SkuPromotionPanelProps) {
  const config = activeBrandConfig;
  const { getAppliedPromotion, applyPromotion, removePromotion } = usePromotions();
  const promotions = getVariantPromotions(variant.id, product);
  const appliedPromo = getAppliedPromotion(variant.id);
  const basePrice = variant.specialPrice ?? variant.price;
  const recommendedIdx = findRecommendedIndex(promotions, basePrice);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#fff" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 shrink-0"
        style={{ borderBottom: `1px solid ${config.borderColor}` }}
      >
        <div className="min-w-0">
          <h3 className="text-sm font-semibold mb-0.5" style={{ color: config.primaryColor }}>
            Select Promotion
          </h3>
          <p className="text-[11px] font-mono" style={{ color: config.secondaryColor }}>
            SKU: {variant.sku}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md cursor-pointer"
          style={{ border: "none", background: "transparent", color: config.secondaryColor }}
          aria-label="Close"
        >
          <CloseOutlined className="text-sm" />
        </button>
      </div>

      {/* Variant info */}
      <div className="px-5 py-3 shrink-0" style={{ borderBottom: `1px solid ${config.borderColor}`, backgroundColor: config.cardBg }}>
        <p className="text-[11px]" style={{ color: config.secondaryColor }}>
          {Object.entries(variant.attributes).map(([k, v]) => `${k}: ${v}`).join(" · ")}
        </p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
            ${basePrice.toFixed(2)}
          </span>
          {variant.specialPrice && variant.specialPrice < variant.price && (
            <span className="text-[11px] line-through" style={{ color: config.secondaryColor }}>
              ${variant.price.toFixed(2)}
            </span>
          )}
          <span className="text-[10px]" style={{ color: config.secondaryColor }}>per unit</span>
        </div>
      </div>

      {/* Promotion Cards */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {promotions.map((promo, idx) => {
          const isApplied = appliedPromo?.id === promo.id;
          const isRecommended = idx === recommendedIdx;
          return (
            <SkuPromoCard
              key={promo.id}
              promo={promo}
              basePrice={basePrice}
              isApplied={isApplied}
              isRecommended={isRecommended}
              onApply={() => applyPromotion(variant.id, promo)}
              onRemove={() => removePromotion(variant.id)}
            />
          );
        })}
        {promotions.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: config.secondaryColor }}>
            No promotions available for this SKU.
          </p>
        )}
      </div>
    </div>
  );
}

function SkuPromoCard({
  promo,
  basePrice,
  isApplied,
  isRecommended,
  onApply,
  onRemove,
}: {
  promo: PromotionInfo;
  basePrice: number;
  isApplied: boolean;
  isRecommended: boolean;
  onApply: () => void;
  onRemove: () => void;
}) {
  const config = activeBrandConfig;

  // Compute savings info
  let savingsText = "";
  if (promo.type === "discount" && promo.discountPercent) {
    const savingsPerUnit = Math.round(basePrice * (promo.discountPercent / 100) * 100) / 100;
    savingsText = `Save $${savingsPerUnit.toFixed(2)} per unit`;
  } else if ((promo.type === "bogo" || promo.type === "free-goods") && promo.freeQty && promo.qualifyingQty) {
    const effectiveDiscount = Math.round((promo.freeQty / (promo.qualifyingQty + promo.freeQty)) * 100);
    savingsText = `Effective discount ~${effectiveDiscount}%`;
  }

  // Applied = orange border, available = default
  const appliedBorderColor = "#EA580C";

  return (
    <div
      className="rounded-lg p-4 transition-colors"
      style={{
        border: isApplied ? `2px solid ${appliedBorderColor}` : `1px solid ${config.borderColor}`,
        backgroundColor: isApplied ? "#FFF7ED" : "#fff",
      }}
    >
      {/* Title row */}
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <TagOutlined className="text-xs" style={{ color: isApplied ? "#EA580C" : "#4338CA" }} />
        <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
          {promo.label}
        </span>
        {isRecommended && !isApplied && (
          <Tag variant="recommended" size="compact" icon={<StarFilled />}>
            Recommended
          </Tag>
        )}
        {isApplied && (
          <CheckCircleFilled className="text-xs" style={{ color: "#EA580C" }} />
        )}
      </div>

      {/* Savings */}
      {savingsText && (
        <p className="text-[11px] font-medium mb-2" style={{ color: "#16A34A" }}>
          {savingsText}
        </p>
      )}

      {/* Description */}
      {promo.description && (
        <p className="text-[11px] mb-2" style={{ color: config.secondaryColor }}>
          {promo.description}
        </p>
      )}

      {/* Rules */}
      {promo.rules && promo.rules.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: config.secondaryColor }}>
            Rules
          </p>
          <ul className="list-none p-0 m-0 space-y-0.5">
            {promo.rules.map((rule, i) => (
              <li key={i} className="text-[11px] flex items-start gap-1.5" style={{ color: config.primaryColor }}>
                <span style={{ color: config.secondaryColor }}>&bull;</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Apply / Remove button */}
      {isApplied ? (
        <button
          onClick={onRemove}
          className="w-full text-[11px] font-semibold py-2 rounded-lg cursor-pointer transition-colors"
          style={{
            backgroundColor: "transparent",
            color: "#DC2626",
            border: `1px solid #FECACA`,
          }}
        >
          Remove Promotion
        </button>
      ) : (
        <button
          onClick={onApply}
          className="w-full text-[11px] font-semibold py-2 rounded-lg cursor-pointer transition-colors"
          style={{
            backgroundColor: config.primaryColor,
            color: "#fff",
            border: "none",
          }}
        >
          Apply
        </button>
      )}
    </div>
  );
}
