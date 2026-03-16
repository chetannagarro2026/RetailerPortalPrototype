import { CloseOutlined, TagOutlined, GiftOutlined, CheckCircleFilled, LockOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import Tag from "../ui/Tag";
import type { CartPromotion } from "../../data/catalogData";

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
  const threshold = promo.thresholdAmount;
  if (remaining / threshold <= 0.3) return "almost";
  return "locked";
}

const sectionLabels: Record<PromoState, string> = {
  applied: "Applied",
  ready: "Ready to Apply",
  almost: "Almost Unlocked",
  locked: "Locked",
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

  // Group promotions by state
  const grouped: Record<PromoState, CartPromotion[]> = {
    applied: [],
    ready: [],
    almost: [],
    locked: [],
  };

  promotions.forEach((promo) => {
    const state = getPromoState(promo, cartTotal, appliedPromoId);
    grouped[state].push(promo);
  });

  // Sort almost and locked by threshold ascending (closest first)
  grouped.almost.sort((a, b) => a.thresholdAmount - b.thresholdAmount);
  grouped.locked.sort((a, b) => a.thresholdAmount - b.thresholdAmount);

  const sections: PromoState[] = ["applied", "ready", "almost", "locked"];

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/30 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 z-[70] h-full flex flex-col bg-white shadow-2xl transition-transform duration-300"
        style={{
          width: 420,
          transform: open ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: `1px solid ${config.borderColor}` }}
        >
          <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: config.primaryColor }}>
            <TagOutlined className="text-sm" style={{ color: "#16A34A" }} />
            All Promotions
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md cursor-pointer transition-colors"
            style={{ border: "none", background: "none", color: config.secondaryColor }}
          >
            <CloseOutlined className="text-sm" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {sections.map((state) => {
            const promos = grouped[state];
            if (promos.length === 0) return null;

            return (
              <div key={state} className="mb-5">
                <DrawerSectionHeader state={state} count={promos.length} />
                <div className="space-y-3 mt-2">
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
        </div>
      </div>
    </>
  );
}

function DrawerSectionHeader({ state, count }: { state: PromoState; count: number }) {
  const config = activeBrandConfig;

  const colors: Record<PromoState, string> = {
    applied: "#EA580C",
    ready: "#16A34A",
    almost: "#D97706",
    locked: config.secondaryColor,
  };

  return (
    <div className="flex items-center gap-2 mb-1">
      <span
        className="text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: colors[state] }}
      >
        {sectionLabels[state]}
      </span>
      <span
        className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
        style={{
          backgroundColor: colors[state] + "15",
          color: colors[state],
        }}
      >
        {count}
      </span>
    </div>
  );
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
  const isApplied = state === "applied";
  const isReady = state === "ready";
  const isAlmost = state === "almost";
  const isLocked = state === "locked";

  return (
    <div
      className="rounded-lg p-4 transition-colors"
      style={{
        border: isApplied
          ? "2px solid #EA580C"
          : `1px solid ${config.borderColor}`,
        backgroundColor: isApplied
          ? "#FFF7ED"
          : isReady
          ? "#F0FDF4"
          : config.cardBg,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {promo.type === "spend-free-units" ? (
              <GiftOutlined className="text-xs" style={{ color: isApplied ? "#EA580C" : "#16A34A" }} />
            ) : (
              <TagOutlined className="text-xs" style={{ color: isApplied ? "#EA580C" : "#16A34A" }} />
            )}
            <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
              GET {promo.label}
            </span>
            {isApplied && (
              <CheckCircleFilled className="text-xs" style={{ color: "#EA580C" }} />
            )}
          </div>

          <p className="text-[11px] mb-1" style={{ color: config.secondaryColor }}>
            {promo.description}
          </p>

          {isApplied && (
            <p className="text-[11px] font-medium" style={{ color: "#EA580C" }}>
              Promotion applied to your order
            </p>
          )}
          {isReady && (
            <p className="text-[11px] font-medium" style={{ color: "#16A34A" }}>
              Eligible ✔
            </p>
          )}
          {(isAlmost || isLocked) && (
            <p className="text-[11px] font-medium" style={{ color: "#D97706" }}>
              Add ${remaining.toFixed(2)} more to unlock
            </p>
          )}
        </div>

        <div className="shrink-0">
          {isApplied ? (
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
          ) : isReady ? (
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
          ) : (
            <Tag variant="neutral" size="compact">
              <LockOutlined className="text-[9px] mr-1" />
              Locked
            </Tag>
          )}
        </div>
      </div>

      {/* Progress bar for non-applied promotions */}
      {!isApplied && (
        <div className="mt-2.5">
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: config.borderColor }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (cartTotal / promo.thresholdAmount) * 100)}%`,
                backgroundColor: isReady ? "#16A34A" : "#D97706",
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
      )}
    </div>
  );
}
