import {
  TagOutlined,
  GiftOutlined,
  CheckCircleFilled,
  LockOutlined,
} from "@ant-design/icons";
import { Drawer } from "antd";
import { activeBrandConfig } from "../../config/brandConfig";
import type { CartPromotion } from "../../data/catalogData";
import { BenefitsSection } from "../catalog/PromotionInfoDrawer";

interface PromotionsDrawerProps {
  open: boolean;
  onClose: () => void;
  promotions: CartPromotion[];
  cartTotal: number;
  appliedPromoId: string | null;
  onApply: (id: string) => void;
  onRemove: () => void;
}

type PromoState = "applied" | "ready" | "almost" | "locked";

function getPromoState(
  promo: CartPromotion,
  cartTotal: number,
  appliedPromoId: string | null,
): PromoState {
  if (appliedPromoId === promo.id) return "applied";
  if (cartTotal >= promo.thresholdAmount) return "ready";
  const remaining = promo.thresholdAmount - cartTotal;
  if (remaining / promo.thresholdAmount <= 0.3) return "almost";
  return "locked";
}

const sectionLabels: Record<PromoState, string> = {
  applied: "Applied",
  ready: "Ready to Apply",
  almost: "Almost Unlocked",
  locked: "Locked",
};

const sectionColors: Record<PromoState, string> = {
  applied: "#1a7a4a",
  ready: "#16A34A",
  almost: "#D97706",
  locked: "#6B7B99",
};

export default function PromotionsDrawer({
  open,
  onClose,
  promotions,
  cartTotal,
  appliedPromoId,
  onApply,
  onRemove,
}: PromotionsDrawerProps) {
  const config = activeBrandConfig;

  const grouped: Record<PromoState, CartPromotion[]> = {
    applied: [],
    ready: [],
    almost: [],
    locked: [],
  };

  promotions.forEach((promo) => {
    grouped[getPromoState(promo, cartTotal, appliedPromoId)].push(promo);
  });

  grouped.almost.sort((a, b) => a.thresholdAmount - b.thresholdAmount);
  grouped.locked.sort((a, b) => a.thresholdAmount - b.thresholdAmount);

  const sections: PromoState[] = ["applied", "ready", "almost", "locked"];

  return (
    <Drawer
      title={
        <span className="flex items-center gap-2 text-base font-semibold" style={{ color: config.primaryColor }}>
          <TagOutlined style={{ fontSize: 14, color: "#16A34A" }} />
          All Promotions
        </span>
      }
      placement="right"
      width={420}
      open={open}
      onClose={onClose}
      styles={{ body: { padding: "16px 20px" } }}
    >
      {sections.map((state) => {
        const promos = grouped[state];
        if (promos.length === 0) return null;
        const color = sectionColors[state];

        return (
          <div key={state} className="mb-5">
            {/* Section header */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color }}
              >
                {sectionLabels[state]}
              </span>
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: color + "15", color }}
              >
                {promos.length}
              </span>
            </div>

            <div className="space-y-3">
              {promos.map((promo) => (
                <DrawerPromoCard
                  key={promo.id}
                  promo={promo}
                  state={state}
                  cartTotal={cartTotal}
                  onApply={() => onApply(promo.id)}
                  onRemove={onRemove}
                />
              ))}
            </div>
          </div>
        );
      })}
    </Drawer>
  );
}

// ── Left border color per state ─────────────────────────────────────

function getLeftBorderColor(state: PromoState, config: typeof activeBrandConfig): string {
  switch (state) {
    case "applied": return "#1a7a4a";
    case "ready": return "#1a7a4a";
    case "almost": return "#f59e0b";
    case "locked": return config.borderColor;
  }
}

// ── Icon color per state ────────────────────────────────────────────

function getIconColor(state: PromoState, config: typeof activeBrandConfig): string {
  switch (state) {
    case "applied": return "#1a7a4a";
    case "ready": return "#1a7a4a";
    case "almost": return "#D97706";
    case "locked": return config.secondaryColor;
  }
}

function DrawerPromoCard({
  promo,
  state,
  cartTotal,
  onApply,
  onRemove,
}: {
  promo: CartPromotion;
  state: PromoState;
  cartTotal: number;
  onApply: () => void;
  onRemove: () => void;
}) {
  const config = activeBrandConfig;
  const remaining = Math.max(0, promo.thresholdAmount - cartTotal);
  const progress = Math.min(100, (cartTotal / promo.thresholdAmount) * 100);
  const isApplied = state === "applied";
  const isReady = state === "ready";
  const isAlmost = state === "almost";
  const isLocked = state === "locked";
  const PromoIcon = promo.type === "spend-free-units" ? GiftOutlined : TagOutlined;
  const hasBenefits = promo.benefits && promo.benefits.length > 0;

  return (
    <div
      className="rounded-lg overflow-hidden transition-colors"
      style={{
        border: `0.5px solid ${config.borderColor}`,
        borderLeft: `3px solid ${getLeftBorderColor(state, config)}`,
        backgroundColor: "#fff",
      }}
    >
      <div style={{ padding: "14px 16px" }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <PromoIcon style={{ fontSize: 16, color: getIconColor(state, config) }} />
              <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
                GET {promo.label}
              </span>
            </div>

            <p className="text-xs mb-1" style={{ color: config.secondaryColor, marginLeft: 22 }}>
              {promo.description}
            </p>

            {/* Eligible badge — for applied + ready states, below description */}
            {(isApplied || isReady) && (
              <div style={{ marginLeft: 22, marginBottom: 4 }}>
                <span
                  className="inline-flex items-center text-[11px] font-medium rounded-full"
                  style={{
                    backgroundColor: "#fff",
                    color: "#1a7a4a",
                    border: "1px solid #63c99a",
                    padding: "3px 10px",
                  }}
                >
                  ✓ Eligible
                </span>
              </div>
            )}

            <DrawerCardChips promo={promo} />
          </div>

          {/* State badge — top right */}
          <div className="shrink-0">
            {isApplied ? (
              <span
                className="text-[11px] font-medium flex items-center gap-1"
                style={{
                  backgroundColor: "#1a7a4a",
                  color: "#fff",
                  borderRadius: 6,
                  padding: "3px 10px",
                }}
              >
                ✓ Applied
                <span
                  role="button"
                  tabIndex={0}
                  onClick={onRemove}
                  onKeyDown={(e) => e.key === "Enter" && onRemove()}
                  className="cursor-pointer"
                  style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginLeft: 6 }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                >
                  ×
                </span>
              </span>
            ) : isReady ? (
              <button
                onClick={onApply}
                className="text-xs font-semibold px-3.5 py-1 rounded-md cursor-pointer"
                style={{ backgroundColor: config.primaryColor, color: "#fff", border: "none" }}
              >
                Apply
              </button>
            ) : isAlmost ? (
              <span
                className="inline-flex items-center text-[11px] font-medium rounded-full whitespace-nowrap"
                style={{
                  backgroundColor: "#fff",
                  color: "#b45309",
                  border: "1px solid #f59e0b",
                  padding: "3px 10px",
                }}
              >
                Add ${remaining.toFixed(2)} to unlock
              </span>
            ) : (
              <span
                className="inline-flex items-center text-[11px] font-medium rounded-full gap-1"
                style={{
                  backgroundColor: "#fff",
                  color: config.secondaryColor,
                  border: `0.5px solid ${config.secondaryColor}40`,
                  padding: "3px 10px",
                }}
              >
                <LockOutlined style={{ fontSize: 10 }} /> Locked
              </span>
            )}
          </div>
        </div>

        {/* Progress bar for almost/locked */}
        {(isAlmost || isLocked) && (
          <div style={{ marginLeft: 22, marginTop: 8 }}>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: isAlmost ? "#FDE68A" : config.borderColor }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, backgroundColor: isAlmost ? "#F59E0B" : "#D97706" }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[11px]" style={{ color: config.secondaryColor }}>
                ${cartTotal.toFixed(0)}
              </span>
              <span className="text-[11px]" style={{ color: config.secondaryColor }}>
                ${promo.thresholdAmount.toFixed(0)}
              </span>
            </div>
          </div>
        )}
      </div>

      {hasBenefits && <BenefitsSection benefits={promo.benefits!} />}
    </div>
  );
}

// ── Shared chips for validity/scope/benefits badge ──────────────────

function DrawerCardChips({ promo }: { promo: CartPromotion }) {
  const config = activeBrandConfig;
  const hasBenefits = promo.benefits && promo.benefits.length > 0;
  const benefitCount = promo.benefits?.length ?? 0;

  const chips: string[] = [];
  if (promo.validFrom || promo.validTo) {
    const from = promo.validFrom ? new Date(promo.validFrom).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "";
    const to = promo.validTo ? new Date(promo.validTo).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "";
    if (from && to) chips.push(`Valid: ${from} – ${to}`);
    else if (from) chips.push(`From: ${from}`);
    else if (to) chips.push(`Until: ${to}`);
  }
  if (promo.scope) chips.push(`Scope: ${promo.scope}`);

  if (!hasBenefits && chips.length === 0 && !promo.promoCode) return null;

  return (
    <>
      {(hasBenefits || promo.promoCode) && (
        <div className="flex items-center gap-2 mt-1" style={{ marginLeft: 22 }}>
          {hasBenefits && (
            <span
              className="text-[11px] font-medium rounded-full px-2 py-0.5"
              style={{ backgroundColor: "#E6F1FB", color: "#185FA5", border: "1px solid #85B7EB" }}
            >
              {benefitCount} benefit{benefitCount !== 1 ? "s" : ""}
            </span>
          )}
          {promo.promoCode && (
            <span
              className="text-[10px] font-semibold rounded px-2 py-0.5"
              style={{ backgroundColor: config.cardBg, color: config.secondaryColor, border: `1px solid ${config.borderColor}` }}
            >
              {promo.promoCode}
            </span>
          )}
        </div>
      )}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1.5" style={{ marginLeft: 22 }}>
          {chips.map((chip) => (
            <span
              key={chip}
              className="text-[11px] px-2 py-0.5 rounded"
              style={{ backgroundColor: config.cardBg, color: config.secondaryColor, border: `1px solid ${config.borderColor}` }}
            >
              {chip}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
