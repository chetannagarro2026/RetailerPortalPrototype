import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FileTextOutlined, ShoppingOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../config/brandConfig";
import { useOrderHistory, type PurchaseOrder } from "../context/OrderHistoryContext";
import StatusSegmentedFilter from "../components/purchase-orders/StatusSegmentedFilter";
import OrdersTable from "../components/purchase-orders/OrdersTable";

// ── Normalise legacy statuses to MVP set ────────────────────────────

function normaliseStatus(s: string): string {
  if (s === "Pending") return "Pending Credit Approval";
  if (s === "Confirmed" || s === "Shipped") return "Processing";
  return s;
}

const FILTER_KEYS = ["All", "Pending Credit Approval", "Accepted", "Processing", "Delivered", "Rejected"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

// ── Main Page ───────────────────────────────────────────────────────

export default function PurchaseOrdersPage() {
  const config = activeBrandConfig;
  const navigate = useNavigate();
  const { orders: rawOrders } = useOrderHistory();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");

  // Normalise statuses for display
  const orders = useMemo(
    () => rawOrders.map((o) => ({ ...o, status: normaliseStatus(o.status) as PurchaseOrder["status"] })),
    [rawOrders],
  );

  // Count per status
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const k of FILTER_KEYS) map[k] = 0;
    for (const o of orders) {
      const s = normaliseStatus(o.status);
      map[s] = (map[s] || 0) + 1;
    }
    map["All"] = orders.length;
    return map;
  }, [orders]);

  // Filtered list
  const filtered = useMemo(
    () => (activeFilter === "All" ? orders : orders.filter((o) => normaliseStatus(o.status) === activeFilter)),
    [orders, activeFilter],
  );

  const handleRowClick = (order: PurchaseOrder) => {
    navigate(`/purchase-orders/${order.orderNumber}`);
  };

  // ── Empty state ─────────────────────────────────────────────────

  if (rawOrders.length === 0) {
    return (
      <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "64px 24px", boxSizing: "border-box" }} className="text-center">
        <FileTextOutlined className="text-5xl mb-4" style={{ color: config.secondaryColor }} />
        <h1 className="text-xl font-semibold mb-2" style={{ color: config.primaryColor }}>
          No Purchase Orders Yet
        </h1>
        <p className="text-sm mb-6" style={{ color: config.secondaryColor }}>
          Orders you place will appear here.
        </p>
        <Link
          to="/catalog"
          className="text-sm font-medium no-underline px-6 py-2.5 rounded-lg text-white inline-block"
          style={{ backgroundColor: config.primaryColor }}
        >
          <ShoppingOutlined className="mr-1.5" />
          Place Order
        </Link>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────

  return (
    <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "24px 24px", boxSizing: "border-box" }}>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-1" style={{ color: config.primaryColor }}>
          Purchase Orders
        </h1>
        <p className="text-sm" style={{ color: config.secondaryColor }}>
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Status Segmented Filter */}
      <div className="mb-6">
        <StatusSegmentedFilter
          filters={FILTER_KEYS as unknown as string[]}
          counts={counts}
          active={activeFilter}
          onSelect={(f) => setActiveFilter(f as FilterKey)}
        />
      </div>

      {/* Orders Table */}
      <OrdersTable orders={filtered} onRowClick={handleRowClick} />
    </div>
  );
}
