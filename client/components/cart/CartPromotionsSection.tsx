import {
  TagOutlined,
  CheckCircleFilled,
  GiftOutlined,
  RightOutlined,
  PercentageOutlined,
} from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { cartPromotions, type CartPromotion } from "../../data/catalogData";
import { useOrder } from "../../context/OrderContext";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { BenefitsSection } from "../catalog/PromotionInfoDrawer";
import PromotionsDrawer from "./PromotionsDrawer";

interface Props {
  appliedPromoId: string | null;
  onApply: (id: string) => void;
  onRemove: () => void;
}

export default function CartPromotionsSection({ appliedPromoId, onApply, onRemove }: Props) {
  const config = activeBrandConfig;
  const { isAuthenticated } = useAuth();
  const { totalValue } = useOrder();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!isAuthenticated || cartPromotions.length === 0) return null;

  const eligible = cartPromotions
    .filter((p) => totalValue >= p.thresholdAmount && p.id !== appliedPromoId)
    .sort((a, b) => (b.discountAmount ?? 0) - (a.discountAmount ?? 0));

  const almostUnlocked = cartPromotions
    .filter((p) => {
      if (totalValue >= p.thresholdAmount) return false;
      if (p.id === appliedPromoId) return false;
      const remaining = p.thresholdAmount - totalValue;
      return remaining / p.thresholdAmount <= 0.3;
    })
    .sort((a, b) => a.thresholdAmount - b.thresholdAmount);

  const appliedPromo = appliedPromoId
    ? cartPromotions.find((p) => p.id === appliedPromoId) ?? null
    : null;

  const readyPromo = eligible[0] ?? null;
  const almostPromo = almostUnlocked[0] ?? null;

  const shownIds = new Set<string>();
  if (appliedPromo) shownIds.add(appliedPromo.id);
  if (readyPromo) shownIds.add(readyPromo.id);
  if (almostPromo) shownIds.add(almostPromo.id);
  const remainingCount = cartPromotions.length - shownIds.size;

  return (
    <>
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
      >
        <div
          className="flex items-center gap-2 px-5 py-4"
          style={{ borderBottom: `1px solid ${config.borderColor}` }}
        >
          <PercentageOutlined style={{ fontSize: 18, color: "#16A34A" }} />
          <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
            Cart Promotions
          </span>
        </div>

        <div className="py-1">
          {appliedPromo && <AppliedPromoCard promo={appliedPromo} onRemove={onRemove} />}
          {readyPromo && <ReadyPromoCard promo={readyPromo} onApply={() => onApply(readyPromo.id)} />}
          {almostPromo && <AlmostUnlockedCard promo={almostPromo} cartTotal={totalValue} />}
          {!appliedPromo && !readyPromo && !almostPromo && (
            <p className="text-xs py-4 px-5" style={{ color: config.secondaryColor }}>
              Add more items to unlock promotions.
            </p>
          )}
        </div>

        {remainingCount > 0 && (
          <div style={{ borderTop: `1px solid ${config.borderColor}` }}>
            <button
              onClick={() => setDrawerOpen(true)}
              className="text-xs font-medium cursor-pointer flex items-center gap-1 w-full justify-center py-3"
              style={{ color: config.secondaryColor, border: "none", background: "none" }}
            >
              View {remainingCount} More Available Offer{remainingCount !== 1 ? "s" : ""}
              <RightOutlined style={{ fontSize: 14 }} />
            </button>
          </div>
        )}
      </div>

      <PromotionsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        promotions={cartPromotions}
        cartTotal={totalValue}
        appliedPromoId={appliedPromoId}
        onApply={onApply}
        onRemove={onRemove}
      />
    </>
  );
}

// ── Shared: Card Header with optional benefits badge + validity chips ─

function CartPromoCardHeader({ promo }: { promo: CartPromotion }) {
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

// ── Applied Card ────────────────────────────────────────────────────

function AppliedPromoCard({ promo, onRemove }: { promo: CartPromotion; onRemove: () => void }) {
  const config = activeBrandConfig;
  const PromoIcon = promo.type === "spend-free-units" ? GiftOutlined : TagOutlined;
  const hasBenefits = promo.benefits && promo.benefits.length > 0;

  return (
    <div
      className="rounded-lg mx-3 my-3 overflow-hidden transition-colors"
      style={{
        border: `0.5px solid ${config.borderColor}`,
        borderLeft: "3px solid #1a7a4a",
        backgroundColor: "#fff",
      }}
    >
      <div style={{ padding: "14px 16px" }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <PromoIcon style={{ fontSize: 16, color: "#1a7a4a" }} />
              <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
                GET {promo.label}
              </span>
            </div>
            <p className="text-xs mb-1.5" style={{ color: config.secondaryColor, marginLeft: 22 }}>
              {promo.description}
            </p>
            <CartPromoCardHeader promo={promo} />
          </div>
          <div className="shrink-0">
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
          </div>
        </div>
      </div>
      {hasBenefits && <BenefitsSection benefits={promo.benefits!} />}
    </div>
  );
}

// ── Ready to Apply (Eligible) Card ──────────────────────────────────

function ReadyPromoCard({ promo, onApply }: { promo: CartPromotion; onApply: () => void }) {
  const config = activeBrandConfig;
  const PromoIcon = promo.type === "spend-free-units" ? GiftOutlined : TagOutlined;
  const hasBenefits = promo.benefits && promo.benefits.length > 0;

  return (
    <div
      className="rounded-lg mx-3 my-3 overflow-hidden transition-colors"
      style={{
        border: `0.5px solid ${config.borderColor}`,
        borderLeft: "3px solid #1a7a4a",
        backgroundColor: "#fff",
      }}
    >
      <div style={{ padding: "14px 16px" }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <PromoIcon style={{ fontSize: 16, color: "#1a7a4a" }} />
              <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
                GET {promo.label}
              </span>
            </div>
            <p className="text-xs mb-1.5" style={{ color: config.secondaryColor, marginLeft: 22 }}>
              {promo.description}
            </p>
            {/* Eligible badge — outline pill, left-aligned below description */}
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
            <CartPromoCardHeader promo={promo} />
          </div>
          <div className="shrink-0">
            <button
              onClick={onApply}
              className="text-xs font-semibold px-3.5 py-1 rounded-md cursor-pointer"
              style={{ backgroundColor: config.primaryColor, color: "#fff", border: "none" }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
      {hasBenefits && <BenefitsSection benefits={promo.benefits!} />}
    </div>
  );
}

// ── Almost Unlocked Card ────────────────────────────────────────────

function AlmostUnlockedCard({ promo, cartTotal }: { promo: CartPromotion; cartTotal: number }) {
  const config = activeBrandConfig;
  const remaining = promo.thresholdAmount - cartTotal;
  const progress = Math.min(100, (cartTotal / promo.thresholdAmount) * 100);
  const PromoIcon = promo.type === "spend-free-units" ? GiftOutlined : TagOutlined;
  const hasBenefits = promo.benefits && promo.benefits.length > 0;

  return (
    <div
      className="rounded-lg mx-3 my-3 overflow-hidden transition-colors"
      style={{
        border: `0.5px solid ${config.borderColor}`,
        borderLeft: "3px solid #f59e0b",
        backgroundColor: "#fff",
      }}
    >
      <div style={{ padding: "14px 16px" }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <PromoIcon style={{ fontSize: 16, color: "#D97706" }} />
              <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
                GET {promo.label}
              </span>
            </div>
            <p className="text-xs mb-2" style={{ color: config.secondaryColor, marginLeft: 22 }}>
              {promo.description}
            </p>
            <CartPromoCardHeader promo={promo} />
          </div>
          {/* Almost unlocked badge — outline pill, top right */}
          <div className="shrink-0">
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
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginLeft: 22, marginTop: 8 }}>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#FDE68A" }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: "#F59E0B" }}
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
      </div>
      {hasBenefits && <BenefitsSection benefits={promo.benefits!} />}
    </div>
  );
}
