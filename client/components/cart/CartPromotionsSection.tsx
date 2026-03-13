import { TagOutlined, CheckCircleFilled, GiftOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import Tag from "../ui/Tag";
import { cartPromotions, type CartPromotion } from "../../data/catalogData";
import { useOrder } from "../../context/OrderContext";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

interface AppliedCartPromo {
  promoId: string;
  discountAmount?: number;
}

export default function CartPromotionsSection() {
  const config = activeBrandConfig;
  const { isAuthenticated } = useAuth();
  const { totalValue, totalUnits } = useOrder();
  const [appliedPromoId, setAppliedPromoId] = useState<string | null>(null);

  if (!isAuthenticated || cartPromotions.length === 0) return null;

  return (
    <div
      className="rounded-xl p-5 mb-5"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: config.primaryColor }}>
        <TagOutlined className="text-xs" style={{ color: "#16A34A" }} />
        Cart Promotions
      </h3>

      <div className="space-y-3">
        {cartPromotions.map((promo) => (
          <CartPromoCard
            key={promo.id}
            promo={promo}
            cartTotal={totalValue}
            cartUnits={totalUnits}
            isApplied={appliedPromoId === promo.id}
            onApply={() => setAppliedPromoId(promo.id)}
            onRemove={() => setAppliedPromoId(null)}
          />
        ))}
      </div>
    </div>
  );
}

function CartPromoCard({
  promo,
  cartTotal,
  cartUnits,
  isApplied,
  onApply,
  onRemove,
}: {
  promo: CartPromotion;
  cartTotal: number;
  cartUnits: number;
  isApplied: boolean;
  onApply: () => void;
  onRemove: () => void;
}) {
  const config = activeBrandConfig;
  const isEligible = cartTotal >= promo.thresholdAmount;
  const remaining = promo.thresholdAmount - cartTotal;

  return (
    <div
      className="rounded-lg p-4 transition-colors"
      style={{
        border: isApplied
          ? "2px solid #EA580C"
          : `1px solid ${config.borderColor}`,
        backgroundColor: isApplied ? "#FFF7ED" : isEligible ? "#F0FDF4" : config.cardBg,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Label */}
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

          {/* Description */}
          <p className="text-[11px] mb-1" style={{ color: config.secondaryColor }}>
            {promo.description}
          </p>

          {/* Progress indicator */}
          {!isEligible && (
            <p className="text-[11px] font-medium" style={{ color: "#D97706" }}>
              Add ${remaining.toFixed(2)} more to unlock this promotion
            </p>
          )}
          {isEligible && !isApplied && (
            <p className="text-[11px] font-medium" style={{ color: "#16A34A" }}>
              You're eligible for this promotion!
            </p>
          )}
        </div>

        {/* Action */}
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
          ) : isEligible ? (
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
            <Tag variant="neutral">Locked</Tag>
          )}
        </div>
      </div>

      {/* Progress bar */}
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
                backgroundColor: isEligible ? "#16A34A" : "#D97706",
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
