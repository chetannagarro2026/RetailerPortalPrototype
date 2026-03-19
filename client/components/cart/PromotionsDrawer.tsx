import {
  TagOutlined,
  GiftOutlined,
  CheckCircleFilled,
  LockOutlined,
} from "@ant-design/icons";
import { Drawer } from "antd";
import { activeBrandConfig } from "../../config/brandConfig";
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
  applied: "#EA580C",
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
  const PromoIcon = promo.type === "spend-free-units" ? GiftOutlined : TagOutlined;

  const borderColor = isApplied
    ? "#FED7AA"
    : isReady
    ? "#BBF7D0"
    : isAlmost
    ? "#FDE68A"
    : config.borderColor;

  const bgColor = isApplied
    ? "#FFF7ED"
    : isReady
    ? "#F0FDF4"
    : isAlmost
    ? "#FFFBEB"
    : config.cardBg;

  const iconColor = isApplied ? "#EA580C" : isReady ? "#16A34A" : isAlmost ? "#D97706" : config.secondaryColor;

  return (
    <div
      className="rounded-lg transition-colors"
      style={{
        border: `1px solid ${borderColor}`,
        backgroundColor: bgColor,
        padding: "14px 16px",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <PromoIcon style={{ fontSize: 16, color: iconColor }} />
            <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
              GET {promo.label}
            </span>
            {isApplied && (
              <CheckCircleFilled style={{ fontSize: 12, color: "#EA580C" }} />
            )}
          </div>

          <p className="text-xs mb-1" style={{ color: config.secondaryColor, marginLeft: 22 }}>
            {promo.description}
          </p>

          {isApplied && (
            <p className="text-[11px] font-semibold" style={{ color: "#16A34A", marginLeft: 22 }}>
              <CheckCircleFilled className="mr-1" style={{ fontSize: 11 }} /> Eligible
            </p>
          )}
          {isReady && (
            <p className="text-[11px] font-semibold" style={{ color: "#16A34A", marginLeft: 22 }}>
              <CheckCircleFilled className="mr-1" style={{ fontSize: 11 }} /> Eligible
            </p>
          )}
        </div>

        <div className="shrink-0">
          {isApplied ? (
            <button
              onClick={onRemove}
              className="text-xs font-semibold px-3 py-1.5 rounded-md cursor-pointer flex items-center gap-1"
              style={{ backgroundColor: "transparent", color: "#EA580C", border: "1px solid #EA580C" }}
            >
              <CheckCircleFilled style={{ fontSize: 12 }} /> Applied
            </button>
          ) : isReady ? (
            <button
              onClick={onApply}
              className="text-xs font-semibold px-3.5 py-1 rounded-md cursor-pointer"
              style={{ backgroundColor: config.primaryColor, color: "#fff", border: "none" }}
            >
              Apply
            </button>
          ) : (
            <span
              className="text-[11px] font-medium px-2.5 py-1 rounded-md inline-flex items-center gap-1"
              style={{ backgroundColor: config.cardBg, color: config.secondaryColor, border: `1px solid ${config.borderColor}` }}
            >
              <LockOutlined style={{ fontSize: 10 }} /> Locked
            </span>
          )}
        </div>
      </div>

      {/* Progress bar for almost/locked */}
      {(isAlmost || state === "locked") && (
        <div style={{ marginLeft: 22, marginTop: 8 }}>
          <p className="text-xs font-medium mb-1.5" style={{ color: "#D97706" }}>
            Add ${remaining.toFixed(2)} more to unlock
          </p>
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
  );
}
