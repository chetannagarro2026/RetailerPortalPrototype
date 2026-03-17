import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShoppingOutlined, RightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Spin } from "antd";
import { activeBrandConfig, formatCurrency } from "../../config/brandConfig";
import { fetchSalesOrderStatusCounts, fetchSalesOrders } from "../../services/salesOrderSearchService";
import { useAuth } from "../../context/AuthContext";

const fmt = (v: number) => formatCurrency(v, 0);

const statusAmounts: Record<string, number> = {
  "Pending Approval": 13500,
  "Approved": 24800,
  "Shipped": 42600,
  "Rejected": 2100,
};

// Map API status to UI status label
const mapStatusToLabel = (requestState: string): string => {
  const processing = ["PROCESSING", "ON_HOLD"];
  const approved = ["PROCESSED", "ACCEPTED", "RECEIVED"];
  const shipped = ["COMPLETED", "PARTIALLY_COMPLETED"];
  const rejected = ["CANCELLED", "REJECTED"];

  if (processing.includes(requestState)) return "Pending";
  if (approved.includes(requestState)) return "Approved";
  if (shipped.includes(requestState)) return "Shipped";
  if (rejected.includes(requestState)) return "Rejected";
  return "Pending";
};

// Map status label to color
const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    "Pending": "#D97706",
    "Approved": "#059669",
    "Shipped": "#2563EB",
    "Rejected": "#DC2626",
  };
  return colorMap[status] || "#6B7280";
};

// Map table status values to filter labels
const statusToFilter: Record<string, string> = {
  Pending: "Pending Approval",
  Approved: "Approved",
  Shipped: "Shipped",
  Rejected: "Rejected",
};

export default function OrdersOverview() {
  const config = activeBrandConfig;
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Fetch real order status counts
  const { data: statusCounts, isLoading } = useQuery({
    queryKey: ["salesOrderStatusCounts", user?.accountId],
    queryFn: () => fetchSalesOrderStatusCounts(user?.accountId || null),
    enabled: !!user?.accountId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch recent orders
  const { data: recentOrdersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["recentSalesOrders", user?.accountId],
    queryFn: () => fetchSalesOrders(0, 20, user?.accountId || null),
    enabled: !!user?.accountId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Transform API orders to table format
  const recentOrders = useMemo(() => {
    if (!recentOrdersData) return [];

    return recentOrdersData.map((order) => {
      const totalQuantity = order.lineItemInfo.reduce((sum, item) => sum + item.requestedQuantity, 0);
      const status = mapStatusToLabel(order.requestState);

      return {
        id: order.salesOrderId.toString(),
        poNumber: order.applicationOrderId,
        date: order.orderDate,
        brand: "Johnson & Johnson Vision", // Static as requested
        amount: totalQuantity,
        status,
        statusColor: getStatusColor(status),
      };
    });
  }, [recentOrdersData]);

  // Transform API response to our UI format
  const orderStatuses = useMemo(() => {
    if (!statusCounts) {
      return [
        { label: "Pending Approval", count: 0, color: "#D97706" },
        { label: "Approved", count: 0, color: "#059669" },
        { label: "Shipped", count: 0, color: "#2563EB" },
        { label: "Rejected", count: 0, color: "#DC2626" },
      ];
    }

    return [
      {
        label: "Pending Approval",
        count: (statusCounts.PROCESSING || 0) + (statusCounts.ON_HOLD || 0) + (statusCounts.UNPROCESSED || 0),
        color: "#D97706",
      },
      {
        label: "Approved",
        count: (  statusCounts.PROCESSED || 0) + (statusCounts.ACCEPTED || 0) + (statusCounts.RECEIVED || 0),
        color: "#059669",
      },
      {
        label: "Shipped",
        count: statusCounts.COMPLETED || 0,
        color: "#2563EB",
      },
      {
        label: "Rejected",
        count: (  statusCounts.CANCELLED || 0) + (statusCounts.REJECTED || 0),
        color: "#DC2626",
      },
    ];
  }, [statusCounts]);

  const totalActive = orderStatuses.reduce((a, s) => a + s.count, 0);
  const totalAmount = Object.values(statusAmounts).reduce((a, v) => a + v, 0);
  const pendingCount = orderStatuses.find((s) => s.label === "Pending Approval")?.count || 0;

  const filteredOrders = useMemo(() => {
    if (!activeFilter) return recentOrders;
    return recentOrders.filter((o) => statusToFilter[o.status] === activeFilter);
  }, [activeFilter, recentOrders]);

  return (
    <div
      className="rounded-xl bg-white"
      style={{ border: `1px solid ${config.borderColor}` }}
    >
      <div className="p-6">
        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <ShoppingOutlined className="text-base" style={{ color: config.primaryColor }} />
            <h2 className="text-xs font-bold m-0 uppercase tracking-widest" style={{ color: config.primaryColor }}>
              Orders Overview
            </h2>
          </div>
          <Link
            to="/purchase-orders"
            className="text-xs font-medium flex items-center gap-1 no-underline"
            style={{ color: config.primaryColor }}
          >
            View All Orders <RightOutlined className="text-[9px]" />
          </Link>
        </div>

        {/* Horizontal status filter bar */}
        <div
          className="flex gap-2 mb-5 pb-5"
          style={{ borderBottom: `1px solid ${config.borderColor}` }}
        >
          {isLoading ? (
            <div className="flex-1 flex justify-center items-center py-4">
              <Spin size="small" />
            </div>
          ) : (
            <>
              {/* All Orders filter */}
              <FilterChip
                label="All Orders"
                count={totalActive}
                amount={totalAmount}
                color={config.primaryColor}
                active={activeFilter === null}
                onClick={() => setActiveFilter(null)}
              />
              {orderStatuses.map((s) => (
                <FilterChip
                  key={s.label}
                  label={s.label}
                  count={s.count}
                  amount={statusAmounts[s.label] || 0}
                  color={s.color}
                  active={activeFilter === s.label}
                  onClick={() => setActiveFilter(activeFilter === s.label ? null : s.label)}
                />
              ))}
            </>
          )}
        </div>

        {/* Inline pending message */}
        {pendingCount > 0 && !activeFilter && (
          <p className="text-xs m-0 mb-4" style={{ color: "#92400E" }}>
            <span style={{ color: "#D97706" }}>&#9888;</span> {pendingCount} Orders Awaiting Credit Approval
          </p>
        )}

        {/* Recent Orders table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <Th>PO #</Th>
                <Th>Date</Th>
                <Th>Brand</Th>
                <Th align="right">Quantity</Th>
                <Th align="right">Status</Th>
              </tr>
            </thead>
            <tbody>
              {ordersLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center">
                    <Spin size="small" />
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs" style={{ color: "#9CA3AF" }}>
                    No orders match this filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="cursor-pointer transition-colors"
                    style={{ borderTop: `1px solid ${config.borderColor}` }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "#F9FAFB";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                    }}
                  >
                    <td className="py-3.5 text-xs font-bold" style={{ color: config.primaryColor }}>
                      {o.poNumber}
                    </td>
                    <td className="py-3.5 text-xs" style={{ color: "#6B7280" }}>
                      {new Date(o.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="py-3.5 text-xs" style={{ color: "#374151" }}>
                      {o.brand}
                    </td>
                    <td className="py-3.5 text-xs text-right font-medium" style={{ color: "#374151" }}>
                      {Math.round(o.amount)}
                    </td>
                    <td className="py-3.5 text-right">
                      <span
                        className="inline-block text-[11px] font-medium px-2 py-0.5 rounded"
                        style={{
                          color: o.statusColor,
                          backgroundColor: "transparent",
                          border: `1px solid ${o.statusColor}`,
                        }}
                      >
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Filter chip ─── */

function FilterChip({
  label,
  count,
  amount,
  color,
  active,
  onClick,
}: {
  label: string;
  count: number;
  amount: number;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  const config = activeBrandConfig;
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-left cursor-pointer transition-all border-none"
      style={{
        backgroundColor: active ? color + "10" : "transparent",
        border: active ? `1px solid ${color}30` : `1px solid transparent`,
        outline: "none",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = "#F9FAFB";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="text-xs whitespace-nowrap" style={{ color: active ? color : "#374151" }}>
        {label}
      </span>
      <span className="text-xs font-bold" style={{ color: active ? color : config.primaryColor }}>
        {count}
      </span>
      <span className="text-[10px]" style={{ color: config.secondaryColor }}>
        {fmt(amount)}
      </span>
    </button>
  );
}

/* ─── Table header cell ─── */

function Th({ children, align = "left" }: { children: React.ReactNode; align?: string }) {
  const config = activeBrandConfig;
  return (
    <th
      className="text-[11px] font-semibold uppercase tracking-wider pb-2.5"
      style={{ color: config.secondaryColor, textAlign: align as any }}
    >
      {children}
    </th>
  );
}
