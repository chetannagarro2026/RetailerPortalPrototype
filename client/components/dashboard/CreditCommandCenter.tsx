import {
  DollarOutlined,
  WarningOutlined,
  CalendarOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { creditData } from "../../data/dashboardData";

const fmt = (v: number) =>
  "$" + v.toLocaleString("en-US", { minimumFractionDigits: 0 });

export default function CreditCommandCenter() {
  const config = activeBrandConfig;
  const d = creditData;

  const totalUsed = d.approvedUsed + d.pendingApproval + d.overLimit;
  const approvedPct = (d.approvedUsed / d.totalCreditLimit) * 100;
  const pendingPct = (d.pendingApproval / d.totalCreditLimit) * 100;
  const overPct = (d.overLimit / d.totalCreditLimit) * 100;
  const availablePct = Math.max(0, 100 - approvedPct - pendingPct - overPct);

  const fmtDate = (iso: string) => {
    const dt = new Date(iso);
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div
      className="rounded-xl bg-white"
      style={{ border: `1px solid ${config.borderColor}` }}
    >
      <div className="p-6">
        {/* Section Title */}
        <div className="flex items-center gap-2 mb-6">
          <DollarOutlined className="text-lg" style={{ color: config.primaryColor }} />
          <h2 className="text-sm font-semibold m-0 uppercase tracking-wider" style={{ color: config.primaryColor }}>
            Credit Command Center
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column — 60% */}
          <div className="flex-[3] min-w-0">
            {/* Available Credit */}
            <div className="mb-1">
              <span className="text-xs font-medium" style={{ color: config.secondaryColor }}>
                Available Credit
              </span>
            </div>
            <p className="text-4xl font-bold m-0 mb-1" style={{ color: config.primaryColor }}>
              {fmt(d.availableCredit)}
            </p>
            <p className="text-xs m-0 mb-6" style={{ color: config.secondaryColor }}>
              {fmt(totalUsed)} used of {fmt(d.totalCreditLimit)} total
            </p>

            {/* Stacked Utilization Bar */}
            <div className="mb-3">
              <div className="w-full h-3 rounded-full overflow-hidden flex" style={{ backgroundColor: "#F3F4F6" }}>
                {approvedPct > 0 && (
                  <div
                    className="h-full transition-all"
                    style={{ width: `${approvedPct}%`, backgroundColor: config.primaryColor }}
                    title={`Approved: ${fmt(d.approvedUsed)}`}
                  />
                )}
                {pendingPct > 0 && (
                  <div
                    className="h-full transition-all"
                    style={{ width: `${pendingPct}%`, backgroundColor: "#D97706" }}
                    title={`Pending: ${fmt(d.pendingApproval)}`}
                  />
                )}
                {overPct > 0 && (
                  <div
                    className="h-full transition-all"
                    style={{ width: `${overPct}%`, backgroundColor: "#DC2626" }}
                    title={`Over-limit: ${fmt(d.overLimit)}`}
                  />
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-5 gap-y-1.5">
              <LegendItem color={config.primaryColor} label="Approved" value={fmt(d.approvedUsed)} />
              <LegendItem color="#D97706" label="Pending Approval" value={fmt(d.pendingApproval)} />
              <LegendItem color="#F3F4F6" label="Available" value={fmt(d.availableCredit)} border />
              {d.overLimit > 0 && (
                <LegendItem color="#DC2626" label="Over-limit" value={fmt(d.overLimit)} />
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px" style={{ backgroundColor: config.borderColor }} />

          {/* Right Column — 40% */}
          <div className="flex-[2] min-w-0">
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
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
      <span className="text-[11px] font-medium text-gray-700">{value}</span>
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
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-xs" style={{ color: config.secondaryColor }}>{icon}</span>
        <span className="text-[11px] font-medium" style={{ color: config.secondaryColor }}>
          {label}
        </span>
      </div>
      <p className="text-lg font-semibold m-0" style={{ color: valueColor || config.primaryColor }}>
        {value}
      </p>
    </div>
  );
}
