import { RightOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../../config/brandConfig";
import type { CriticalUpdate } from "../UpdatesSection";

interface CriticalActionCardProps {
  data: CriticalUpdate;
}

const BG_COLORS = {
  warning: "#FFFBEB",
  urgent: "#FFF7ED",
};

const ACCENT_COLORS = {
  warning: "#D97706",
  urgent: "#EA580C",
};

export default function CriticalActionCard({ data }: CriticalActionCardProps) {
  const config = activeBrandConfig;

  return (
    <div
      className="rounded-xl p-4 h-full flex flex-col"
      style={{
        border: `1px solid ${config.borderColor}`,
        backgroundColor: BG_COLORS[data.severity],
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-3">
        <ExclamationCircleOutlined
          className="text-xs"
          style={{ color: ACCENT_COLORS[data.severity] }}
        />
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: ACCENT_COLORS[data.severity] }}
        >
          Action Required
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-semibold mb-1" style={{ color: config.primaryColor }}>
        {data.title}
      </p>
      <p className="text-xs leading-relaxed mb-4" style={{ color: "#6B7280" }}>
        {data.description}
      </p>

      {/* CTA */}
      <div className="mt-auto">
        <button
          className="text-xs font-medium flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
          style={{ color: ACCENT_COLORS[data.severity] }}
        >
          Take Action <RightOutlined className="text-[9px]" />
        </button>
      </div>
    </div>
  );
}
