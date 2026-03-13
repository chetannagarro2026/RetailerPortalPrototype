import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Pagination } from "antd";
import { TagOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import Tag from "../ui/Tag";
import { activeBrandConfig } from "../../config/brandConfig";
import type { CatalogProduct } from "../../data/catalogData";
import { useAuth } from "../../context/AuthContext";
import { getFinalPriceRange, countProductPromotions, getProductPromotionLabels } from "../../utils/pricing";

const PAGE_SIZE = 20;

interface FamilyCardGridProps {
  products: CatalogProduct[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
}

export default function FamilyCardGrid({
  products,
  total,
  page,
  onPageChange,
}: FamilyCardGridProps) {
  const config = activeBrandConfig;

  if (products.length === 0) {
    return (
      <div
        className="text-center py-16 text-sm rounded-xl"
        style={{ color: config.secondaryColor, border: `1px solid ${config.borderColor}` }}
      >
        No product families match the current filters.
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <FamilyCard key={product.id} product={product} />
        ))}
      </div>

      {total > PAGE_SIZE && (
        <div className="flex justify-center mt-8">
          <Pagination
            current={page}
            total={total}
            pageSize={PAGE_SIZE}
            onChange={onPageChange}
            showSizeChanger={false}
            size="small"
          />
        </div>
      )}
    </div>
  );
}

// ── Family Card ─────────────────────────────────────────────────────

function FamilyCard({ product }: { product: CatalogProduct }) {
  const config = activeBrandConfig;
  const { isAuthenticated, showSignInModal } = useAuth();
  const familyLink = `/product/${product.id}`;
  const meta = useMemo(() => computeCardMeta(product, isAuthenticated), [product, isAuthenticated]);

  return (
    <Link
      to={familyLink}
      className="group rounded-xl overflow-hidden transition-shadow duration-200 hover:shadow-md flex flex-col no-underline"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      {/* Image */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4/5" }}>
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <BadgeStack badges={product.badges} />
        <AvailabilityBadge status={meta.aggregatedStatus} />
      </div>

      {/* Info */}
      <div className="p-3.5 flex flex-col flex-1">
        {product.brand && (
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-0.5"
            style={{ color: config.secondaryColor }}
          >
            {product.brand}
          </p>
        )}

        <p
          className="text-xs font-medium leading-snug mb-1 line-clamp-2"
          style={{ color: config.primaryColor }}
        >
          {product.name}
        </p>

        {/* Price Range */}
        <div className="mb-1.5 flex flex-col gap-0.5">
          {isAuthenticated && meta.listPriceLabel && (
            <p className="text-[10px] line-through mb-0" style={{ color: config.secondaryColor }}>
              {meta.listPriceLabel}
            </p>
          )}
          <p className="text-sm font-semibold" style={{ color: config.primaryColor, marginBottom: 2 }}>
            {meta.priceLabel}
          </p>
          {isAuthenticated && meta.promoCount > 0 && (
            <Tooltip
              title={
                <div>
                  <div className="text-[11px] font-semibold mb-1">Available Promotions</div>
                  {meta.promoLabels.map((label: string, i: number) => (
                    <div key={i} className="text-[11px]">&bull; {label}</div>
                  ))}
                  {meta.promoCount > 3 && (
                    <div className="text-[10px] mt-1 opacity-70">+{meta.promoCount - 3} more</div>
                  )}
                </div>
              }
              placement="bottom"
            >
              <span className="mt-0.5">
                <Tag variant="promotion" size="compact" icon={<TagOutlined />}>
                  {meta.promoCount} {meta.promoCount === 1 ? "Promotion" : "Promotions"}
                </Tag>
              </span>
            </Tooltip>
          )}
          {!isAuthenticated && (
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
          )}
        </div>

        {/* Attribute Summary */}
        {meta.attrSummary && (
          <p className="text-[10px] mb-1.5" style={{ color: config.secondaryColor }}>
            {meta.attrSummary}
          </p>
        )}

        {/* Footer: SKU count */}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: config.cardBg, color: config.primaryColor }}
          >
            {meta.skuCount} SKU{meta.skuCount !== 1 ? "s" : ""}
          </span>
          <span
            className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: config.primaryColor }}
          >
            View Family &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Badges ──────────────────────────────────────────────────────────

function BadgeStack({ badges }: { badges?: CatalogProduct["badges"] }) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
      {badges.map((b) => (
        <span
          key={b.label}
          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ backgroundColor: b.bg || "#EEF2FF", color: b.color || "#4338CA" }}
        >
          {b.label}
        </span>
      ))}
    </div>
  );
}

// ── Availability ────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  "low-stock": { label: "Low Stock", color: "#D97706" },
  "out-of-stock": { label: "Out of Stock", color: "#DC2626" },
  "pre-order": { label: "Pre-Order", color: "#7C3AED" },
};

function AvailabilityBadge({ status }: { status: string }) {
  if (status === "in-stock") return null;
  const cfg = STATUS_MAP[status];
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

// ── Helpers ─────────────────────────────────────────────────────────

function computeCardMeta(product: CatalogProduct, isAuthenticated: boolean) {
  const variants = product.variants || [];
  const skuCount = variants.length || 1;

  // Price range (use final prices when authenticated)
  const range = getFinalPriceRange(product, isAuthenticated);
  let priceLabel: string;
  if (range.min === range.max) {
    priceLabel = `$${range.min.toFixed(2)}`;
  } else {
    priceLabel = `$${range.min.toFixed(2)} – $${range.max.toFixed(2)}`;
  }

  // List price range for strikethrough
  let listPriceLabel: string | null = null;
  if (isAuthenticated) {
    let minList = Infinity;
    let maxList = -Infinity;
    if (variants.length === 0) {
      minList = maxList = product.price;
    } else {
      for (const v of variants) {
        if (v.price < minList) minList = v.price;
        if (v.price > maxList) maxList = v.price;
      }
    }
    if (minList !== range.min || maxList !== range.max) {
      listPriceLabel = minList === maxList
        ? `$${minList.toFixed(2)}`
        : `$${minList.toFixed(2)} – $${maxList.toFixed(2)}`;
    }
  }

  // Key attribute summary
  const parts: string[] = [];
  if (product.variantAttributes) {
    for (const attr of product.variantAttributes) {
      const count = attr.values.length;
      parts.push(`${count} ${attr.name}${count !== 1 ? "s" : ""}`);
    }
  }
  const attrSummary = parts.length > 0 ? parts.join(" · ") : "";

  // Aggregated availability from SKUs
  let aggregatedStatus = "in-stock";
  if (variants.length > 0) {
    const allOos = variants.every((v) => v.availabilityStatus === "out-of-stock");
    const someLow = variants.some((v) => v.availabilityStatus === "low-stock");
    if (allOos) aggregatedStatus = "out-of-stock";
    else if (someLow) aggregatedStatus = "low-stock";
  } else if (product.availabilityStatus) {
    aggregatedStatus = product.availabilityStatus;
  }

  const promoCount = countProductPromotions(product);
  const promoLabels = getProductPromotionLabels(product, 3);

  return { priceLabel, listPriceLabel, skuCount, attrSummary, aggregatedStatus, hasOffers: range.hasOffers, promoCount, promoLabels };
}
