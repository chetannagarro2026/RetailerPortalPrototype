import {
  TagOutlined,
  CheckCircleFilled,
  GiftOutlined,
  RightOutlined,
  PercentageOutlined,
} from "@ant-design/icons";
import { Drawer } from "antd";
import { activeBrandConfig } from "../../config/brandConfig";
import { cartPromotions, type CartPromotion } from "../../data/catalogData";
import { useOrder } from "../../context/OrderContext";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
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

  // Categorize promotions
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

  // Count remaining promotions not shown
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
        {/* Panel header */}
        <div
          className="flex items-center gap-2 px-5 py-4"
          style={{ borderBottom: `1px solid ${config.borderColor}` }}
        >
          <PercentageOutlined style={{ fontSize: 18, color: "#16A34A" }} />
          <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
            Cart Promotions
          </span>
        </div>

        {/* Cards */}
        <div className="py-1">
          {/* Applied card */}
          {appliedPromo && (
            <AppliedPromoCard promo={appliedPromo} onRemove={onRemove} />
          )}

          {/* Ready to Apply card */}
          {readyPromo && (
            <ReadyPromoCard promo={readyPromo} onApply={() => onApply(readyPromo.id)} />
          )}

          {/* Almost Unlocked card */}
          {almostPromo && (
            <AlmostUnlockedCard promo={almostPromo} cartTotal={totalValue} />
          )}

          {/* Fallback */}
          {!appliedPromo && !readyPromo && !almostPromo && (
            <p className="text-xs py-4 px-5" style={{ color: config.secondaryColor }}>
              Add more items to unlock promotions.
            </p>
          )}
        </div>

        {/* View More link */}
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

// ── Applied Card (orange) ───────────────────────────────────────────

function AppliedPromoCard({ promo, onRemove }: { promo: CartPromotion; onRemove: () => void }) {
  const config = activeBrandConfig;
  const PromoIcon = promo.type === "spend-free-units" ? GiftOutlined : TagOutlined;

  return (
    <div
      className="rounded-lg mx-3 my-3 transition-colors"
      style={{
        border: "1px solid #FED7AA",
        backgroundColor: "#FFF7ED",
        padding: "14px 16px",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <PromoIcon style={{ fontSize: 16, color: "#EA580C" }} />
            <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
              GET {promo.label}
            </span>
          </div>
          <p className="text-xs mb-1.5" style={{ color: config.secondaryColor, marginLeft: 22 }}>
            {promo.description}
          </p>
          <p className="text-[11px] font-semibold" style={{ color: "#16A34A", marginLeft: 22 }}>
            <CheckCircleFilled className="mr-1" style={{ fontSize: 11 }} />
            Eligible
          </p>
        </div>
        <div className="shrink-0">
          <button
            onClick={onRemove}
            className="text-xs font-semibold px-3 py-1.5 rounded-md cursor-pointer flex items-center gap-1"
            style={{
              backgroundColor: "transparent",
              color: "#EA580C",
              border: "1px solid #EA580C",
            }}
          >
            <CheckCircleFilled style={{ fontSize: 12 }} />
            Applied
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Ready to Apply Card (green) ─────────────────────────────────────

function ReadyPromoCard({ promo, onApply }: { promo: CartPromotion; onApply: () => void }) {
  const config = activeBrandConfig;
  const PromoIcon = promo.type === "spend-free-units" ? GiftOutlined : TagOutlined;

  return (
    <div
      className="rounded-lg mx-3 my-3 transition-colors"
      style={{
        border: "1px solid #BBF7D0",
        backgroundColor: "#F0FDF4",
        padding: "14px 16px",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <PromoIcon style={{ fontSize: 16, color: "#16A34A" }} />
            <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
              GET {promo.label}
            </span>
          </div>
          <p className="text-xs mb-1.5" style={{ color: config.secondaryColor, marginLeft: 22 }}>
            {promo.description}
          </p>
          <p className="text-[11px] font-semibold" style={{ color: "#16A34A", marginLeft: 22 }}>
            <CheckCircleFilled className="mr-1" style={{ fontSize: 11 }} />
            Eligible
          </p>
        </div>
        <div className="shrink-0">
          <button
            onClick={onApply}
            className="text-xs font-semibold px-3.5 py-1 rounded-md cursor-pointer"
            style={{
              backgroundColor: config.primaryColor,
              color: "#fff",
              border: "none",
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Almost Unlocked Card (amber) ────────────────────────────────────

function AlmostUnlockedCard({ promo, cartTotal }: { promo: CartPromotion; cartTotal: number }) {
  const config = activeBrandConfig;
  const remaining = promo.thresholdAmount - cartTotal;
  const progress = Math.min(100, (cartTotal / promo.thresholdAmount) * 100);
  const PromoIcon = promo.type === "spend-free-units" ? GiftOutlined : TagOutlined;

  return (
    <div
      className="rounded-lg mx-3 my-3 transition-colors"
      style={{
        border: "1px solid #FDE68A",
        backgroundColor: "#FFFBEB",
        padding: "14px 16px",
      }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <PromoIcon style={{ fontSize: 16, color: "#D97706" }} />
        <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
          GET {promo.label}
        </span>
      </div>
      <p className="text-xs mb-2" style={{ color: config.secondaryColor, marginLeft: 22 }}>
        {promo.description}
      </p>

      {/* Progress section */}
      <div style={{ marginLeft: 22 }}>
        <p className="text-xs font-medium mb-1.5" style={{ color: "#D97706" }}>
          Add ${remaining.toFixed(2)} more to unlock
        </p>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: "#FDE68A" }}
        >
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
  );
}
