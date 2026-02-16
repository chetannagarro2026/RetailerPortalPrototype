import { RightOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../../config/brandConfig";
import type { POUpdate } from "../UpdatesSection";

const STEPS = ["Placed", "Confirmed", "Billed", "Shipped", "Delivered"];

interface POCardProps {
  data: POUpdate;
}

export default function POCard({ data }: POCardProps) {
  const config = activeBrandConfig;

  return (
    <div
      className="rounded-xl p-4 h-full flex flex-col"
      style={{
        border: `1px solid ${config.borderColor}`,
        backgroundColor: "#fff",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: config.secondaryColor }}
        >
          Purchase Order
        </span>
        <span className="text-[11px]" style={{ color: config.secondaryColor }}>
          {data.orderDate}
        </span>
      </div>

      {/* PO Number + Value */}
      <p className="text-sm font-semibold mb-0.5" style={{ color: config.primaryColor }}>
        {data.poNumber}
      </p>
      <p className="text-xs mb-4" style={{ color: config.secondaryColor }}>
        ${data.totalValue.toLocaleString("en-US")}
      </p>

      {/* Step Progress */}
      <div className="flex items-center gap-0.5 mb-1.5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-[3px] rounded-full"
            style={{
              backgroundColor: i <= data.currentStep ? config.primaryColor : config.borderColor,
              opacity: i <= data.currentStep ? (i === data.currentStep ? 1 : 0.5) : 1,
            }}
          />
        ))}
      </div>
      <p className="text-[11px] mb-3" style={{ color: config.secondaryColor }}>
        {STEPS[data.currentStep]}
      </p>

      {/* CTA */}
      <div className="mt-auto">
        <button
          className="text-xs font-medium flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
          style={{ color: config.primaryColor }}
        >
          View Details <RightOutlined className="text-[9px]" />
        </button>
      </div>
    </div>
  );
}
