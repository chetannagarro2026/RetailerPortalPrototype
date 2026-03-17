import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileTextOutlined, ShoppingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { activeBrandConfig } from "../config/brandConfig";
import { useAuth } from "../context/AuthContext";
import { fetchSalesOrderStatusCounts, fetchSalesOrdersWithPagination, type SalesOrder } from "../services/salesOrderSearchService";
import StatusSegmentedFilter from "../components/purchase-orders/StatusSegmentedFilter";

// ── Status mapping ──────────────────────────────────────────────────

const FILTER_KEYS = ["All", "Pending", "Unprocessed", "Approved", "Shipped", "Completed", "Cancelled"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

// Map UI filter to API request states
const filterToApiStates: Record<FilterKey, string[]> = {
  All: [],
  Pending: ["PARTIALLY_PROCESSING", "ON_HOLD", "RECEIVED", "RESOLVED"],
  Unprocessed: ["UNPROCESSED"],
  Approved: ["PROCESSING", "ACCEPTED", "PARTIALLY_PROCESSED"],
  Shipped: ["PROCESSED", "INVOICE_CREATED", "PARTIALLY_COMPLETED"],
  Completed: ["COMPLETED"],
  Cancelled: ["CANCELLED"]
};

// Map API status to UI display
const mapStatusToLabel = (requestState: string): string => {
  const pending = ["PARTIALLY_PROCESSING", "ON_HOLD", "RECEIVED", "RESOLVED"];
  const unprocessed = ["UNPROCESSED"];
  const approved = ["PROCESSING", "ACCEPTED", "PARTIALLY_PROCESSED"];
  const shipped = ["PROCESSED", "INVOICE_CREATED", "PARTIALLY_COMPLETED"];
  const completed = ["COMPLETED"];
  const cancelled = ["CANCELLED", "REJECTED"];

  if (pending.includes(requestState)) return "Pending";
  if (unprocessed.includes(requestState)) return "Unprocessed";
  if (shipped.includes(requestState)) return "Shipped";
  if (completed.includes(requestState)) return "Completed";
  if (cancelled.includes(requestState)) return "Cancelled";
  return "Pending";
};

const STATUS_COLORS: Record<string, string> = {
  Pending: "#D97706",
  Unprocessed: "#D97706",
  Approved: "#2563EB",
  Shipped: "#7C3AED",
  Completed: "#16A34A",
  Cancelled: "#DC2626",
};

// ── Helpers ─────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// ── Main Page ───────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function PurchaseOrdersPage() {
  const config = activeBrandConfig;
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");
  const [currentPage, setCurrentPage] = useState(0);
  const [accumulatedOrders, setAccumulatedOrders] = useState<SalesOrder[]>([]);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch status counts
  const { data: statusCounts, isLoading: countsLoading } = useQuery({
    queryKey: ["salesOrderStatusCounts", user?.accountId],
    queryFn: () => fetchSalesOrderStatusCounts(user?.accountId || null),
    enabled: !!user?.accountId,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch orders based on active filter
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["salesOrders", user?.accountId, activeFilter, currentPage],
    queryFn: () =>
      fetchSalesOrdersWithPagination(
        currentPage,
        PAGE_SIZE,
        user?.accountId || null,
        filterToApiStates[activeFilter]
      ),
    enabled: !!user?.accountId,
    staleTime: 2 * 60 * 1000,
  });

  // Calculate counts per filter
  const counts = useMemo(() => {
    if (!statusCounts) {
      return { All: 0, Pending: 0, Unprocessed: 0, Approved: 0, Shipped: 0, Completed: 0, Cancelled: 0 };
    }
    return {
      All: statusCounts.ALL || 0,
      Pending: (statusCounts.PARTIALLY_PROCESSING || 0) + (statusCounts.ON_HOLD || 0) + (statusCounts.RECEIVED || 0) + (statusCounts.RESOLVED || 0),
      Unprocessed: (statusCounts.UNPROCESSED || 0),
      Approved: (statusCounts.PROCESSING || 0) + (statusCounts.ACCEPTED || 0) + (statusCounts.PARTIALLY_PROCESSED || 0),
      Shipped: (statusCounts.PROCESSED || 0) + (statusCounts.INVOICE_CREATED || 0) + (statusCounts.PARTIALLY_COMPLETED || 0),
      Completed: (statusCounts.COMPLETED || 0),
      Cancelled: (statusCounts.CANCELLED || 0),
    };
  }, [statusCounts]);

  // Transform orders for display
  const orders = ordersData?.orders || [];
  const totalRecords = ordersData?.totalRecords || 0;
  const totalPages = Math.ceil(totalRecords / PAGE_SIZE);
  const hasMore = currentPage < totalPages - 1;

  // Append new orders to accumulated list
  useEffect(() => {
    if (orders.length > 0) {
      setAccumulatedOrders((prev) => {
        if (currentPage === 0) {
          return orders;
        }
        // Avoid duplicates
        const existingIds = new Set(prev.map(o => o.salesOrderId));
        const newOrders = orders.filter(o => !existingIds.has(o.salesOrderId));
        return [...prev, ...newOrders];
      });
    }
  }, [orders, currentPage]);

  // Reset when filter changes - handled in handleFilterChange
  // This effect is kept as a safety fallback
  useEffect(() => {
    // Only reset if values are stale (avoid double reset from handleFilterChange)
    setAccumulatedOrders([]);
  }, [activeFilter]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!currentTarget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !ordersLoading && hasMore) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { threshold: 0.5, rootMargin: "100px" }
    );

    observer.observe(currentTarget);

    return () => {
      observer.disconnect();
    };
  }, [ordersLoading, hasMore]);

  const handleFilterChange = (filter: string) => {
    if (filter !== activeFilter) {
      // Remove all cached salesOrders queries to force fresh fetch
      queryClient.removeQueries({
        queryKey: ["salesOrders"],
      });
      // Synchronously reset page and orders when filter changes
      setCurrentPage(0);
      setAccumulatedOrders([]);
    }
    setActiveFilter(filter as FilterKey);
  };

  const handleRowClick = (order: SalesOrder) => {
    navigate(`/purchase-orders/${order.salesOrderId}`);
  };

  // ── Empty state ─────────────────────────────────────────────────

  if (!ordersLoading && !countsLoading && counts.All === 0) {
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
          {countsLoading ? "Loading..." : `${counts.All} order${counts.All !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Status Segmented Filter */}
      <div className="mb-6">
        {countsLoading ? (
          <div className="flex justify-center py-4">
            <Spin size="small" />
          </div>
        ) : (
          <StatusSegmentedFilter
            filters={FILTER_KEYS as unknown as string[]}
            counts={counts}
            active={activeFilter}
            onSelect={handleFilterChange}
          />
        )}
      </div>

      {/* Orders Table */}
      <OrdersTable
        orders={accumulatedOrders}
        isLoading={ordersLoading && currentPage === 0}
        onRowClick={handleRowClick}
      />

      {/* Loading indicator for infinite scroll */}
      {ordersLoading && currentPage > 0 && (
        <div className="py-8 text-center">
          <Spin size="default" />
          <p className="text-sm mt-4" style={{ color: config.secondaryColor }}>
            Loading more orders...
          </p>
        </div>
      )}

      {/* Intersection observer target - always rendered but conditionally visible */}
      <div 
        ref={observerTarget} 
        style={{ 
          height: hasMore ? "100px" : "0px",
          visibility: hasMore ? "visible" : "hidden"
        }} 
      />

      {/* End of results message */}
      {!ordersLoading && !hasMore && accumulatedOrders.length > 0 && (
        <div className="py-8 text-center text-sm" style={{ color: config.secondaryColor }}>
          All orders loaded ({accumulatedOrders.length} total)
        </div>
      )}
    </div>
  );
}

// ── Orders Table (API-compatible) ───────────────────────────────────

function OrdersTable({
  orders,
  isLoading,
  onRowClick,
}: {
  orders: SalesOrder[];
  isLoading: boolean;
  onRowClick: (order: SalesOrder) => void;
}) {
  const config = activeBrandConfig;
  const columns = "minmax(140px,1.5fr) minmax(100px,1fr) minmax(150px,2fr) minmax(80px,1fr) minmax(120px,1.2fr)";

  if (isLoading) {
    return (
      <div
        className="rounded-xl text-center py-16"
        style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
      >
        <Spin size="default" />
        <p className="text-sm mt-4" style={{ color: config.secondaryColor }}>
          Loading orders...
        </p>
      </div>
    );
  }

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
        <span>Order ID</span>
        <span>Date</span>
        <span>Channel</span>
        <span className="text-right">Items</span>
        <span className="text-right">Status</span>
      </div>

      {/* Rows */}
      {orders.map((order, idx) => {
        const status = mapStatusToLabel(order.requestState);
        const statusColor = STATUS_COLORS[status] || "#D97706";
        const totalItems = order.lineItemInfo.reduce((sum, item) => sum + item.requestedQuantity, 0);

        return (
          <div
            key={order.salesOrderId}
            onClick={() => onRowClick(order)}
            className="grid gap-4 px-5 py-4 items-center transition-colors cursor-pointer"
            style={{
              gridTemplateColumns: columns,
              borderBottom: idx < orders.length - 1 ? `1px solid ${config.borderColor}` : "none",
              backgroundColor: "#fff",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = config.cardBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fff";
            }}
          >
            <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
              {order.applicationOrderId || `SO-${order.salesOrderId}`}
            </span>
            <span className="text-xs" style={{ color: config.secondaryColor }}>
              {formatDate(order.orderDate)}
            </span>
            <span className="text-xs truncate" style={{ color: config.secondaryColor }}>
              {order.channelCode || "—"}
            </span>
            <span className="text-sm font-medium text-right" style={{ color: config.primaryColor }}>
              {totalItems}
            </span>
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded whitespace-nowrap inline-block min-w-[80px] text-center ml-auto"
              style={{ color: statusColor, backgroundColor: "transparent", border: `1px solid ${statusColor}` }}
            >
              {status}
            </span>
          </div>
        );
      })}
    </div>
  );
}
