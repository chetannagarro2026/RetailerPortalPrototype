import { activeBrandConfig } from "../../config/brandConfig";
import {
  type Scheme,
  CALC_METHOD_LABELS,
  formatDate,
  formatCurrency,
} from "../../data/schemes";

interface Props {
  scheme: Scheme;
}

const typeBadgeStyles: Record<string, { bg: string; color: string }> = {
  Trade: { bg: "#EEF2FF", color: "#4338CA" },
  Consumer: { bg: "#FFF7ED", color: "#C2410C" },
};

export default function SchemeOverview({ scheme }: Props) {
  const config = activeBrandConfig;
  const badge = typeBadgeStyles[scheme.type] || typeBadgeStyles.Trade;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-lg font-bold m-0" style={{ color: config.primaryColor }}>
            {scheme.name}
          </h1>
          <span
            className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded whitespace-nowrap shrink-0"
            style={{ backgroundColor: badge.bg, color: badge.color }}
          >
            {scheme.type}
          </span>
        </div>
        <p className="text-xs m-0" style={{ color: config.secondaryColor }}>
          {formatDate(scheme.validFrom)} – {formatDate(scheme.validTo)}
        </p>
      </div>

      {/* Eligibility Criteria */}
      <Section title="Eligibility Criteria" config={config}>
        <ul className="m-0 pl-4 flex flex-col gap-1.5">
          {scheme.eligibilityCriteria.map((c, i) => (
            <li key={i} className="text-sm leading-relaxed" style={{ color: "#374151" }}>
              {c}
            </li>
          ))}
        </ul>
      </Section>

      {/* Slab Structure */}
      {scheme.slabs && scheme.slabs.length > 0 && (
        <Section title="Slab Structure" config={config}>
          <div
            className="rounded-lg overflow-hidden"
            style={{ border: `1px solid ${config.borderColor}` }}
          >
            <div
              className="grid gap-4 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider"
              style={{
                gridTemplateColumns: "1fr 1fr 1fr",
                backgroundColor: config.cardBg,
                color: config.secondaryColor,
                borderBottom: `1px solid ${config.borderColor}`,
              }}
            >
              <span>Slab</span>
              <span>Range</span>
              <span className="text-right">Reward %</span>
            </div>
            {scheme.slabs.map((slab, idx) => (
              <div
                key={idx}
                className="grid gap-4 px-4 py-2.5 items-center"
                style={{
                  gridTemplateColumns: "1fr 1fr 1fr",
                  borderBottom: idx < scheme.slabs!.length - 1 ? `1px solid ${config.borderColor}` : "none",
                  backgroundColor: "#fff",
                }}
              >
                <span className="text-sm font-medium" style={{ color: config.primaryColor }}>
                  {slab.label}
                </span>
                <span className="text-xs" style={{ color: config.secondaryColor }}>
                  {scheme.targetUnit === "$" ? formatCurrency(slab.min) : slab.min}
                  {" – "}
                  {slab.max === null
                    ? "No limit"
                    : scheme.targetUnit === "$"
                      ? formatCurrency(slab.max)
                      : slab.max}
                </span>
                <span className="text-sm font-semibold text-right" style={{ color: config.primaryColor }}>
                  {slab.benefitPercent !== undefined ? `${slab.benefitPercent}%` : formatCurrency(slab.benefitAmount ?? 0)}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Calculation Method */}
      <Section title="Calculation Method" config={config}>
        <div
          className="rounded-lg px-4 py-3"
          style={{ backgroundColor: config.cardBg }}
        >
          <p className="text-xs font-semibold m-0 mb-1" style={{ color: config.primaryColor }}>
            {CALC_METHOD_LABELS[scheme.calculationMethod]}
          </p>
          <p className="text-xs m-0 leading-relaxed" style={{ color: config.secondaryColor }}>
            {scheme.calculationLabel}
          </p>
        </div>
      </Section>

      {/* Excluded SKUs */}
      {scheme.excludedSkus && scheme.excludedSkus.length > 0 && (
        <Section title="Excluded SKUs" config={config}>
          <div className="flex flex-wrap gap-2">
            {scheme.excludedSkus.map((sku) => (
              <span
                key={sku}
                className="text-xs font-medium px-2.5 py-1 rounded-lg"
                style={{
                  backgroundColor: "#FEF2F2",
                  color: "#991B1B",
                  border: "1px solid #FECACA",
                }}
              >
                {sku}
              </span>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  config,
  children,
}: {
  title: string;
  config: typeof activeBrandConfig;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      <h3
        className="text-xs font-semibold uppercase tracking-wider m-0 mb-3"
        style={{ color: config.secondaryColor }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
