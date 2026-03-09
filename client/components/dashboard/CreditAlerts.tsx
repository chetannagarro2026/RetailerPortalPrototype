import { RightOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { creditData, riskDetailData } from "../../data/dashboardData";

interface CreditAlertsProps {
  onViewClick: (key: string) => void;
}

interface Alert {
  key: string;
  message: string;
  accentColor: string;
  bgColor: string;
  drawerKey: string;
}

function buildAlerts(): Alert[] {
  const alerts: Alert[] = [];
  const d = creditData;

  // Overdue alert
  const overdueRows = riskDetailData.overdue || [];
  if (overdueRows.length > 0) {
    const oldest = overdueRows.reduce((a, b) => (a.daysOverdue || 0) > (b.daysOverdue || 0) ? a : b);
    const fmt = "$" + oldest.amount.toLocaleString("en-US");
    alerts.push({
      key: "overdue",
      message: `Oldest overdue invoice: ${oldest.reference} (${oldest.daysOverdue} days overdue) – ${fmt}`,
      accentColor: "#DC2626",
      bgColor: "#FEF2F2",
      drawerKey: "overdue",
    });
  }

  // Pending approval alert
  const pendingRows = riskDetailData["pending-credit"] || [];
  if (pendingRows.length > 0) {
    const largest = pendingRows.reduce((a, b) => a.amount > b.amount ? a : b);
    const fmt = "$" + largest.amount.toLocaleString("en-US");
    alerts.push({
      key: "pending",
      message: `Largest pending order: ${largest.reference} (${fmt}) awaiting approval`,
      accentColor: "#D97706",
      bgColor: "#FFFBEB",
      drawerKey: "pending-credit",
    });
  }

  // High utilization alert
  const totalUsed = d.approvedUsed + d.pendingApproval + d.overLimit;
  const utilPct = Math.round((totalUsed / d.totalCreditLimit) * 100);
  if (utilPct >= 80) {
    const remaining = "$" + d.availableCredit.toLocaleString("en-US");
    alerts.push({
      key: "util",
      message: `Credit utilization above ${utilPct}%. Only ${remaining} remaining.`,
      accentColor: "#CA8A04",
      bgColor: "#FEFCE8",
      drawerKey: "credit",
    });
  }

  return alerts.slice(0, 3);
}

export default function CreditAlerts({ onViewClick }: CreditAlertsProps) {
  const config = activeBrandConfig;
  const alerts = buildAlerts();

  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {alerts.map((alert) => (
        <div
          key={alert.key}
          className="flex items-center justify-between rounded-md px-4"
          style={{
            height: 44,
            backgroundColor: alert.bgColor,
            borderLeft: `3px solid ${alert.accentColor}`,
          }}
        >
          <span className="text-xs" style={{ color: "#374151" }}>
            {alert.message}
          </span>
          <button
            onClick={() => onViewClick(alert.drawerKey)}
            className="text-[11px] font-medium flex items-center gap-1 cursor-pointer bg-transparent border-none shrink-0 ml-4"
            style={{ color: config.primaryColor }}
          >
            View <RightOutlined className="text-[9px]" />
          </button>
        </div>
      ))}
    </div>
  );
}
