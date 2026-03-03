import { DownloadOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import {
  type Scheme,
  progressPercent,
  remaining,
  isTargetAchieved,
  currentSlab,
  nextSlab,
  formatCurrency,
} from "../../data/schemes";
import { RETURN_CLAIMS } from "../../data/returns";
import { downloadCreditNotePdf } from "../../utils/creditNotePdf";

interface Props {
  scheme: Scheme;
}

export default function PerformanceSummary({ scheme }: Props) {
  const config = activeBrandConfig;
  const pct = progressPercent(scheme);
  const rem = remaining(scheme);
  const achieved = isTargetAchieved(scheme);
  const cur = currentSlab(scheme);
  const next = nextSlab(scheme);

  const targetLabel =
    scheme.targetUnit === "$" ? formatCurrency(scheme.target) : `${scheme.target} ${scheme.targetUnit}`;
  const achievedLabel =
    scheme.targetUnit === "$" ? formatCurrency(scheme.achieved) : `${scheme.achieved} ${scheme.targetUnit}`;
  const remainingLabel =
    scheme.targetUnit === "$" ? formatCurrency(rem) : `${rem} ${scheme.targetUnit}`;

  // Find the matching return claim for CN download
  const cnClaim = scheme.creditNoteNumber
    ? RETURN_CLAIMS.find((c) => c.creditNoteNumber === scheme.creditNoteNumber)
    : null;

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4"
      style={{
        border: `1px solid ${config.borderColor}`,
        backgroundColor: "#fff",
        position: "sticky",
        top: 140,
      }}
    >
      <h3
        className="text-xs font-semibold uppercase tracking-wider m-0"
        style={{ color: config.secondaryColor }}
      >
        Performance Summary
      </h3>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium" style={{ color: config.secondaryColor }}>
            {Math.round(pct)}% complete
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "#E5E7EB" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              backgroundColor: achieved ? "#16A34A" : config.primaryColor,
            }}
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="flex flex-col gap-3">
        <MetricRow label="Target" value={targetLabel} config={config} />
        <MetricRow label="Achieved" value={achievedLabel} config={config} bold />
        <MetricRow
          label={achieved ? "Status" : "Remaining"}
          value={achieved ? "Target Achieved" : remainingLabel}
          config={config}
          highlight={achieved}
        />
        {scheme.currentEligibleBenefit > 0 && (
          <MetricRow
            label="Current Eligible Benefit"
            value={formatCurrency(scheme.currentEligibleBenefit)}
            config={config}
            highlight
          />
        )}
      </div>

      {/* Next slab */}
      {scheme.slabs && !achieved && next && (
        <div className="rounded-lg px-3 py-2.5" style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A" }}>
          <p className="text-[11px] font-semibold m-0 mb-0.5" style={{ color: "#92400E" }}>
            Next Slab Unlock
          </p>
          <p className="text-xs m-0" style={{ color: "#78350F" }}>
            <strong>{next.label}</strong> at{" "}
            {scheme.targetUnit === "$" ? formatCurrency(next.min) : `${next.min} ${scheme.targetUnit}`}
            {next.benefitPercent !== undefined && ` (${next.benefitPercent}% reward)`}
          </p>
        </div>
      )}

      {/* Current slab info */}
      {cur && (
        <div className="rounded-lg px-3 py-2.5" style={{ backgroundColor: "#F0F4FF", border: "1px solid #BFDBFE" }}>
          <p className="text-[11px] font-semibold m-0 mb-0.5" style={{ color: "#1E40AF" }}>
            Current Slab
          </p>
          <p className="text-xs m-0" style={{ color: "#1E3A5F" }}>
            {cur.label} — {cur.benefitPercent}% reward
          </p>
        </div>
      )}

      {/* Proportionate message */}
      {scheme.proportionateAllowed && (
        <p className="text-[11px] m-0 leading-relaxed" style={{ color: "#16A34A" }}>
          Proportionate benefit applicable based on current achievement.
        </p>
      )}

      {/* Credit Note */}
      {scheme.creditNoteNumber && (
        <div
          className="rounded-lg px-3 py-2.5"
          style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider m-0 mb-1" style={{ color: "#16A34A" }}>
            Credit Note
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: config.primaryColor }}>
              {scheme.creditNoteNumber}
            </span>
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{
                color: scheme.creditNoteStatus === "Adjusted" ? "#16A34A" : "#2563EB",
                backgroundColor: scheme.creditNoteStatus === "Adjusted" ? "#DCFCE7" : "#EFF6FF",
              }}
            >
              {scheme.creditNoteStatus}
            </span>
          </div>
          {cnClaim && (
            <button
              onClick={() => downloadCreditNotePdf(cnClaim)}
              className="flex items-center gap-1.5 text-[11px] font-medium mt-2 bg-transparent border-none p-0 cursor-pointer"
              style={{ color: config.primaryColor }}
            >
              <DownloadOutlined style={{ fontSize: 11 }} />
              Download PDF
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function MetricRow({
  label,
  value,
  config,
  bold,
  highlight,
}: {
  label: string;
  value: string;
  config: typeof activeBrandConfig;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color: config.secondaryColor }}>
        {label}
      </span>
      <span
        className={`text-sm ${bold || highlight ? "font-semibold" : "font-medium"}`}
        style={{ color: highlight ? "#16A34A" : config.primaryColor }}
      >
        {value}
      </span>
    </div>
  );
}
