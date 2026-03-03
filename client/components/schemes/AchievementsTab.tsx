import { useNavigate } from "react-router-dom";
import { activeBrandConfig } from "../../config/brandConfig";
import { getAchievements, formatCurrency, formatDate, type CreditNoteStatus } from "../../data/schemes";

const cnStatusStyles: Record<CreditNoteStatus, { color: string; bg: string }> = {
  Pending: { color: "#D97706", bg: "#FFFBEB" },
  Generated: { color: "#2563EB", bg: "#EFF6FF" },
  Adjusted: { color: "#16A34A", bg: "#F0FDF4" },
};

const columns = "1.6fr 0.8fr 1fr 0.9fr 0.9fr 0.9fr 1.1fr";

export default function AchievementsTab() {
  const config = activeBrandConfig;
  const navigate = useNavigate();
  const achievements = getAchievements();

  if (achievements.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm" style={{ color: config.secondaryColor }}>
          No achievements yet.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${config.borderColor}` }}
    >
      {/* Header */}
      <div
        className="grid gap-4 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider"
        style={{
          gridTemplateColumns: columns,
          backgroundColor: config.cardBg,
          color: config.secondaryColor,
          borderBottom: `1px solid ${config.borderColor}`,
        }}
      >
        <span>Scheme Name</span>
        <span>Type</span>
        <span>Period</span>
        <span className="text-right">Target</span>
        <span className="text-right">Achieved</span>
        <span className="text-right">Benefit Earned</span>
        <span>Credit Note Status</span>
      </div>

      {/* Rows */}
      {achievements.map((scheme, idx) => {
        const sts = cnStatusStyles[scheme.creditNoteStatus];
        const targetLabel =
          scheme.targetUnit === "$" ? formatCurrency(scheme.target) : `${scheme.target} ${scheme.targetUnit}`;
        const achievedLabel =
          scheme.targetUnit === "$" ? formatCurrency(scheme.achieved) : `${scheme.achieved} ${scheme.targetUnit}`;

        return (
          <div
            key={scheme.id}
            className="grid gap-4 px-5 py-3.5 items-center"
            style={{
              gridTemplateColumns: columns,
              borderBottom: idx < achievements.length - 1 ? `1px solid ${config.borderColor}` : "none",
              backgroundColor: "#fff",
            }}
          >
            {/* Scheme Name */}
            <button
              onClick={() => navigate(`/account/schemes/${scheme.id}`)}
              className="text-sm font-medium text-left bg-transparent border-none p-0 cursor-pointer hover:underline"
              style={{ color: config.primaryColor }}
            >
              {scheme.name}
            </button>

            {/* Type Badge */}
            <span>
              <TypeBadge type={scheme.type} />
            </span>

            {/* Period */}
            <span className="text-xs" style={{ color: config.secondaryColor }}>
              {formatDate(scheme.validFrom)} – {formatDate(scheme.validTo)}
            </span>

            {/* Target */}
            <span className="text-sm text-right" style={{ color: config.primaryColor }}>
              {targetLabel}
            </span>

            {/* Achieved */}
            <span className="text-sm font-medium text-right" style={{ color: config.primaryColor }}>
              {achievedLabel}
            </span>

            {/* Benefit Earned */}
            <span className="text-sm font-semibold text-right" style={{ color: "#16A34A" }}>
              {scheme.benefitEarned > 0 ? formatCurrency(scheme.benefitEarned) : "—"}
            </span>

            {/* Credit Note Status */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded whitespace-nowrap"
                style={{ color: sts.color, backgroundColor: sts.bg }}
              >
                {scheme.creditNoteStatus}
              </span>
              {scheme.creditNoteNumber && (
                <button
                  onClick={() => navigate(`/account/returns`)}
                  className="text-[11px] font-medium bg-transparent border-none p-0 cursor-pointer hover:underline"
                  style={{ color: config.primaryColor }}
                >
                  {scheme.creditNoteNumber}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    Trade: { bg: "#EEF2FF", color: "#4338CA" },
    Consumer: { bg: "#FFF7ED", color: "#C2410C" },
  };
  const s = styles[type] || styles.Trade;
  return (
    <span
      className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {type}
    </span>
  );
}
