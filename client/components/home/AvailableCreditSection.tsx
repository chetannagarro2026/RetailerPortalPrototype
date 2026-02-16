import { RightOutlined, InfoCircleOutlined, DollarOutlined } from "@ant-design/icons";
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
      className="rounded-xl p-3 flex flex-col h-[236px]"
      style={{
        border: `1px solid ${config.borderColor}`,
        backgroundColor: "#fff",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-xs" style={{ color: config.primaryColor }}>
          Available Credit
        </div>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ color: config.secondaryColor }}
        >
          <DollarOutlined className="text-2xl" />
        </div>
      </div>

      {/* Available Credit — Large */}
      <div className="mb-5">
        <p className="text-2xl font-semibold pt-1" style={{ color: config.primaryColor }}>
          {formatCurrency(available)}
        </p>
      </div>

      {/* Utilization Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
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
      <div className="space-y-2.5 my-1">
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
      <div className="mt-4">
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
