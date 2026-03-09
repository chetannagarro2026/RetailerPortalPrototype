import { activeBrandConfig } from "../../config/brandConfig";
import type { PurchaseOrder } from "../../context/OrderHistoryContext";

function formatCurrency(val: number): string {
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

interface Props {
  items: PurchaseOrder["items"];
}

export default function OrderDetailItems({ items }: Props) {
  const config = activeBrandConfig;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider"
        style={{ backgroundColor: config.cardBg, color: config.secondaryColor, borderBottom: `1px solid ${config.borderColor}` }}
      >
        Items ({items.length})
      </div>

      {/* Rows */}
      {items.map((item, idx) => {
        const variantDesc = Object.values(item.variantAttributes || {}).join(" · ");
        return (
          <div
            key={item.id}
            className="flex items-center justify-between px-5 py-3"
            style={{ borderBottom: idx < items.length - 1 ? `1px solid ${config.borderColor}` : "none" }}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.productName} className="w-10 h-10 rounded-md object-cover shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: config.primaryColor }}>
                  {item.productName}
                </p>
                <p className="text-xs" style={{ color: config.secondaryColor }}>
                  {item.sku}{variantDesc ? ` · ${variantDesc}` : ""} · Qty: {item.quantity}
                </p>
              </div>
            </div>
            <span className="text-sm font-medium shrink-0 ml-4" style={{ color: config.primaryColor }}>
              {formatCurrency(item.quantity * item.unitPrice)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
