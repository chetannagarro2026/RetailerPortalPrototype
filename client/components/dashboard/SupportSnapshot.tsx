import {
  CustomerServiceOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { supportData } from "../../data/dashboardData";

interface SupportSnapshotProps {
  onOpenDrawer: () => void;
}

export default function SupportSnapshot({ onOpenDrawer }: SupportSnapshotProps) {
  const config = activeBrandConfig;
  const { openTickets, slaAtRisk, tickets } = supportData;
  const latestTicket = tickets[0];

  return (
    <div
      className="rounded-xl bg-white"
      style={{ border: `1px solid ${config.borderColor}` }}
    >
      <div className="p-6">
        {/* Title */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CustomerServiceOutlined className="text-lg" style={{ color: config.primaryColor }} />
            <h2 className="text-sm font-semibold m-0 uppercase tracking-wider" style={{ color: config.primaryColor }}>
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

        <div className="flex flex-col sm:flex-row gap-4">
          {/* KPI: Open Tickets */}
          <div
            className="flex-1 rounded-lg p-4"
            style={{ backgroundColor: config.cardBg }}
          >
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

          {/* KPI: SLA at Risk */}
          <div
            className="flex-1 rounded-lg p-4"
            style={{
              backgroundColor: slaAtRisk > 0 ? "#FEF2F2" : config.cardBg,
            }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <WarningOutlined
                className="text-xs"
                style={{ color: slaAtRisk > 0 ? "#DC2626" : config.secondaryColor }}
              />
              <span className="text-[11px] font-medium" style={{ color: slaAtRisk > 0 ? "#DC2626" : config.secondaryColor }}>
                SLA at Risk
              </span>
            </div>
            <p
              className="text-2xl font-bold m-0"
              style={{ color: slaAtRisk > 0 ? "#DC2626" : config.primaryColor }}
            >
              {slaAtRisk}
            </p>
          </div>

          {/* Latest Ticket Preview */}
          {latestTicket && (
            <div
              className="flex-[2] rounded-lg p-4 cursor-pointer transition-colors"
              style={{
                backgroundColor: config.cardBg,
                border: `1px solid ${config.borderColor}`,
              }}
              onClick={onOpenDrawer}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F3F4F6"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = config.cardBg; }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold" style={{ color: config.primaryColor }}>
                  {latestTicket.id}
                </span>
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    color: latestTicket.priority === "High" ? "#DC2626" : "#D97706",
                    backgroundColor: latestTicket.priority === "High" ? "#FEF2F2" : "#FFFBEB",
                  }}
                >
                  {latestTicket.priority}
                </span>
              </div>
              <p className="text-xs m-0 mb-1.5 line-clamp-1" style={{ color: "#374151" }}>
                {latestTicket.subject}
              </p>
              <p className="text-[11px] m-0" style={{ color: config.secondaryColor }}>
                Last updated: {new Date(latestTicket.lastUpdate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
