import { TagOutlined, CheckCircleFilled, GiftOutlined, RightOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { cartPromotions, type CartPromotion } from "../../data/catalogData";
import { useOrder } from "../../context/OrderContext";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import PromotionsDrawer from "./PromotionsDrawer";

export interface CartPromoState {
  appliedPromoId: string | null;
  appliedPromo: CartPromotion | null;
  discountAmount: number;
}

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
  const eligible = cartPromotions.filter(
    (p) => totalValue >= p.thresholdAmount && p.id !== appliedPromoId,
  );
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

  // Pick the best "ready to apply" promo (highest discount)
  const readyPromo = eligible.sort((a, b) => {
    const aVal = a.discountAmount ?? 0;
    const bVal = b.discountAmount ?? 0;
    return bVal - aVal;
  })[0] ?? null;

  // Pick the closest "almost unlocked" promo
  const almostPromo = almostUnlocked[0] ?? null;

  // Count remaining promotions not shown in the card
  const shownIds = new Set<string>();
  if (appliedPromo) shownIds.add(appliedPromo.id);
  if (readyPromo) shownIds.add(readyPromo.id);
  if (almostPromo) shownIds.add(almostPromo.id);
  const remainingCount = cartPromotions.length - shownIds.size;

  return (
    <>
      <div
        className="rounded-xl p-5 mb-5"
        style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
      >
        <h3
          className="text-sm font-semibold mb-4 flex items-center gap-2"
          style={{ color: config.primaryColor }}
        >
          <TagOutlined className="text-xs" style={{ color: "#16A34A" }} />
          Cart Promotions
        </h3>

        <div className="space-y-3">
          {/* Show applied promo if exists */}
          {appliedPromo && (
            <AppliedPromoCard promo={appliedPromo} onRemove={onRemove} />
          )}

          {/* Promotion 1: Ready to Apply */}
          {readyPromo && (
            <ReadyPromoCard promo={readyPromo} onApply={() => onApply(readyPromo.id)} />
          )}

          {/* Promotion 2: Almost Unlocked */}
          {almostPromo && (
            <AlmostUnlockedCard promo={almostPromo} cartTotal={totalValue} />
          )}

          {/* No promos to show at all */}
          {!appliedPromo && !readyPromo && !almostPromo && (
            <p className="text-xs py-2" style={{ color: config.secondaryColor }}>
              Add more items to unlock promotions.
            </p>
          )}
        </div>

        {/* View More link */}
        {remainingCount > 0 && (
          <button
            onClick={() => setDrawerOpen(true)}
            className="mt-4 text-xs font-medium cursor-pointer flex items-center gap-1 w-full justify-center py-1.5"
            style={{
              color: config.primaryColor,
              border: "none",
              background: "none",
            }}
          >
            View {remainingCount} More Available Offer{remainingCount !== 1 ? "s" : ""}
            <RightOutlined className="text-[9px]" />
          </button>
        )}
      </div>

      <PromotionsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        promotions={cartPromotions}
        cartTotal={totalValue}
        appliedPromoId={appliedPromoId}
        onApply={(id) => {
          onApply(id);
        }}
        onRemove={onRemove}
      />
    </>
  );
}

// ── Applied Promo Card ──────────────────────────────────────────────

function AppliedPromoCard({
  promo,
  onRemove,
}: {
  promo: CartPromotion;
  onRemove: () => void;
}) {
  const config = activeBrandConfig;

  return (
    <div
      className="rounded-lg p-4 transition-colors"
      style={{
        border: "2px solid #EA580C",
        backgroundColor: "#FFF7ED",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {promo.type === "spend-free-units" ? (
              <GiftOutlined className="text-xs" style={{ color: "#EA580C" }} />
            ) : (
              <TagOutlined className="text-xs" style={{ color: "#EA580C" }} />
            )}
            <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
              GET {promo.label}
            </span>
            <CheckCircleFilled className="text-xs" style={{ color: "#EA580C" }} />
          </div>
          <p className="text-[11px] mb-1" style={{ color: config.secondaryColor }}>
            {promo.description}
          </p>
          <p className="text-[11px] font-medium" style={{ color: "#EA580C" }}>
            Promotion applied to your order
          </p>
        </div>
        <div className="shrink-0">
          <button
            onClick={onRemove}
            className="text-[11px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
            style={{
              backgroundColor: "transparent",
              color: "#DC2626",
              border: "1px solid #FECACA",
            }}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Ready to Apply Card ─────────────────────────────────────────────

function ReadyPromoCard({
  promo,
  onApply,
}: {
  promo: CartPromotion;
  onApply: () => void;
}) {
  const config = activeBrandConfig;

  return (
    <div
      className="rounded-lg p-4 transition-colors"
      style={{
        border: `1px solid ${config.borderColor}`,
        backgroundColor: "#F0FDF4",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {promo.type === "spend-free-units" ? (
              <GiftOutlined className="text-xs" style={{ color: "#16A34A" }} />
            ) : (
              <TagOutlined className="text-xs" style={{ color: "#16A34A" }} />
            )}
            <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
              GET {promo.label}
            </span>
          </div>
          <p className="text-[11px] mb-1" style={{ color: config.secondaryColor }}>
            {promo.description}
          </p>
          <p className="text-[11px] font-medium" style={{ color: "#16A34A" }}>
            Eligible ✔
          </p>
        </div>
        <div className="shrink-0">
          <button
            onClick={onApply}
            className="text-[11px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
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

// ── Almost Unlocked Card ────────────────────────────────────────────

function AlmostUnlockedCard({
  promo,
  cartTotal,
}: {
  promo: CartPromotion;
  cartTotal: number;
}) {
  const config = activeBrandConfig;
  const remaining = promo.thresholdAmount - cartTotal;

  return (
    <div
      className="rounded-lg p-4 transition-colors"
      style={{
        border: `1px solid ${config.borderColor}`,
        backgroundColor: config.cardBg,
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {promo.type === "spend-free-units" ? (
            <GiftOutlined className="text-xs" style={{ color: "#D97706" }} />
          ) : (
            <TagOutlined className="text-xs" style={{ color: "#D97706" }} />
          )}
          <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
            GET {promo.label}
          </span>
        </div>
        <p className="text-[11px] mb-1" style={{ color: config.secondaryColor }}>
          {promo.description}
        </p>
        <p className="text-[11px] font-medium mb-2" style={{ color: "#D97706" }}>
          Add ${remaining.toFixed(2)} more to unlock
        </p>

        {/* Progress bar */}
        <div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: config.borderColor }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (cartTotal / promo.thresholdAmount) * 100)}%`,
                backgroundColor: "#D97706",
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px]" style={{ color: config.secondaryColor }}>
              ${cartTotal.toFixed(0)}
            </span>
            <span className="text-[10px]" style={{ color: config.secondaryColor }}>
              ${promo.thresholdAmount.toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
