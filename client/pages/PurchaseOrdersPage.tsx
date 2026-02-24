import { useState } from "react";
import { Link } from "react-router-dom";
import { FileTextOutlined, EyeOutlined, ShoppingOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../config/brandConfig";
import { useOrderHistory, type PurchaseOrder } from "../context/OrderHistoryContext";

// ── Status Badge ────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  Pending: { color: "#D97706", bg: "#FFF7ED" },
  Confirmed: { color: "#2563EB", bg: "#EFF6FF" },
  Shipped: { color: "#7C3AED", bg: "#F5F3FF" },
  Delivered: { color: "#16A34A", bg: "#F0FDF4" },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  return (
    <span
      className="text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ color: style.color, backgroundColor: style.bg }}
    >
      {status}
    </span>
  );
}

// ── Order Detail Panel ──────────────────────────────────────────────

function OrderDetailPanel({
  order,
  onClose,
}: {
  order: PurchaseOrder;
  onClose: () => void;
}) {
  const config = activeBrandConfig;
  const fmt = (val: number) =>
    "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 });

  return (
    <div
      className="rounded-xl p-6"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold" style={{ color: config.primaryColor }}>
          Order {order.orderNumber}
        </h2>
        <button
          onClick={onClose}
          className="text-xs font-medium cursor-pointer bg-transparent border-none"
          style={{ color: config.secondaryColor }}
        >
          Close
        </button>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: config.secondaryColor }}>
            Date
          </p>
          <p className="text-sm mt-0.5" style={{ color: config.primaryColor }}>
            {new Date(order.submittedAt).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: config.secondaryColor }}>
            Status
          </p>
          <div className="mt-1">
            <StatusBadge status={order.status} />
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: config.secondaryColor }}>
            Payment
          </p>
          <p className="text-sm mt-0.5" style={{ color: config.primaryColor }}>
            {order.paymentMethod}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: config.secondaryColor }}>
            Total
          </p>
          <p className="text-sm font-semibold mt-0.5" style={{ color: config.primaryColor }}>
            {fmt(order.totalValue)}
          </p>
        </div>
      </div>

      {/* Ship To */}
      <div
        className="rounded-lg p-4 mb-5"
        style={{ backgroundColor: config.cardBg, border: `1px solid ${config.borderColor}` }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: config.secondaryColor }}>
          Ship To
        </p>
        <p className="text-sm" style={{ color: config.primaryColor }}>
          {order.shipping.contactName}
          {order.shipping.companyName && ` — ${order.shipping.companyName}`}
        </p>
        <p className="text-xs mt-0.5" style={{ color: config.secondaryColor }}>
          {order.shipping.address}, {order.shipping.city}, {order.shipping.state} {order.shipping.zip}
        </p>
        {order.shipping.phone && (
          <p className="text-xs mt-0.5" style={{ color: config.secondaryColor }}>
            {order.shipping.phone}
          </p>
        )}
      </div>

      {/* Items */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: config.secondaryColor }}>
          Items ({order.items.length})
        </p>
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: `1px solid ${config.borderColor}` }}
        >
          {order.items.map((item, idx) => {
            const variantDesc = Object.values(item.variantAttributes || {}).join(" · ");
            return (
              <div
                key={item.id}
                className="flex items-center justify-between px-4 py-3"
                style={{
                  borderBottom: idx < order.items.length - 1 ? `1px solid ${config.borderColor}` : "none",
                }}
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
                      {item.upc}{variantDesc ? ` · ${variantDesc}` : ""} · Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium shrink-0 ml-4" style={{ color: config.primaryColor }}>
                  {fmt(item.quantity * item.unitPrice)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────

export default function PurchaseOrdersPage() {
  const config = activeBrandConfig;
  const { orders } = useOrderHistory();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const fmt = (val: number) =>
    "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 });

  const detail = selectedOrder ? orders.find((o) => o.orderNumber === selectedOrder) : null;

  if (orders.length === 0) {
    return (
      <div className="max-w-content mx-auto px-6 py-16 text-center">
        <FileTextOutlined className="text-5xl mb-4" style={{ color: config.secondaryColor }} />
        <h1 className="text-xl font-semibold mb-2" style={{ color: config.primaryColor }}>
          No Purchase Orders
        </h1>
        <p className="text-sm mb-6" style={{ color: config.secondaryColor }}>
          Your submitted orders will appear here.
        </p>
        <Link
          to="/catalog"
          className="text-sm font-medium no-underline px-6 py-2.5 rounded-lg text-white inline-block"
          style={{ backgroundColor: config.primaryColor }}
        >
          <ShoppingOutlined className="mr-1.5" />
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-content mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-1" style={{ color: config.primaryColor }}>
          Purchase Orders
        </h1>
        <p className="text-sm" style={{ color: config.secondaryColor }}>
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Detail Panel (above table when open) */}
      {detail && (
        <div className="mb-6">
          <OrderDetailPanel order={detail} onClose={() => setSelectedOrder(null)} />
        </div>
      )}

      {/* Orders Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: `1px solid ${config.borderColor}` }}
      >
        {/* Header */}
        <div
          className="grid gap-4 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider"
          style={{
            gridTemplateColumns: "140px 100px 1fr 120px 130px 100px 80px",
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
          <span className="text-center">Actions</span>
        </div>

        {/* Rows */}
        {orders.map((order, idx) => (
          <div
            key={order.orderNumber}
            className="grid gap-4 px-5 py-4 items-center transition-colors"
            style={{
              gridTemplateColumns: "140px 100px 1fr 120px 130px 100px 80px",
              borderBottom: idx < orders.length - 1 ? `1px solid ${config.borderColor}` : "none",
              backgroundColor: selectedOrder === order.orderNumber ? config.cardBg : "#fff",
            }}
          >
            <span className="text-sm font-medium" style={{ color: config.primaryColor }}>
              {order.orderNumber}
            </span>
            <span className="text-xs" style={{ color: config.secondaryColor }}>
              {new Date(order.submittedAt).toLocaleDateString()}
            </span>
            <span className="text-xs truncate" style={{ color: config.secondaryColor }}>
              {order.shipping.address}, {order.shipping.city}, {order.shipping.state} {order.shipping.zip}
            </span>
            <span className="text-sm font-medium text-right" style={{ color: config.primaryColor }}>
              {fmt(order.totalValue)}
            </span>
            <span className="text-xs" style={{ color: config.secondaryColor }}>
              {order.paymentMethod}
            </span>
            <StatusBadge status={order.status} />
            <div className="flex justify-center">
              <button
                onClick={() =>
                  setSelectedOrder(
                    selectedOrder === order.orderNumber ? null : order.orderNumber,
                  )
                }
                className="p-1.5 rounded-md cursor-pointer transition-colors"
                style={{ color: config.primaryColor, border: "none", background: "none" }}
                title="View Details"
              >
                <EyeOutlined className="text-sm" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
