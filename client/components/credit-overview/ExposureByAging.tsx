import { activeBrandConfig } from "../../config/brandConfig";

const agingData = [
  { bucket: "Current (0–30 days)", amount: 45000 },
  { bucket: "31–60 days", amount: 8000 },
  { bucket: "61–90 days", amount: 2000 },
  { bucket: "90+ days", amount: 2400, highlight: true },
];

function fmt(val: number): string {
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 0 });
}

export default function ExposureByAging() {
  const config = activeBrandConfig;

  return (
    <div>
      <h3 className="text-base font-semibold m-0 mb-1" style={{ color: config.primaryColor }}>
        Exposure by Aging
      </h3>
      <p className="text-xs m-0 mb-4" style={{ color: config.secondaryColor }}>
        Aging categorizes outstanding invoices based on how long they remain unpaid.
      </p>

      <div
        className="rounded-xl overflow-hidden"
        style={{ border: `1px solid ${config.borderColor}` }}
      >
        {agingData.map((row, idx) => (
          <div
            key={row.bucket}
            className="flex items-center justify-between px-5 py-3"
            style={{
              borderBottom: idx < agingData.length - 1 ? `1px solid ${config.borderColor}` : "none",
              backgroundColor: row.highlight ? "#FEF2F2" : "#fff",
            }}
          >
            <span
              className="text-sm"
              style={{ color: row.highlight ? "#991B1B" : config.primaryColor, fontWeight: row.highlight ? 600 : 400 }}
            >
              {row.bucket}
            </span>
            <span
              className="text-sm font-medium"
              style={{ color: row.highlight ? "#DC2626" : config.primaryColor }}
            >
              {fmt(row.amount)}
            </span>
          </div>
        ))}
      </div>

      {/* Oldest invoice callout */}
      <div className="mt-3 flex items-center gap-1.5">
        <span className="text-xs" style={{ color: config.secondaryColor }}>Oldest Invoice:</span>
        <span className="text-xs font-medium" style={{ color: config.primaryColor }}>INV-44281</span>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded" style={{ color: "#DC2626", backgroundColor: "transparent", border: "1px solid #DC2626" }}>
          74 days overdue
        </span>
      </div>
    </div>
  );
}
