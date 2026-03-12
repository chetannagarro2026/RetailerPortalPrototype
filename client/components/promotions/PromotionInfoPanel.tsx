import { CloseOutlined, TagOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import type { CatalogProduct, PromotionInfo } from "../../data/catalogData";

interface PromotionInfoPanelProps {
  product: CatalogProduct;
  onClose: () => void;
}

export default function PromotionInfoPanel({ product, onClose }: PromotionInfoPanelProps) {
  const config = activeBrandConfig;
  const promotions = product.promotions || [];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#fff" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 shrink-0"
        style={{ borderBottom: `1px solid ${config.borderColor}` }}
      >
        <div className="min-w-0">
          <h3 className="text-sm font-semibold mb-0.5" style={{ color: config.primaryColor }}>
            Promotions Available
          </h3>
          <p className="text-[11px]" style={{ color: config.secondaryColor }}>
            {product.name} &middot; {promotions.length} promotion{promotions.length !== 1 ? "s" : ""}
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

      {/* Promotion Cards */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {promotions.map((promo) => (
          <PromotionCard key={promo.id} promo={promo} product={product} />
        ))}
        {promotions.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: config.secondaryColor }}>
            No promotions available for this product.
          </p>
        )}
      </div>
    </div>
  );
}

function PromotionCard({ promo, product }: { promo: PromotionInfo; product: CatalogProduct }) {
  const config = activeBrandConfig;
  const variants = product.variants || [];

  // Determine eligible SKU labels
  const eligibleSkus = promo.eligibleVariantIds
    ? variants
        .filter((v) => promo.eligibleVariantIds!.includes(v.id))
        .map((v) => Object.values(v.attributes).join(" "))
    : null; // null = all SKUs

  return (
    <div
      className="rounded-lg p-4"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: config.cardBg }}
    >
      {/* Title + type badge */}
      <div className="flex items-center gap-2 mb-2">
        <TagOutlined className="text-xs" style={{ color: "#4338CA" }} />
        <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
          {promo.label}
        </span>
        <TypeBadge type={promo.type} />
      </div>

      {promo.description && (
        <p className="text-[11px] mb-3" style={{ color: config.secondaryColor }}>
          {promo.description}
        </p>
      )}

      {/* Eligible SKUs */}
      <div className="mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: config.secondaryColor }}>
          Applicable SKUs
        </p>
        {eligibleSkus ? (
          <div className="flex flex-wrap gap-1">
            {eligibleSkus.slice(0, 8).map((label, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded"
                style={{ backgroundColor: "#fff", color: config.primaryColor, border: `1px solid ${config.borderColor}` }}
              >
                {label}
              </span>
            ))}
            {eligibleSkus.length > 8 && (
              <span className="text-[10px] px-2 py-0.5" style={{ color: config.secondaryColor }}>
                +{eligibleSkus.length - 8} more
              </span>
            )}
          </div>
        ) : (
          <span className="text-[10px]" style={{ color: config.secondaryColor }}>
            All SKUs in this product family
          </span>
        )}
      </div>

      {/* Rules */}
      {promo.rules && promo.rules.length > 0 && (
        <div>
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

      {/* Validity */}
      {promo.validFrom && promo.validTo && (
        <p className="text-[10px] mt-2" style={{ color: config.secondaryColor }}>
          Valid: {promo.validFrom} &ndash; {promo.validTo}
        </p>
      )}
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    discount: { bg: "#F0F4FF", color: "#4338CA", label: "Discount" },
    "free-goods": { bg: "#F0FDF4", color: "#166534", label: "Free Goods" },
    bogo: { bg: "#FFF7ED", color: "#9A3412", label: "BOGO" },
  };
  const s = styles[type] || styles.discount;
  return (
    <span
      className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}
