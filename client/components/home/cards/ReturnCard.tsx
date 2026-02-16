import { Tag } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../../config/brandConfig";
import type { ReturnUpdate } from "../UpdatesSection";

const STATUS_COLORS: Record<string, string> = {
  Pending: "default",
  "In Review": "processing",
  Approved: "success",
  Rejected: "error",
};

interface ReturnCardProps {
  data: ReturnUpdate;
}

export default function ReturnCard({ data }: ReturnCardProps) {
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
          Return / Claim
        </span>
        <Tag
          color={STATUS_COLORS[data.status] || "default"}
          style={{ margin: 0, fontSize: 11, lineHeight: "18px", borderRadius: 4 }}
        >
          {data.status}
        </Tag>
      </div>

      {/* Return ID */}
      <p className="text-sm font-semibold mb-0.5" style={{ color: config.primaryColor }}>
        {data.returnId}
      </p>
      <p className="text-xs mb-4" style={{ color: config.secondaryColor }}>
        Submitted {data.submissionDate}
      </p>

      {/* CTA */}
      <div className="mt-auto">
        <button
          className="text-xs font-medium flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
          style={{ color: config.primaryColor }}
        >
          Track Status <RightOutlined className="text-[9px]" />
        </button>
      </div>
    </div>
  );
}
