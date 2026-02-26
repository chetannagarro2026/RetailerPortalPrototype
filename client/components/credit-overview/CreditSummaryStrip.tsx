import { activeBrandConfig } from "../../config/brandConfig";

const creditData = {
  creditLimit: 150000,
  utilized: 92000,
  available: 58000,
  overdue: 2400,
};

function fmt(val: number): string {
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 0 });
}

function getBarColor(percent: number): string {
  if (percent >= 85) return "#EA580C";
  if (percent >= 60) return "#D97706";
  return "#1B2A4A";
}

export default function CreditSummaryStrip() {
  const config = activeBrandConfig;
  const utilization = Math.round((creditData.utilized / creditData.creditLimit) * 100);
  const barColor = getBarColor(utilization);

  const fields = [
    { label: "Credit Limit", value: fmt(creditData.creditLimit) },
    { label: "Current Utilization", value: fmt(creditData.utilized), highlight: barColor },
    { label: "Available Credit", value: fmt(creditData.available), highlight: "#16A34A" },
    { label: "Overdue Amount", value: fmt(creditData.overdue), highlight: creditData.overdue > 0 ? "#DC2626" : undefined },
  ];

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      {/* 4-column grid */}
      <div className="grid grid-cols-2 md:grid-cols-4">
        {fields.map((f, idx) => (
          <div
            key={f.label}
            className="px-5 py-4"
            style={{
              borderRight: idx < fields.length - 1 ? `1px solid ${config.borderColor}` : "none",
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider m-0 mb-1" style={{ color: config.secondaryColor }}>
              {f.label}
            </p>
            <p className="text-lg font-semibold m-0" style={{ color: f.highlight || config.primaryColor }}>
              {f.value}
            </p>
          </div>
        ))}
      </div>

      {/* Utilization bar */}
      <div
        className="px-5 py-3"
        style={{ borderTop: `1px solid ${config.borderColor}`, backgroundColor: config.cardBg }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium" style={{ color: config.secondaryColor }}>
            Credit Utilization
          </span>
          <span className="text-xs font-semibold" style={{ color: barColor }}>
            {utilization}% — {fmt(creditData.utilized)} used of {fmt(creditData.creditLimit)}
          </span>
        </div>
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: config.borderColor }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${utilization}%`, backgroundColor: barColor }}
          />
        </div>
      </div>
    </div>
  );
}
