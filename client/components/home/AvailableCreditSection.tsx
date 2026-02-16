import { RightOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";

// Mock data — would come from API
const creditData = {
  creditLimit: 150000,
  utilized: 92000,
  period: "This Quarter" as const, // or "This Month"
};

function getUtilizationColor(percent: number): string {
  if (percent >= 85) return "#EA580C";
  if (percent >= 60) return "#D97706";
  return "#6B7B99";
}

function getBarColor(percent: number): string {
  if (percent >= 85) return "#EA580C";
  if (percent >= 60) return "#D97706";
  return "#1B2A4A";
}

export default function AvailableCreditSection() {
  const config = activeBrandConfig;
  const available = creditData.creditLimit - creditData.utilized;
  const utilization = Math.round((creditData.utilized / creditData.creditLimit) * 100);
  const barColor = getBarColor(utilization);
  const utilizationColor = getUtilizationColor(utilization);
  const showAlert = utilization >= 85;

  const formatCurrency = (val: number) =>
    "$" + val.toLocaleString("en-US", { minimumFractionDigits: 0 });

  return (
    <div
      className="rounded-xl p-5 h-full flex flex-col"
      style={{
        border: `1px solid ${config.borderColor}`,
        backgroundColor: "#fff",
      }}
    >
      {/* Header */}
      <h2 className="text-base font-semibold mb-5" style={{ color: config.primaryColor }}>
        Available Credit
      </h2>

      {/* Available Credit — Large */}
      <div className="mb-5">
        <p className="text-[11px] font-medium uppercase tracking-wider mb-1" style={{ color: config.secondaryColor }}>
          Available
        </p>
        <p className="text-2xl font-semibold" style={{ color: config.primaryColor }}>
          {formatCurrency(available)}
        </p>
      </div>

      {/* Utilization Bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium" style={{ color: config.secondaryColor }}>
            Utilization – {creditData.period}
          </span>
          <span
            className="text-xs font-semibold"
            style={{ color: utilizationColor }}
          >
            {utilization}%
          </span>
        </div>
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: config.borderColor }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${utilization}%`,
              backgroundColor: barColor,
            }}
          />
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-2.5 mt-4 mb-5">
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: config.secondaryColor }}>Credit Limit</span>
          <span className="text-xs font-medium" style={{ color: config.primaryColor }}>
            {formatCurrency(creditData.creditLimit)}
          </span>
        </div>
        <div
          className="w-full"
          style={{ borderBottom: `1px solid ${config.borderColor}` }}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: config.secondaryColor }}>
            Utilized {creditData.period}
          </span>
          <span className="text-xs font-medium" style={{ color: config.primaryColor }}>
            {formatCurrency(creditData.utilized)}
          </span>
        </div>
      </div>

      {/* Conditional Alert */}
      {showAlert && (
        <div
          className="rounded-lg px-3.5 py-3 mb-4"
          style={{ backgroundColor: "#FFF7ED" }}
        >
          <div className="flex items-start gap-2">
            <InfoCircleOutlined
              className="text-xs mt-0.5 shrink-0"
              style={{ color: "#EA580C" }}
            />
            <p className="text-[11px] leading-relaxed" style={{ color: "#9A3412" }}>
              Your credit utilization is approaching the approved limit.
            </p>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-auto">
        <button
          className="text-xs font-medium flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
          style={{ color: config.primaryColor }}
        >
          View Financials <RightOutlined className="text-[9px]" />
        </button>
      </div>
    </div>
  );
}
