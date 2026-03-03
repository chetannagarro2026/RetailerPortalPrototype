import { useNavigate } from "react-router-dom";
import { ArrowRightOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import {
  type Scheme,
  progressPercent,
  remaining,
  isTargetAchieved,
  currentSlab,
  nextSlab,
  formatCurrency,
  formatDate,
} from "../../data/schemes";

interface Props {
  scheme: Scheme;
}

const typeBadgeStyles: Record<string, { bg: string; color: string }> = {
  Trade: { bg: "#EEF2FF", color: "#4338CA" },
  Consumer: { bg: "#FFF7ED", color: "#C2410C" },
};

export default function SchemeCard({ scheme }: Props) {
  const config = activeBrandConfig;
  const navigate = useNavigate();
  const pct = progressPercent(scheme);
  const rem = remaining(scheme);
  const achieved = isTargetAchieved(scheme);
  const badge = typeBadgeStyles[scheme.type] || typeBadgeStyles.Trade;
  const next = nextSlab(scheme);
  const cur = currentSlab(scheme);

  const targetLabel =
    scheme.targetUnit === "$" ? formatCurrency(scheme.target) : `${scheme.target} ${scheme.targetUnit}`;
  const achievedLabel =
    scheme.targetUnit === "$" ? formatCurrency(scheme.achieved) : `${scheme.achieved} ${scheme.targetUnit}`;
  const remainingLabel =
    scheme.targetUnit === "$" ? formatCurrency(rem) : `${rem} ${scheme.targetUnit}`;

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4"
      style={{
        border: `1px solid ${config.borderColor}`,
        backgroundColor: "#fff",
      }}
    >
      {/* Top row: name + type badge */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold m-0" style={{ color: config.primaryColor }}>
          {scheme.name}
        </h3>
        <span
          className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded whitespace-nowrap shrink-0"
          style={{ backgroundColor: badge.bg, color: badge.color }}
        >
          {scheme.type}
        </span>
      </div>

      {/* Validity */}
      <p className="text-xs m-0" style={{ color: config.secondaryColor }}>
        {formatDate(scheme.validFrom)} – {formatDate(scheme.validTo)}
      </p>

      {/* Eligibility summary */}
      <p className="text-xs leading-relaxed m-0" style={{ color: "#4B5563" }}>
        {scheme.eligibilitySummary}
      </p>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium" style={{ color: config.secondaryColor }}>
            Progress
          </span>
          <span className="text-[11px] font-semibold" style={{ color: config.primaryColor }}>
            {Math.round(pct)}%
          </span>
        </div>
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: "#E5E7EB" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              backgroundColor: achieved ? "#16A34A" : config.primaryColor,
            }}
          />
        </div>
      </div>

      {/* Target / Achieved / Remaining */}
      <div className="grid grid-cols-3 gap-3">
        <MetricBlock label="Target" value={targetLabel} config={config} />
        <MetricBlock label="Achieved" value={achievedLabel} config={config} />
        <MetricBlock
          label={achieved ? "Status" : "Remaining"}
          value={achieved ? "Target Achieved" : remainingLabel}
          config={config}
          highlight={achieved}
        />
      </div>

      {/* Slab messaging */}
      {scheme.slabs && !achieved && next && (
        <p className="text-xs m-0 px-3 py-2 rounded-lg" style={{ backgroundColor: "#FFFBEB", color: "#92400E" }}>
          Next slab <strong>{next.label}</strong> unlocks at{" "}
          {scheme.targetUnit === "$" ? formatCurrency(next.min) : `${next.min} ${scheme.targetUnit}`}
        </p>
      )}
      {scheme.slabs && cur && (
        <p className="text-xs m-0 px-3 py-2 rounded-lg" style={{ backgroundColor: "#F0F4FF", color: "#1E40AF" }}>
          Current slab: <strong>{cur.label}</strong> ({cur.benefitPercent}% reward)
        </p>
      )}

      {/* Proportionate benefit */}
      {scheme.proportionateAllowed && scheme.currentEligibleBenefit > 0 && (
        <div
          className="rounded-lg px-3 py-2.5"
          style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}
        >
          <p className="text-[11px] m-0 mb-1" style={{ color: "#16A34A" }}>
            Proportionate benefit applicable based on current achievement.
          </p>
          <p className="text-sm font-semibold m-0" style={{ color: "#15803D" }}>
            Eligible: {formatCurrency(scheme.currentEligibleBenefit)}
          </p>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={() => navigate(`/account/schemes/${scheme.id}`)}
        className="flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg cursor-pointer transition-colors border-none text-white mt-auto"
        style={{ backgroundColor: config.primaryColor }}
      >
        View Details
        <ArrowRightOutlined style={{ fontSize: 11 }} />
      </button>
    </div>
  );
}

function MetricBlock({
  label,
  value,
  config,
  highlight,
}: {
  label: string;
  value: string;
  config: typeof activeBrandConfig;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-lg px-3 py-2"
      style={{ backgroundColor: config.cardBg }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider m-0 mb-0.5" style={{ color: config.secondaryColor }}>
        {label}
      </p>
      <p
        className="text-sm font-semibold m-0"
        style={{ color: highlight ? "#16A34A" : config.primaryColor }}
      >
        {value}
      </p>
    </div>
  );
}
