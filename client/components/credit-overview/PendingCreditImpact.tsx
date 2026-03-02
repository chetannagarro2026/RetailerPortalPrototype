import { activeBrandConfig } from "../../config/brandConfig";

const pendingOrders = [
  { po: "PO-2026-0121", amount: 12400 },
  { po: "PO-2026-0118", amount: 6230 },
  { po: "PO-2026-0112", amount: 14880 },
  { po: "PO-2026-0105", amount: 28250 },
];

function fmt(val: number): string {
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 0 });
}

export default function PendingCreditImpact() {
  const config = activeBrandConfig;
  const totalPending = pendingOrders.reduce((s, o) => s + o.amount, 0);

  return (
    <div>
      <h3 className="text-base font-semibold m-0 mb-4" style={{ color: config.primaryColor }}>
        Pending Credit Impact
      </h3>

      <div
        className="rounded-xl p-6"
        style={{ border: `1px solid ${config.borderColor}`, backgroundColor: config.cardBg }}
      >
        {/* Summary row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider m-0 mb-1" style={{ color: config.secondaryColor }}>
              Orders Awaiting Credit Approval
            </p>
            <p className="text-lg font-semibold m-0" style={{ color: config.primaryColor }}>
              {pendingOrders.length}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider m-0 mb-1" style={{ color: config.secondaryColor }}>
              Total Pending Exposure
            </p>
            <p className="text-lg font-semibold m-0" style={{ color: "#D97706" }}>
              {fmt(totalPending)}
            </p>
          </div>
        </div>

        {/* Pending orders list */}
        <div
          className="rounded-lg overflow-hidden mb-4"
          style={{ border: `1px solid ${config.borderColor}` }}
        >
          {pendingOrders.map((order, idx) => (
            <div
              key={order.po}
              className="flex items-center justify-between px-4 py-2.5"
              style={{
                borderBottom: idx < pendingOrders.length - 1 ? `1px solid ${config.borderColor}` : "none",
                backgroundColor: "#fff",
              }}
            >
              <span className="text-sm font-medium" style={{ color: config.primaryColor }}>
                {order.po}
              </span>
              <span className="text-sm" style={{ color: config.secondaryColor }}>
                {fmt(order.amount)}
              </span>
            </div>
          ))}
        </div>

        <p className="text-[11px] m-0" style={{ color: config.secondaryColor }}>
          Pending approvals may temporarily affect available credit.
        </p>
      </div>
    </div>
  );
}
