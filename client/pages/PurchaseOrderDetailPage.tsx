import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeftOutlined, FileTextOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../config/brandConfig";
import { useOrderHistory } from "../context/OrderHistoryContext";
import OrderDetailMeta from "../components/purchase-orders/OrderDetailMeta";
import OrderDetailShipping from "../components/purchase-orders/OrderDetailShipping";
import OrderDetailItems from "../components/purchase-orders/OrderDetailItems";

// ── Normalise legacy statuses ───────────────────────────────────────

function normaliseStatus(s: string): string {
  if (s === "Pending") return "Pending Credit Approval";
  if (s === "Confirmed" || s === "Shipped") return "Processing";
  return s;
}

// ── Page ────────────────────────────────────────────────────────────

export default function PurchaseOrderDetailPage() {
  const config = activeBrandConfig;
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { orders } = useOrderHistory();

  const order = orders.find((o) => o.orderNumber === orderId);

  if (!order) {
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

  const displayStatus = normaliseStatus(order.status);

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
            Order {order.orderNumber}
          </h1>
          <p className="text-xs" style={{ color: config.secondaryColor }}>
            Placed on {new Date(order.submittedAt).toLocaleDateString("en-GB")}
          </p>
        </div>
      </div>

      {/* Meta strip */}
      <OrderDetailMeta order={order} displayStatus={displayStatus} />

      {/* Shipping */}
      <OrderDetailShipping shipping={order.shipping} />

      {/* Items */}
      <OrderDetailItems items={order.items} />
    </div>
  );
}
