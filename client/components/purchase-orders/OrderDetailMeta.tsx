import { activeBrandConfig } from "../../config/brandConfig";
import type { PurchaseOrder } from "../../context/OrderHistoryContext";

const STATUS_COLORS: Record<string, string> = {
  "Pending Credit Approval": "#D97706",
  Accepted: "#2563EB",
  Processing: "#2563EB",
  Delivered: "#16A34A",
  Rejected: "#DC2626",
};

function formatCurrency(val: number): string {
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

interface Props {
  order: PurchaseOrder;
  displayStatus: string;
}

export default function OrderDetailMeta({ order, displayStatus }: Props) {
  const config = activeBrandConfig;
  const statusColor = STATUS_COLORS[displayStatus] || "#D97706";

  const fields = [
    { label: "Status", value: displayStatus, isStatus: true },
    { label: "Total", value: formatCurrency(order.totalValue) },
    { label: "Units", value: String(order.totalUnits) },
    { label: "Payment", value: order.paymentMethod },
  ];

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-6 rounded-xl p-5 mb-6"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      {fields.map((f) => (
        <div key={f.label}>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: config.secondaryColor }}>
            {f.label}
          </p>
          {f.isStatus ? (
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded whitespace-nowrap"
              style={{ color: statusColor, backgroundColor: "transparent", border: `1px solid ${statusColor}` }}
            >
              {displayStatus}
            </span>
          ) : (
            <p className="text-sm font-medium mt-0.5" style={{ color: config.primaryColor }}>
              {f.value}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
