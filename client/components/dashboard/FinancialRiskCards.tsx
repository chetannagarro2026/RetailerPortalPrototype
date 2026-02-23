import {
  ExclamationCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { type RiskCard } from "../../data/dashboardData";

const severityStyles: Record<string, { bg: string; iconColor: string; border: string }> = {
  critical: { bg: "#FEF2F2", iconColor: "#DC2626", border: "#FECACA" },
  warning: { bg: "#FFFBEB", iconColor: "#D97706", border: "#FDE68A" },
  info: { bg: "#F9FAFB", iconColor: "#6B7280", border: "#E5E7EB" },
};

const icons: Record<string, React.ReactNode> = {
  overdue: <ExclamationCircleOutlined />,
  partial: <WarningOutlined />,
  "pending-credit": <ClockCircleOutlined />,
  "high-util": <ThunderboltOutlined />,
};

const fmt = (v: number) =>
  "$" + v.toLocaleString("en-US", { minimumFractionDigits: 0 });

interface FinancialRiskCardsProps {
  cards: RiskCard[];
  onCardClick: (key: string) => void;
}

export default function FinancialRiskCards({ cards, onCardClick }: FinancialRiskCardsProps) {
  const config = activeBrandConfig;

  return (
    <div>
      <h2
        className="text-sm font-semibold m-0 mb-4 uppercase tracking-wider"
        style={{ color: config.primaryColor }}
      >
        Financial Risk Indicators
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const style = severityStyles[card.severity];
          const isHighUtil = card.key === "high-util";
          const utilPct = isHighUtil ? Math.round((92000 / 150000) * 100) : 0;
          const showCard = !isHighUtil || utilPct >= 75;

          if (!showCard) return null;

          return (
            <button
              key={card.key}
              onClick={() => onCardClick(card.key)}
              className="rounded-xl p-4 text-left cursor-pointer transition-all group"
              style={{
                border: `1px solid ${style.border}`,
                backgroundColor: style.bg,
                outline: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-lg" style={{ color: style.iconColor }}>
                  {icons[card.key]}
                </span>
                <RightOutlined className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <p className="text-2xl font-bold m-0 mb-1" style={{ color: "#111827" }}>
                {isHighUtil ? `${utilPct}%` : card.count}
              </p>

              <p className="text-xs font-medium m-0 mb-2" style={{ color: "#374151" }}>
                {card.label}
              </p>

              {!isHighUtil && card.amount > 0 && (
                <p className="text-[11px] m-0" style={{ color: style.iconColor }}>
                  {fmt(card.amount)} total
                </p>
              )}

              {isHighUtil && (
                <p className="text-[11px] m-0" style={{ color: style.iconColor }}>
                  Credit utilization above 75%
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
