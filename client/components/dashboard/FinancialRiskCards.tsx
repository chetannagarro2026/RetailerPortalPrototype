import {
  ExclamationCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { type RiskCard } from "../../data/dashboardData";

const accentColors: Record<string, string> = {
  critical: "#DC2626",
  warning: "#D97706",
  info: "#6B7280",
};

const icons: Record<string, React.ReactNode> = {
  overdue: <ExclamationCircleOutlined />,
  partial: <WarningOutlined />,
  "pending-credit": <ClockCircleOutlined />,
  "high-util": <ThunderboltOutlined />,
};

const subtexts: Record<string, string> = {
  overdue: "Oldest: 7 days",
  partial: "outstanding",
  "pending-credit": "awaiting decision",
  "high-util": "Credit utilization above 90%",
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
        className="text-xs font-bold m-0 mb-4 uppercase tracking-widest"
        style={{ color: config.primaryColor }}
      >
        Financial Risk Indicators
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const accent = accentColors[card.severity];
          const isHighUtil = card.key === "high-util";
          const utilPct = isHighUtil ? Math.round((92000 / 150000) * 100) : 0;
          const showCard = !isHighUtil || utilPct >= 90;

          if (!showCard) return null;

          return (
            <button
              key={card.key}
              onClick={() => onCardClick(card.key)}
              className="rounded-lg p-5 text-left cursor-pointer transition-all group bg-white"
              style={{
                border: `1px solid ${config.borderColor}`,
                borderLeft: `4px solid ${accent}`,
                outline: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-base" style={{ color: accent }}>
                  {icons[card.key]}
                </span>
                <RightOutlined className="text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <p className="font-bold m-0 mb-0.5" style={{ fontSize: 28, lineHeight: 1.1, color: "#111827" }}>
                {isHighUtil ? `${utilPct}%` : card.count}
              </p>

              <p className="text-xs font-semibold m-0 mb-2" style={{ color: "#374151" }}>
                {card.label}
              </p>

              {!isHighUtil && card.amount > 0 && (
                <p className="text-[11px] m-0 mb-0.5" style={{ color: accent }}>
                  {fmt(card.amount)} {card.key === "partial" ? subtexts.partial : "total"}
                </p>
              )}

              <p className="text-[11px] m-0" style={{ color: "#9CA3AF" }}>
                {isHighUtil ? subtexts["high-util"] : subtexts[card.key]}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
