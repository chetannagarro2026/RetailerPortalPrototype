import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftOutlined, FileTextOutlined, CustomerServiceOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { activeBrandConfig } from "../config/brandConfig";
import { fetchSalesOrderById, type SalesOrderDetail } from "../services/salesOrderSearchService";
import CreateTicketDrawer from "../components/support/CreateTicketDrawer";

// ── Status mapping ──────────────────────────────────────────────────

const mapStatusToLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    PROCESSING: "Processing",
    ON_HOLD: "On Hold",
    UNPROCESSED: "Pending",
    PROCESSED: "Approved",
    ACCEPTED: "Accepted",
    RECEIVED: "Received",
    COMPLETED: "Shipped",
    PARTIALLY_COMPLETED: "Partially Shipped",
    CANCELLED: "Cancelled",
    REJECTED: "Rejected",
  };
  return statusMap[status] || status;
};

const STATUS_COLORS: Record<string, string> = {
  Processing: "#2563EB",
  "On Hold": "#D97706",
  Pending: "#D97706",
  Approved: "#059669",
  Accepted: "#059669",
  Received: "#059669",
  Shipped: "#16A34A",
  "Partially Shipped": "#7C3AED",
  Cancelled: "#DC2626",
  Rejected: "#DC2626",
};

// ── Helpers ─────────────────────────────────────────────────────────

function formatCurrency(val: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(val);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Page ────────────────────────────────────────────────────────────

export default function PurchaseOrderDetailPage() {
  const config = activeBrandConfig;
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch order details
  const { data: order, isLoading, error } = useQuery({
    queryKey: ["salesOrder", orderId],
    queryFn: () => fetchSalesOrderById(Number(orderId)),
    enabled: !!orderId && !isNaN(Number(orderId)),
    staleTime: 2 * 60 * 1000,
  });

  // Loading state
  if (isLoading) {
    return (
      <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "64px 24px", boxSizing: "border-box" }} className="text-center">
        <Spin size="large" />
        <p className="text-sm mt-4" style={{ color: config.secondaryColor }}>
          Loading order details...
        </p>
      </div>
    );
  }

  // Error or not found state
  if (error || !order) {
    return (
      <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "64px 24px", boxSizing: "border-box" }} className="text-center">
        <FileTextOutlined className="text-5xl mb-4" style={{ color: config.secondaryColor }} />
        <h1 className="text-xl font-semibold mb-2" style={{ color: config.primaryColor }}>
          Order Not Found
        </h1>
        <p className="text-sm mb-6" style={{ color: config.secondaryColor }}>
          The order you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/purchase-orders"
          className="text-sm font-medium no-underline px-6 py-2.5 rounded-lg text-white inline-block"
          style={{ backgroundColor: config.primaryColor }}
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const displayStatus = mapStatusToLabel(order.salesOrderState || order.status);
  const statusColor = STATUS_COLORS[displayStatus] || "#D97706";

  return (
    <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "24px 24px", boxSizing: "border-box" }}>
      {/* Back link */}
      <button
        onClick={() => navigate("/purchase-orders")}
        className="flex items-center gap-2 text-sm font-medium cursor-pointer bg-transparent border-none mb-6 px-0"
        style={{ color: config.secondaryColor }}
      >
        <ArrowLeftOutlined style={{ fontSize: 12 }} />
        Back to Purchase Orders
      </button>

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold mb-1" style={{ color: config.primaryColor }}>
            Order {order.applicationOrderID || `SO-${order.omsOrderID}`}
          </h1>
          <p className="text-xs" style={{ color: config.secondaryColor }}>
            Placed on {formatDate(order.customerOrderDate || order.createDateTime)}
          </p>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
          style={{
            border: `1px solid ${config.borderColor}`,
            backgroundColor: "#fff",
            color: config.secondaryColor,
          }}
        >
          <CustomerServiceOutlined style={{ fontSize: 14 }} />
          Raise Ticket
        </button>
      </div>

      {/* Meta strip */}
      <OrderDetailMeta order={order} displayStatus={displayStatus} statusColor={statusColor} />

      {/* Shipping / Billing Info */}
      <OrderDetailShipping order={order} />

      {/* Items */}
      <OrderDetailItems order={order} />

      {/* Create Ticket Drawer */}
      <CreateTicketDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={(ticketId) => {
          setDrawerOpen(false);
          navigate(`/account/support/${ticketId}`);
        }}
        preset={{
          category: "Order Issue",
          relatedDocument: order.applicationOrderID || `SO-${order.omsOrderID}`,
          lockDocument: true,
        }}
      />
    </div>
  );
}

// ── Order Detail Meta ───────────────────────────────────────────────

function OrderDetailMeta({
  order,
  displayStatus,
  statusColor,
}: {
  order: SalesOrderDetail;
  displayStatus: string;
  statusColor: string;
}) {
  const config = activeBrandConfig;

  const fields = [
    { label: "Status", value: displayStatus, isStatus: true },
    { label: "Total", value: formatCurrency(order.orderTotalAmount, order.currencyCode) },
    { label: "Items", value: String(order.salesOrderLineItems?.length || 0) },
    { label: "Delivery", value: order.deliveryMode?.replace(/_/g, " ") || "Standard" },
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

// ── Order Detail Shipping ───────────────────────────────────────────

function OrderDetailShipping({ order }: { order: SalesOrderDetail }) {
  const config = activeBrandConfig;

  // Get shipping contact from first line item
  const shippingContact = order.salesOrderLineItems?.[0]?.shippingContact;
  // Get billing contact from payment info
  const billingContact = order.paymentInformations?.[0]?.billingContact;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Ship To */}
      <div
        className="rounded-xl p-5"
        style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: config.secondaryColor }}>
          Ship To
        </p>
        {shippingContact ? (
          <>
            <p className="text-sm font-medium" style={{ color: config.primaryColor }}>
              {shippingContact.givenName} {shippingContact.familyName}
            </p>
            <p className="text-xs mt-1" style={{ color: config.secondaryColor }}>
              {[shippingContact.addressLine1, shippingContact.addressLine2, shippingContact.cityName, shippingContact.stateProvinceName, shippingContact.postalCode].filter(Boolean).join(", ")}
            </p>
            {shippingContact.dialPhoneNumber && (
              <p className="text-xs mt-0.5" style={{ color: config.secondaryColor }}>
                {shippingContact.dialPhoneNumber}
              </p>
            )}
          </>
        ) : (
          <p className="text-xs" style={{ color: config.secondaryColor }}>
            Ship To: {order.shipTo || "—"}
          </p>
        )}
      </div>

      {/* Bill To */}
      <div
        className="rounded-xl p-5"
        style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: config.secondaryColor }}>
          Bill To
        </p>
        {billingContact ? (
          <>
            <p className="text-sm font-medium" style={{ color: config.primaryColor }}>
              {billingContact.givenName} {billingContact.familyName}
            </p>
            <p className="text-xs mt-1" style={{ color: config.secondaryColor }}>
              {[billingContact.addressLine1, billingContact.addressLine2, billingContact.cityName, billingContact.stateProvinceName, billingContact.postalCode].filter(Boolean).join(", ")}
            </p>
            {billingContact.emailAddressID && (
              <p className="text-xs mt-0.5" style={{ color: config.secondaryColor }}>
                {billingContact.emailAddressID}
              </p>
            )}
          </>
        ) : (
          <p className="text-xs" style={{ color: config.secondaryColor }}>
            Bill To: {order.billTo || "—"}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Order Detail Items ──────────────────────────────────────────────

function OrderDetailItems({ order }: { order: SalesOrderDetail }) {
  const config = activeBrandConfig;
  const items = order.salesOrderLineItems || [];

  return (
    <div
      className="rounded-xl overflow-hidden mb-6"
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
        const variantDesc = [item.sourceSystemItemColorDescription, item.sourceSystemItemSizeDescription]
          .filter(Boolean)
          .join(" · ");

        return (
          <div
            key={item.salesOrderlineItemId}
            className="flex items-center justify-between px-5 py-3"
            style={{ borderBottom: idx < items.length - 1 ? `1px solid ${config.borderColor}` : "none" }}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate" style={{ color: config.primaryColor }}>
                {item.sourceSystemItemDescription || `Item ${item.lineID}`}
              </p>
              <p className="text-xs" style={{ color: config.secondaryColor }}>
                UPC: {item.upcID}{variantDesc ? ` · ${variantDesc}` : ""} · Qty: {item.requestedQuantity}
              </p>
            </div>
            <span className="text-sm font-medium shrink-0 ml-4" style={{ color: config.primaryColor }}>
              {formatCurrency(item.unitPriceSellingAmount * item.requestedQuantity, item.unitPriceSellingAmountCurrencyCode)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
