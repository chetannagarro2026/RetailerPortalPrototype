import {
  DollarOutlined,
  WarningOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { creditData } from "../../data/dashboardData";

const fmt = (v: number) =>
  "$" + v.toLocaleString("en-US", { minimumFractionDigits: 0 });

export default function CreditCommandCenter() {
  const config = activeBrandConfig;
  const d = creditData;

  const totalUsed = d.approvedUsed + d.pendingApproval + d.overLimit;
  const utilPct = Math.round((totalUsed / d.totalCreditLimit) * 100);
  const approvedPct = (d.approvedUsed / d.totalCreditLimit) * 100;
  const pendingPct = (d.pendingApproval / d.totalCreditLimit) * 100;
  const overPct = (d.overLimit / d.totalCreditLimit) * 100;

  const fmtDate = (iso: string) => {
    const dt = new Date(iso);
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: "#F8F9FB",
        borderTop: `3px solid ${config.primaryColor}`,
        border: `1px solid ${config.borderColor}`,
        borderTopWidth: 3,
        borderTopColor: config.primaryColor,
      }}
    >
      <div className="p-6">
        {/* Section Title */}
        <div className="flex items-center gap-2 mb-6">
          <DollarOutlined className="text-base" style={{ color: config.primaryColor }} />
          <h2 className="text-xs font-bold m-0 uppercase tracking-widest" style={{ color: config.primaryColor }}>
            Credit Command Center
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column — 60% */}
          <div className="flex-[3] min-w-0">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: config.secondaryColor }}>
              Available Credit
            </span>
            <p className="m-0 mb-1 font-bold leading-tight" style={{ fontSize: 40, color: config.primaryColor }}>
              {fmt(d.availableCredit)}
            </p>
            <p className="text-sm m-0 mb-6" style={{ color: config.secondaryColor }}>
              {fmt(totalUsed)} used of {fmt(d.totalCreditLimit)} total
            </p>

            {/* Utilization % above bar */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold" style={{ color: config.secondaryColor }}>
                Credit Utilization
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: utilPct >= 85 ? "#DC2626" : utilPct >= 60 ? "#D97706" : config.primaryColor }}
              >
                {utilPct}%
              </span>
            </div>

            {/* Stacked Bar — thicker 14px */}
            <div className="w-full h-3.5 rounded-full overflow-hidden flex" style={{ backgroundColor: "#E5E7EB" }}>
              {approvedPct > 0 && (
                <div
                  className="h-full"
                  style={{ width: `${approvedPct}%`, backgroundColor: config.primaryColor }}
                />
              )}
              {pendingPct > 0 && (
                <div
                  className="h-full"
                  style={{ width: `${pendingPct}%`, backgroundColor: "#D97706" }}
                />
              )}
              {overPct > 0 && (
                <div
                  className="h-full"
                  style={{ width: `${overPct}%`, backgroundColor: "#DC2626" }}
                />
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3">
              <LegendItem color={config.primaryColor} label="Approved" value={fmt(d.approvedUsed)} />
              <LegendItem color="#D97706" label="Pending" value={fmt(d.pendingApproval)} />
              <LegendItem color="#E5E7EB" label="Available" value={fmt(d.availableCredit)} border />
              {d.overLimit > 0 && (
                <LegendItem color="#DC2626" label="Over-limit" value={fmt(d.overLimit)} />
              )}
            </div>

            {/* Contextual microcopy */}
            <div className="flex items-center gap-1.5 mt-4">
              <InfoCircleOutlined className="text-[11px]" style={{ color: config.secondaryColor }} />
              <span className="text-[11px]" style={{ color: config.secondaryColor }}>
                Orders exceeding limit require manager approval.
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px" style={{ backgroundColor: "#E0E3E8" }} />

          {/* Right Column — 40% Financial Snapshot */}
          <div className="flex-[2] min-w-0">
            <h3 className="text-[11px] font-bold uppercase tracking-widest mb-5 m-0" style={{ color: config.secondaryColor }}>
              Financial Snapshot
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-6">
              <MetricTile
                icon={<DollarOutlined />}
                label="Total Outstanding"
                value={fmt(d.totalOutstanding)}
                config={config}
              />
              <MetricTile
                icon={<WarningOutlined />}
                label="Overdue Amount"
                value={fmt(d.overdueAmount)}
                config={config}
                valueColor="#DC2626"
              />
              <MetricTile
                icon={<CalendarOutlined />}
                label="Last Payment"
                value={fmtDate(d.lastPaymentDate)}
                config={config}
              />
              <MetricTile
                icon={<CreditCardOutlined />}
                label="This Month Payments"
                value={fmt(d.thisMonthPayments)}
                config={config}
                valueColor="#16A34A"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function LegendItem({
  color,
  label,
  value,
  border = false,
}: {
  color: string;
  label: string;
  value: string;
  border?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="w-2.5 h-2.5 rounded-sm shrink-0"
        style={{
          backgroundColor: color,
          border: border ? "1px solid #D1D5DB" : "none",
        }}
      />
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className="text-[11px] font-semibold text-gray-700">{value}</span>
    </div>
  );
}

function MetricTile({
  icon,
  label,
  value,
  config,
  valueColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  config: typeof activeBrandConfig;
  valueColor?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-xs" style={{ color: config.secondaryColor }}>{icon}</span>
        <span className="text-[11px] font-medium" style={{ color: config.secondaryColor }}>
          {label}
        </span>
      </div>
      <p className="text-xl font-semibold m-0" style={{ color: valueColor || config.primaryColor }}>
        {value}
      </p>
    </div>
  );
}
