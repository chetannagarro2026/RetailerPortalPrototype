import { activeBrandConfig } from "../../config/brandConfig";
import { creditData } from "../../data/dashboardData";

const fmt = (v: number) =>
  "$" + v.toLocaleString("en-US", { minimumFractionDigits: 0 });

interface CreditCommandCenterProps {
  onCardClick?: (key: string) => void;
}

export default function CreditCommandCenter({ onCardClick }: CreditCommandCenterProps) {
  const config = activeBrandConfig;
  const d = creditData;

  const totalUsed = d.approvedUsed + d.pendingApproval + d.overLimit;
  const utilPct = Math.round((totalUsed / d.totalCreditLimit) * 100);
  const approvedPct = (d.approvedUsed / d.totalCreditLimit) * 100;
  const pendingPct = (d.pendingApproval / d.totalCreditLimit) * 100;
  const overPct = (d.overLimit / d.totalCreditLimit) * 100;

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="flex gap-4" style={{ maxHeight: 140 }}>
      {/* Card 1 — Credit Utilization (40%) */}
      <KpiShell wide onClick={() => onCardClick?.("credit")}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: config.secondaryColor }}>
            Credit Utilization
          </span>
          <span
            className="text-xs font-bold"
            style={{ color: utilPct >= 85 ? "#DC2626" : utilPct >= 60 ? "#D97706" : config.primaryColor }}
          >
            {utilPct}%
          </span>
        </div>

        <p className="font-bold m-0 mb-0.5 leading-tight" style={{ fontSize: 20, color: config.primaryColor }}>
          {fmt(d.availableCredit)}
        </p>
        <p className="text-[11px] m-0 mb-3" style={{ color: config.secondaryColor }}>
          {fmt(totalUsed)} used of {fmt(d.totalCreditLimit)}
        </p>

        {/* Stacked bar */}
        <div className="w-full h-2.5 rounded-full overflow-hidden flex" style={{ backgroundColor: "#E5E7EB" }}>
          {approvedPct > 0 && (
            <div className="h-full" style={{ width: `${approvedPct}%`, backgroundColor: config.primaryColor }} />
          )}
          {pendingPct > 0 && (
            <div className="h-full" style={{ width: `${pendingPct}%`, backgroundColor: "#D97706" }} />
          )}
          {overPct > 0 && (
            <div className="h-full" style={{ width: `${overPct}%`, backgroundColor: "#DC2626" }} />
          )}
        </div>

        {/* Inline legend */}
        <div className="flex gap-3 mt-2">
          <Legend color={config.primaryColor} label="Approved" />
          <Legend color="#D97706" label="Pending" />
          <Legend color="#E5E7EB" label="Available" border />
          {d.overLimit > 0 && <Legend color="#DC2626" label="Over-limit" />}
        </div>
      </KpiShell>

      {/* Card 2 — Total Outstanding */}
      <KpiShell onClick={() => onCardClick?.("outstanding")}>
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: config.secondaryColor }}>
          Total Outstanding
        </span>
        <p className="font-bold m-0 mt-auto leading-tight" style={{ fontSize: 20, color: config.primaryColor }}>
          {fmt(d.totalOutstanding)}
        </p>
      </KpiShell>

      {/* Card 3 — Overdue Amount */}
      <KpiShell onClick={() => onCardClick?.("overdue")}>
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#DC2626" }}>
          Overdue Amount
        </span>
        <p className="font-bold m-0 mt-auto leading-tight" style={{ fontSize: 20, color: "#DC2626" }}>
          {fmt(d.overdueAmount)}
        </p>
        <span className="text-[10px] mt-1" style={{ color: "#DC2626" }}>
          3 invoices
        </span>
      </KpiShell>

      {/* Card 4 — Pending Credit Approval */}
      <KpiShell onClick={() => onCardClick?.("pending-credit")}>
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#D97706" }}>
          Pending Approval
        </span>
        <p className="font-bold m-0 mt-auto leading-tight" style={{ fontSize: 20, color: "#D97706" }}>
          {fmt(d.pendingApproval)}
        </p>
        <span className="text-[10px] mt-1" style={{ color: "#D97706" }}>
          4 orders
        </span>
      </KpiShell>

      {/* Card 5 — This Month Payments */}
      <KpiShell onClick={() => onCardClick?.("outstanding")}>
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: config.secondaryColor }}>
          This Month Payments
        </span>
        <p className="font-bold m-0 mt-auto leading-tight" style={{ fontSize: 20, color: "#16A34A" }}>
          {fmt(d.thisMonthPayments)}
        </p>
        <span className="text-[10px] mt-1" style={{ color: config.secondaryColor }}>
          Last: {fmtDate(d.lastPaymentDate)}
        </span>
      </KpiShell>
    </div>
  );
}

/* ─── Reusable card shell ─── */

function KpiShell({
  children,
  wide = false,
  onClick,
}: {
  children: React.ReactNode;
  wide?: boolean;
  onClick?: () => void;
}) {
  const config = activeBrandConfig;
  return (
    <button
      onClick={onClick}
      className={`rounded-lg flex flex-col text-left cursor-pointer transition-all bg-white ${wide ? "flex-[2.7]" : "flex-1"}`}
      style={{
        border: `1px solid ${config.borderColor}`,
        padding: "16px 20px",
        maxHeight: 140,
        outline: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
        e.currentTarget.style.borderColor = "#D1D5DB";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = config.borderColor;
      }}
    >
      {children}
    </button>
  );
}

/* ─── Legend dot ─── */

function Legend({
  color,
  label,
  border = false,
}: {
  color: string;
  label: string;
  border?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <span
        className="w-2 h-2 rounded-sm shrink-0"
        style={{
          backgroundColor: color,
          border: border ? "1px solid #D1D5DB" : "none",
        }}
      />
      <span className="text-[10px] text-gray-500">{label}</span>
    </div>
  );
}
