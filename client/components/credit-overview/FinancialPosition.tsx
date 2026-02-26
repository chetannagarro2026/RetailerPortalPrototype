import { activeBrandConfig } from "../../config/brandConfig";

const data = {
  totalOutstanding: 57400,
  overdue: 12400,
  creditLimit: 150000,
  utilized: 92000,
  available: 58000,
};

function fmt(val: number): string {
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 0 });
}

function getBarColor(percent: number): string {
  if (percent >= 85) return "#EA580C";
  if (percent >= 60) return "#D97706";
  return "#1B2A4A";
}

export default function FinancialPosition() {
  const config = activeBrandConfig;
  const utilization = Math.round((data.utilized / data.creditLimit) * 100);
  const barColor = getBarColor(utilization);

  return (
    <div>
      <h3 className="text-base font-semibold m-0 mb-4" style={{ color: config.primaryColor }}>
        Financial Position
      </h3>

      <div
        className="rounded-xl p-6"
        style={{ border: `1px solid ${config.borderColor}`, backgroundColor: config.cardBg }}
      >
        {/* 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Left — Exposure */}
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider m-0 mb-1" style={{ color: config.secondaryColor }}>
                Total Outstanding
              </p>
              <p className="text-xl font-semibold m-0" style={{ color: config.primaryColor }}>
                {fmt(data.totalOutstanding)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider m-0 mb-1" style={{ color: config.secondaryColor }}>
                Overdue Amount
              </p>
              <p className="text-xl font-semibold m-0" style={{ color: "#DC2626" }}>
                {fmt(data.overdue)}
              </p>
              <p className="text-[11px] m-0 mt-1" style={{ color: config.secondaryColor }}>
                Overdue balances may impact future credit approvals.
              </p>
            </div>
          </div>

          {/* Right — Capacity */}
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider m-0 mb-1" style={{ color: config.secondaryColor }}>
                Credit Limit
              </p>
              <p className="text-xl font-semibold m-0" style={{ color: config.primaryColor }}>
                {fmt(data.creditLimit)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider m-0 mb-1" style={{ color: config.secondaryColor }}>
                Available Credit
              </p>
              <p className="text-xl font-semibold m-0" style={{ color: "#16A34A" }}>
                {fmt(data.available)}
              </p>
            </div>
          </div>
        </div>

        {/* Utilization bar */}
        <div
          className="pt-4"
          style={{ borderTop: `1px solid ${config.borderColor}` }}
        >
          <div
            className="w-full h-2.5 rounded-full overflow-hidden mb-2"
            style={{ backgroundColor: "#E5E7EB" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${utilization}%`, backgroundColor: barColor }}
            />
          </div>
          <p className="text-xs m-0" style={{ color: config.secondaryColor }}>
            <span className="font-semibold" style={{ color: barColor }}>{utilization}% used</span>
            {" "}— {fmt(data.utilized)} of {fmt(data.creditLimit)}
          </p>
        </div>
      </div>
    </div>
  );
}
