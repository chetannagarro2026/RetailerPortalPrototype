import {
  CustomerServiceOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { supportData } from "../../data/dashboardData";

interface SupportSnapshotProps {
  onOpenDrawer: () => void;
}

const statusChipStyles: Record<string, { bg: string; color: string }> = {
  "Open": { bg: "#FEF2F2", color: "#DC2626" },
  "In Progress": { bg: "#EFF6FF", color: "#2563EB" },
  "Awaiting Response": { bg: "#FFFBEB", color: "#D97706" },
  "Resolved": { bg: "#F0FDF4", color: "#16A34A" },
};

export default function SupportSnapshot({ onOpenDrawer }: SupportSnapshotProps) {
  const config = activeBrandConfig;
  const { openTickets, tickets } = supportData;
  const highPriority = tickets.filter((t) => t.priority === "High").length;
  const latestTicket = tickets[0];

  // Calculate days since last update for "Awaiting Response" messaging
  const daysSinceUpdate = latestTicket
    ? Math.max(0, Math.round((Date.now() - new Date(latestTicket.lastUpdate).getTime()) / 86400000))
    : 0;

  const displayStatus = latestTicket?.status === "Open" && daysSinceUpdate >= 2
    ? "Awaiting Response"
    : latestTicket?.status || "";

  const chipStyle = statusChipStyles[displayStatus] || statusChipStyles["In Progress"];

  return (
    <div
      className="rounded-xl bg-white"
      style={{ border: `1px solid ${config.borderColor}` }}
    >
      <div className="p-6">
        {/* Title */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CustomerServiceOutlined className="text-base" style={{ color: config.primaryColor }} />
            <h2 className="text-xs font-bold m-0 uppercase tracking-widest" style={{ color: config.primaryColor }}>
              Support Snapshot
            </h2>
          </div>
          <button
            onClick={onOpenDrawer}
            className="text-xs font-medium flex items-center gap-1 cursor-pointer bg-transparent border-none"
            style={{ color: config.primaryColor }}
          >
            View All <RightOutlined className="text-[9px]" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* KPIs */}
          <div className="flex gap-4 flex-1">
            {/* Open Tickets */}
            <div className="flex-1 rounded-lg p-4" style={{ backgroundColor: config.cardBg }}>
              <div className="flex items-center gap-1.5 mb-2">
                <ClockCircleOutlined className="text-xs" style={{ color: config.secondaryColor }} />
                <span className="text-[11px] font-medium" style={{ color: config.secondaryColor }}>
                  Open Tickets
                </span>
              </div>
              <p className="text-2xl font-bold m-0" style={{ color: config.primaryColor }}>
                {openTickets}
              </p>
            </div>

            {/* High Priority */}
            <div
              className="flex-1 rounded-lg p-4"
              style={{
                backgroundColor: highPriority > 0 ? "#FEF2F2" : config.cardBg,
                border: highPriority > 0 ? "1px solid #FECACA" : "none",
              }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <ExclamationCircleOutlined
                  className="text-xs"
                  style={{ color: highPriority > 0 ? "#DC2626" : config.secondaryColor }}
                />
                <span
                  className="text-[11px] font-medium"
                  style={{ color: highPriority > 0 ? "#DC2626" : config.secondaryColor }}
                >
                  High Priority
                </span>
              </div>
              <p
                className="text-2xl font-bold m-0"
                style={{ color: highPriority > 0 ? "#DC2626" : config.primaryColor }}
              >
                {highPriority}
              </p>
              {highPriority > 0 && (
                <p className="text-[11px] m-0 mt-1" style={{ color: "#DC2626" }}>
                  Requires attention
                </p>
              )}
            </div>
          </div>

          {/* Latest Ticket */}
          {latestTicket && (
            <div
              className="flex-[2] rounded-lg p-4 cursor-pointer transition-colors"
              style={{
                backgroundColor: "#fff",
                border: `1px solid ${config.borderColor}`,
              }}
              onClick={onOpenDrawer}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F9FAFB"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold" style={{ color: config.primaryColor }}>
                  {latestTicket.id}
                </span>
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded"
                  style={{ color: chipStyle.color, backgroundColor: "transparent", border: `1px solid ${chipStyle.color}` }}
                >
                  {displayStatus}
                  {displayStatus === "Awaiting Response" && ` (${daysSinceUpdate} days)`}
                </span>
              </div>
              <p className="text-sm font-medium m-0 mb-2 line-clamp-1" style={{ color: "#374151" }}>
                {latestTicket.subject}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: config.secondaryColor }}>
                  Updated {new Date(latestTicket.lastUpdate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <span className="text-xs font-medium flex items-center gap-1" style={{ color: config.primaryColor }}>
                  View <RightOutlined className="text-[9px]" />
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
