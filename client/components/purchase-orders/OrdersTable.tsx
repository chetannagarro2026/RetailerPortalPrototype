import { activeBrandConfig } from "../../config/brandConfig";
import type { PurchaseOrder } from "../../context/OrderHistoryContext";

// ── Status Badge (outlined) ─────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  "Pending Credit Approval": "#D97706",
  Accepted: "#2563EB",
  Processing: "#2563EB",
  Delivered: "#16A34A",
  Rejected: "#DC2626",
  Pending: "#D97706",
  Confirmed: "#2563EB",
  Shipped: "#7C3AED",
};

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || "#D97706";
  return (
    <span
      className="text-[11px] font-medium px-2 py-0.5 rounded whitespace-nowrap"
      style={{ color, backgroundColor: "transparent", border: `1px solid ${color}` }}
    >
      {status}
    </span>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatCurrency(val: number): string {
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function formatAddress(s: PurchaseOrder["shipping"]): string {
  return [s.address, s.city, s.state, s.zip].filter(Boolean).join(", ");
}

// ── Table ───────────────────────────────────────────────────────────

interface Props {
  orders: PurchaseOrder[];
  onRowClick: (order: PurchaseOrder) => void;
}

export default function OrdersTable({ orders, onRowClick }: Props) {
  const config = activeBrandConfig;

  const columns = "minmax(120px,140px) 100px 1fr 120px 130px 140px";

  if (orders.length === 0) {
    return (
      <div
        className="rounded-xl text-center py-16"
        style={{ border: `1px solid ${config.borderColor}` }}
      >
        <p className="text-sm" style={{ color: config.secondaryColor }}>
          No orders match this filter.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${config.borderColor}` }}
    >
      {/* Header */}
      <div
        className="grid gap-4 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider"
        style={{
          gridTemplateColumns: columns,
          backgroundColor: config.cardBg,
          color: config.secondaryColor,
          borderBottom: `1px solid ${config.borderColor}`,
        }}
      >
        <span>Order #</span>
        <span>Date</span>
        <span>Shipping Address</span>
        <span className="text-right">Total</span>
        <span>Payment</span>
        <span>Status</span>
      </div>

      {/* Rows */}
      {orders.map((order, idx) => (
        <div
          key={order.orderNumber}
          onClick={() => onRowClick(order)}
          className="grid gap-4 px-5 py-4 items-center transition-colors cursor-pointer"
          style={{
            gridTemplateColumns: columns,
            borderBottom: idx < orders.length - 1 ? `1px solid ${config.borderColor}` : "none",
            backgroundColor: "#fff",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = config.cardBg; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; }}
        >
          <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
            {order.orderNumber}
          </span>
          <span className="text-xs" style={{ color: config.secondaryColor }}>
            {formatDate(order.submittedAt)}
          </span>
          <span
            className="text-xs truncate"
            style={{ color: config.secondaryColor }}
            title={formatAddress(order.shipping)}
          >
            {formatAddress(order.shipping)}
          </span>
          <span className="text-sm font-medium text-right" style={{ color: config.primaryColor }}>
            {formatCurrency(order.totalValue)}
          </span>
          <span className="text-xs" style={{ color: config.secondaryColor }}>
            {order.paymentMethod}
          </span>
          <StatusBadge status={order.status} />
        </div>
      ))}
    </div>
  );
}
