import { ShoppingOutlined, RightOutlined, WarningOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { activeBrandConfig } from "../../config/brandConfig";
import { orderStatuses, recentOrders } from "../../data/dashboardData";

const fmt = (v: number) =>
  "$" + v.toLocaleString("en-US", { minimumFractionDigits: 0 });

const statusAmounts: Record<string, number> = {
  "Pending Approval": 13500,
  "Approved": 24800,
  "Shipped": 42600,
  "Rejected": 2100,
};

interface OrdersOverviewProps {
  onStatusClick?: (status: string) => void;
}

export default function OrdersOverview({ onStatusClick }: OrdersOverviewProps) {
  const config = activeBrandConfig;
  const totalActive = orderStatuses.reduce((a, s) => a + s.count, 0);
  const pendingCount = orderStatuses.find((s) => s.label === "Pending Approval")?.count || 0;

  return (
    <div
      className="rounded-xl bg-white"
      style={{ border: `1px solid ${config.borderColor}` }}
    >
      <div className="p-6">
        {/* Title */}
        <div className="flex items-center gap-2 mb-6">
          <ShoppingOutlined className="text-base" style={{ color: config.primaryColor }} />
          <h2 className="text-xs font-bold m-0 uppercase tracking-widest" style={{ color: config.primaryColor }}>
            Orders Overview
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left 35% — Status Summary */}
          <div className="lg:w-[35%] min-w-0 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-bold uppercase tracking-widest m-0" style={{ color: config.secondaryColor }}>
                Order Status Summary
              </h3>
              <span className="text-xs font-semibold" style={{ color: config.primaryColor }}>
                {totalActive} active
              </span>
            </div>

            <div className="space-y-0">
              {orderStatuses.map((s) => (
                <button
                  key={s.label}
                  onClick={() => onStatusClick?.(s.label)}
                  className="flex items-center justify-between w-full py-3 px-3 -mx-1 rounded transition-colors cursor-pointer bg-transparent border-none text-left"
                  style={{ outline: "none" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F9FAFB"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-sm" style={{ color: "#374151" }}>
                      {s.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs" style={{ color: config.secondaryColor }}>
                      {fmt(statusAmounts[s.label] || 0)}
                    </span>
                    <span className="text-sm font-bold min-w-[24px] text-right" style={{ color: config.primaryColor }}>
                      {s.count}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px" style={{ backgroundColor: config.borderColor }} />

          {/* Right 65% — Recent Orders Table */}
          <div className="flex-1 min-w-0">
            {/* Attention signal */}
            {pendingCount > 0 && (
              <div
                className="flex items-center gap-2 rounded-md px-3 mb-4"
                style={{ height: 36, backgroundColor: "#FFFBEB", borderLeft: "3px solid #D97706" }}
              >
                <WarningOutlined className="text-xs" style={{ color: "#D97706" }} />
                <span className="text-xs font-medium" style={{ color: "#92400E" }}>
                  {pendingCount} Orders Awaiting Credit Approval
                </span>
              </div>
            )}

            <h3 className="text-[11px] font-bold uppercase tracking-widest mb-4 m-0" style={{ color: config.secondaryColor }}>
              Recent Orders
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <Th>PO #</Th>
                    <Th>Date</Th>
                    <Th>Brand</Th>
                    <Th align="right">Amount</Th>
                    <Th align="right">Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
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
                        {fmt(o.amount)}
                      </td>
                      <td className="py-3.5 text-right">
                        <span
                          className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full"
                          style={{
                            color: o.statusColor,
                            backgroundColor: o.statusColor + "18",
                          }}
                        >
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="mt-6 pt-4 flex justify-end"
          style={{ borderTop: `1px solid ${config.borderColor}` }}
        >
          <Link
            to="/purchase-orders"
            className="text-xs font-medium flex items-center gap-1 no-underline"
            style={{ color: config.primaryColor }}
          >
            View All Orders <RightOutlined className="text-[9px]" />
          </Link>
        </div>
      </div>
    </div>
  );
}

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
