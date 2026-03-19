import { InputNumber } from "antd";
import { DeleteOutlined, CheckCircleFilled, PercentageOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { activeBrandConfig } from "../../config/brandConfig";
import type { OrderLineItem } from "../../context/OrderContext";

/** Color schemes for auto-applied promo tags */
const promoTagColors: Record<string, { bg: string; text: string }> = {
  discount: { bg: "#FFF3E8", text: "#C2660A" },   // % discount
  flat: { bg: "#EEF4FF", text: "#2563A8" },        // flat $ discount
  bxgy: { bg: "#DCFCE7", text: "#0D7A4A" },       // Buy X Get Y
};

function getPromoTagStyle(label?: string): { bg: string; text: string } {
  if (!label) return promoTagColors.discount;
  const lower = label.toLowerCase();
  if (lower.includes("buy") || lower.includes("get") || lower.includes("free")) return promoTagColors.bxgy;
  if (lower.startsWith("$")) return promoTagColors.flat;
  return promoTagColors.discount;
}

interface CartLineItemProps {
  item: OrderLineItem;
  isLast: boolean;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

export default function CartLineItem({ item, isLast, onUpdateQuantity, onRemove }: CartLineItemProps) {
  const config = activeBrandConfig;
  const isFree = !!item.isFreeItem;
  const variantDesc = Object.values(item.variantAttributes || {}).join(" · ");
  const lineTotal = isFree ? 0 : item.quantity * item.unitPrice;
  const lineSavings = isFree ? 0 : (item.listPrice && item.listPrice > item.unitPrice)
    ? (item.listPrice - item.unitPrice) * item.quantity
    : 0;

  const tagStyle = getPromoTagStyle(item.promotionLabel);

  return (
    <div
      className="grid grid-cols-[1fr_120px_100px_40px] gap-4 px-5 py-4 items-center"
      style={{
        borderBottom: !isLast ? `1px solid ${config.borderColor}` : "none",
        backgroundColor: isFree ? "#F0FDF4" : "transparent",
        borderLeft: isFree ? "3px solid #22C55E" : "none",
      }}
    >
      {/* Product Info */}
      <div className="flex items-center gap-3 min-w-0">
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.productName}
            className="w-12 h-12 rounded-lg object-cover shrink-0"
          />
        )}
        <div className="min-w-0">
          <Link
            to={`/product/${encodeURIComponent(item.productId)}/sku/${encodeURIComponent(item.id)}`}
            className="text-sm font-medium truncate block no-underline hover:underline"
            style={{ color: isFree ? "#0D7A4A" : config.primaryColor }}
          >
            {item.productName}
          </Link>
          <p className="text-xs mt-0.5" style={{ color: config.secondaryColor }}>
            {item.sku}{variantDesc ? ` · ${variantDesc}` : ""}
          </p>

          {isFree ? (
            /* Type D: Free goods label */
            <div className="mt-1.5">
              <span
                className="inline-flex items-center gap-1 text-[10px] font-semibold rounded"
                style={{ backgroundColor: "#DCFCE7", color: "#0D7A4A", padding: "2px 8px" }}
              >
                <PercentageOutlined style={{ fontSize: 12 }} />
                FREE GOODS · {item.promotionLabel || "Buy X Get Y"}
              </span>
            </div>
          ) : (
            /* Type A/B/C: Price + auto-applied promo tag */
            <div className="mt-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
                  ${item.unitPrice.toFixed(2)}
                </span>
                {item.listPrice && item.listPrice > item.unitPrice && (
                  <span className="text-[11px] line-through" style={{ color: config.secondaryColor }}>
                    ${item.listPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Auto-applied promotion tag */}
              {item.promotionLabel && (
                <div className="mt-1.5">
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-semibold rounded"
                    style={{ backgroundColor: tagStyle.bg, color: tagStyle.text, padding: "2px 8px" }}
                  >
                    <CheckCircleFilled style={{ fontSize: 12 }} />
                    {item.promotionLabel} auto-applied
                    {lineSavings > 0 && ` · Saved $${lineSavings.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quantity */}
      <div className="flex justify-center">
        {isFree ? (
          <span className="text-xs font-medium" style={{ color: "#16A34A" }}>
            {item.quantity}
          </span>
        ) : (
          <InputNumber
            size="small"
            min={1}
            value={item.quantity}
            onChange={(val) => val && onUpdateQuantity(item.id, val)}
            style={{ width: 80 }}
          />
        )}
      </div>

      {/* Line Total */}
      <div className="text-right">
        <span className="text-sm font-medium" style={{ color: isFree ? "#16A34A" : config.primaryColor }}>
          {isFree ? "$0.00" : `$${lineTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
        </span>
      </div>

      {/* Remove — hidden for free goods rows */}
      <div className="flex justify-center">
        {!isFree && (
          <button
            onClick={() => onRemove(item.id)}
            className="p-1.5 rounded-md transition-colors cursor-pointer"
            style={{ color: config.secondaryColor, border: "none", background: "none" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#DC2626";
              e.currentTarget.style.backgroundColor = "#FEF2F2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = config.secondaryColor;
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <DeleteOutlined className="text-sm" />
          </button>
        )}
      </div>
    </div>
  );
}
