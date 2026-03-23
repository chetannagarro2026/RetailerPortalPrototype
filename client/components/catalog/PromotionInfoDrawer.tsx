import { Drawer } from "antd";
import { CheckCircleFilled, PercentageOutlined, SwapOutlined, PlusOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import type { PromotionInfo, PromotionBenefit } from "../../data/catalogData";

interface PromotionInfoDrawerProps {
  open: boolean;
  onClose: () => void;
  productName: string;
  promotions: PromotionInfo[];
}

export default function PromotionInfoDrawer({
  open,
  onClose,
  productName,
  promotions,
}: PromotionInfoDrawerProps) {
  const config = activeBrandConfig;

  return (
    <Drawer
      title={
        <span className="text-base font-semibold" style={{ color: config.primaryColor }}>
          Promotions — {productName}
        </span>
      }
      placement="right"
      width={400}
      open={open}
      onClose={onClose}
      styles={{ body: { padding: "16px 20px", display: "flex", flexDirection: "column" } }}
    >
      {/* Info note — just below title */}
      <div
        className="flex items-center gap-1.5 pb-3 mb-3"
        style={{ borderBottom: `1px solid ${config.borderColor}` }}
      >
        <CheckCircleFilled style={{ fontSize: 14, color: "#0D7A4A", flexShrink: 0 }} />
        <span className="text-xs font-medium" style={{ color: "#0D7A4A" }}>
          Best promotion is applied automatically when added to cart
        </span>
      </div>

      <div className="flex-1 space-y-3">
        {promotions.length === 0 && (
          <p className="text-xs py-4" style={{ color: config.secondaryColor }}>
            No promotions available for this product.
          </p>
        )}

        {promotions.map((promo) => (
          <PromoInfoCard key={promo.id} promo={promo} />
        ))}
      </div>
    </Drawer>
  );
}

// ── Promo Card ──────────────────────────────────────────────────────

function PromoInfoCard({ promo }: { promo: PromotionInfo }) {
  const config = activeBrandConfig;
  const hasBenefits = promo.benefits && promo.benefits.length > 0;
  const benefitCount = promo.benefits?.length ?? 0;

  // For multi-benefit cards: only show validity + scope chips (no shared conditions)
  // For single-benefit cards: show all chips as before
  const conditionChips: string[] = [];

  if (!hasBenefits) {
    // Single-benefit: keep existing chip logic
    if (promo.minQty && promo.minQty > 1) conditionChips.push(`Min: ${promo.minQty} units`);
    if (promo.qualifyingQty && promo.freeQty) {
      conditionChips.push(`Buy ${promo.qualifyingQty} Get ${promo.freeQty} Free`);
    }
  }

  // Validity + scope always shown
  if (promo.validFrom || promo.validTo) {
    const from = promo.validFrom ? new Date(promo.validFrom).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "";
    const to = promo.validTo ? new Date(promo.validTo).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "";
    if (from && to) conditionChips.push(`Valid: ${from} – ${to}`);
    else if (from) conditionChips.push(`From: ${from}`);
    else if (to) conditionChips.push(`Until: ${to}`);
  }
  if (promo.scope) conditionChips.push(`Scope: ${promo.scope === "sku" ? "SKU Level" : "Family Level"}`);

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        border: `1px solid ${config.borderColor}`,
        backgroundColor: "#fff",
      }}
    >
      {/* Card Header */}
      <div className="px-4 py-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
              {promo.label}
            </span>
            {hasBenefits && (
              <span
                className="shrink-0 text-[11px] font-medium rounded-full px-2 py-0.5"
                style={{
                  backgroundColor: "#E6F1FB",
                  color: "#185FA5",
                  border: "1px solid #85B7EB",
                }}
              >
                {benefitCount} benefit{benefitCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          {promo.promoCode && (
            <span
              className="shrink-0 text-[10px] font-semibold rounded px-2 py-0.5"
              style={{
                backgroundColor: config.cardBg,
                color: config.secondaryColor,
                border: `1px solid ${config.borderColor}`,
              }}
            >
              {promo.promoCode}
            </span>
          )}
        </div>

        {promo.description && (
          <p className="text-xs mt-1" style={{ color: config.secondaryColor }}>
            {promo.description}
          </p>
        )}

        {/* Rules — only for single-benefit cards */}
        {!hasBenefits && promo.rules && promo.rules.length > 0 && (
          <div className="mt-1.5">
            {promo.rules.map((rule, i) => (
              <p key={i} className="text-[11px]" style={{ color: config.secondaryColor }}>
                • {rule}
              </p>
            ))}
          </div>
        )}

        {conditionChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {conditionChips.map((chip) => (
              <span
                key={chip}
                className="text-[11px] px-2 py-0.5 rounded"
                style={{
                  backgroundColor: config.cardBg,
                  color: config.secondaryColor,
                  border: `1px solid ${config.borderColor}`,
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Included Benefits Section — only for multi-benefit promos */}
      {hasBenefits && (
        <BenefitsSection benefits={promo.benefits!} />
      )}
    </div>
  );
}

// ── Benefits Section (shared — exported for CartPromotionsSection) ──

export function BenefitsSection({ benefits }: { benefits: PromotionBenefit[] }) {
  const config = activeBrandConfig;

  return (
    <div
      style={{
        backgroundColor: config.cardBg,
        borderTop: `1px solid ${config.borderColor}`,
      }}
    >
      <div className="px-4 pt-3 pb-1">
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: config.secondaryColor }}
        >
          Included Benefits
        </span>
      </div>

      <div className="px-4 pb-3">
        {benefits.map((benefit, idx) => (
          <BenefitRow
            key={idx}
            benefit={benefit}
            isLast={idx === benefits.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

// ── Benefit Row ─────────────────────────────────────────────────────

const BENEFIT_ICON_MAP: Record<string, typeof PercentageOutlined> = {
  discount: PercentageOutlined,
  "flat-discount": PercentageOutlined,
  "flat-amount": PercentageOutlined,
  bogo: SwapOutlined,
  "free-goods": PlusOutlined,
};

const BENEFIT_ICON_STYLE: Record<string, { bg: string; color: string }> = {
  discount: { bg: "#DCFCE7", color: "#0D7A4A" },
  "flat-discount": { bg: "#e0f5ea", color: "#1a7a4a" },
  "flat-amount": { bg: "#e0f5ea", color: "#1a7a4a" },
  bogo: { bg: "#DCFCE7", color: "#0D7A4A" },
  "free-goods": { bg: "#faeeda", color: "#854F0B" },
};

export function BenefitRow({ benefit, isLast }: { benefit: PromotionBenefit; isLast: boolean }) {
  const config = activeBrandConfig;
  const Icon = BENEFIT_ICON_MAP[benefit.type] ?? PercentageOutlined;
  const iconStyle = BENEFIT_ICON_STYLE[benefit.type] ?? { bg: "#DCFCE7", color: "#0D7A4A" };

  return (
    <div
      className="py-2.5"
      style={{
        borderBottom: !isLast ? `0.5px solid ${config.borderColor}` : "none",
      }}
    >
      {/* Row 1: Icon + Name + Cap */}
      <div className="flex items-center gap-2.5">
        <div
          className="flex items-center justify-center shrink-0 rounded-full"
          style={{
            width: 22,
            height: 22,
            backgroundColor: iconStyle.bg,
            color: iconStyle.color,
          }}
        >
          <Icon style={{ fontSize: 11 }} />
        </div>

        <span className="flex-1 text-[13px] font-semibold min-w-0" style={{ color: config.primaryColor }}>
          {benefit.label}
        </span>

        {benefit.cap && (
          <span className="shrink-0 text-[11px]" style={{ color: config.secondaryColor }}>
            {benefit.cap}
          </span>
        )}
      </div>

      {/* Row 2: Description */}
      {benefit.description && (
        <p className="text-xs mt-0.5" style={{ color: config.secondaryColor, marginLeft: 34 }}>
          {benefit.description}
        </p>
      )}

      {/* Row 3: Condition */}
      {benefit.condition && (
        <div style={{ marginLeft: 34, marginTop: 4 }}>
          <span
            className="inline-flex items-center text-[11px] rounded-md"
            style={{
              border: `1px solid ${config.borderColor}`,
              backgroundColor: "#fff",
              color: config.secondaryColor,
              padding: "3px 8px",
            }}
          >
            <span
              className="text-[10px] uppercase font-semibold mr-1"
              style={{ color: config.secondaryColor, opacity: 0.7 }}
            >
              CONDITION
            </span>
            {benefit.condition}
          </span>
        </div>
      )}
    </div>
  );
}
