import { ShoppingOutlined, RightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { activeBrandConfig } from "../../config/brandConfig";
import { orderStatuses, recentOrders } from "../../data/dashboardData";

const fmt = (v: number) =>
  "$" + v.toLocaleString("en-US", { minimumFractionDigits: 0 });

export default function OrdersOverview() {
  const config = activeBrandConfig;

  return (
    <div
      className="rounded-xl bg-white"
      style={{ border: `1px solid ${config.borderColor}` }}
    >
      <div className="p-6">
        {/* Title */}
        <div className="flex items-center gap-2 mb-6">
          <ShoppingOutlined className="text-lg" style={{ color: config.primaryColor }} />
          <h2 className="text-sm font-semibold m-0 uppercase tracking-wider" style={{ color: config.primaryColor }}>
            Orders Overview
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left — Status Summary */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: config.secondaryColor }}>
              Order Status Summary
            </h3>
            <div className="space-y-3">
              {orderStatuses.map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-sm" style={{ color: "#374151" }}>
                      {s.label}
                    </span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
                    {s.count}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div
              className="flex items-center justify-between mt-4 pt-4"
              style={{ borderTop: `1px solid ${config.borderColor}` }}
            >
              <span className="text-sm font-medium" style={{ color: config.secondaryColor }}>
                Total Active
              </span>
              <span className="text-sm font-bold" style={{ color: config.primaryColor }}>
                {orderStatuses.reduce((a, s) => a + s.count, 0)}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px" style={{ backgroundColor: config.borderColor }} />

          {/* Right — Recent Orders Table */}
          <div className="flex-[2] min-w-0">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: config.secondaryColor }}>
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
                    <tr key={o.id} style={{ borderTop: `1px solid ${config.borderColor}` }}>
                      <td className="py-2.5 text-xs font-medium" style={{ color: config.primaryColor }}>
                        {o.poNumber}
                      </td>
                      <td className="py-2.5 text-xs" style={{ color: "#6B7280" }}>
                        {new Date(o.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td className="py-2.5 text-xs" style={{ color: "#374151" }}>
                        {o.brand}
                      </td>
                      <td className="py-2.5 text-xs text-right font-medium" style={{ color: "#374151" }}>
                        {fmt(o.amount)}
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full"
                          style={{
                            color: o.statusColor,
                            backgroundColor: o.statusColor + "15",
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

        {/* Footer link */}
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
      className="text-[11px] font-semibold uppercase tracking-wider pb-2"
      style={{ color: config.secondaryColor, textAlign: align as any }}
    >
      {children}
    </th>
  );
}
