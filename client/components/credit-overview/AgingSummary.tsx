import { activeBrandConfig } from "../../config/brandConfig";

const agingData = [
  { bucket: "Current (0–30 days)", amount: 45000 },
  { bucket: "31–60 days", amount: 8000 },
  { bucket: "61–90 days", amount: 2000 },
  { bucket: "90+ days", amount: 2400 },
];

function fmt(val: number): string {
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 0 });
}

export default function AgingSummary() {
  const config = activeBrandConfig;
  const total = agingData.reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <h3 className="text-base font-semibold m-0 mb-4" style={{ color: config.primaryColor }}>
        Aging Summary
      </h3>
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: `1px solid ${config.borderColor}` }}
      >
        {/* Header */}
        <div
          className="grid gap-4 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider"
          style={{
            gridTemplateColumns: "1fr 160px",
            backgroundColor: config.cardBg,
            color: config.secondaryColor,
            borderBottom: `1px solid ${config.borderColor}`,
          }}
        >
          <span>Aging Bucket</span>
          <span className="text-right">Amount</span>
        </div>

        {/* Rows */}
        {agingData.map((row, idx) => (
          <div
            key={row.bucket}
            className="grid gap-4 px-5 py-3 items-center"
            style={{
              gridTemplateColumns: "1fr 160px",
              borderBottom: idx < agingData.length - 1 ? `1px solid ${config.borderColor}` : "none",
              backgroundColor: "#fff",
            }}
          >
            <span className="text-sm" style={{ color: config.primaryColor }}>{row.bucket}</span>
            <span className="text-sm font-medium text-right" style={{ color: config.primaryColor }}>
              {fmt(row.amount)}
            </span>
          </div>
        ))}

        {/* Total */}
        <div
          className="grid gap-4 px-5 py-3 items-center"
          style={{
            gridTemplateColumns: "1fr 160px",
            borderTop: `1px solid ${config.borderColor}`,
            backgroundColor: config.cardBg,
          }}
        >
          <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>Total Outstanding</span>
          <span className="text-sm font-semibold text-right" style={{ color: config.primaryColor }}>
            {fmt(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
