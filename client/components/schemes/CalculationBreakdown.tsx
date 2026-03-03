import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DownOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { type Scheme, formatCurrency, formatDate } from "../../data/schemes";

interface Props {
  scheme: Scheme;
}

export default function CalculationBreakdown({ scheme }: Props) {
  const config = activeBrandConfig;
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const showSkuBreakdown = scheme.isSkuBased && scheme.skuContributions && scheme.skuContributions.length > 0;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      {/* Toggle header */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer bg-transparent border-none text-left"
        style={{ color: config.primaryColor }}
      >
        <span className="text-sm font-semibold">View Calculation Details</span>
        <DownOutlined
          style={{
            fontSize: 11,
            color: config.secondaryColor,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {expanded && (
        <div style={{ borderTop: `1px solid ${config.borderColor}` }}>
          {/* Invoice-level contributions */}
          <InvoiceTable scheme={scheme} config={config} navigate={navigate} />

          {/* SKU-level breakdown (if applicable) */}
          {showSkuBreakdown && (
            <div style={{ borderTop: `1px solid ${config.borderColor}` }}>
              <SkuTable scheme={scheme} config={config} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InvoiceTable({
  scheme,
  config,
  navigate,
}: {
  scheme: Scheme;
  config: typeof activeBrandConfig;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const cols = "1.2fr 1fr 1fr 1fr";

  return (
    <div>
      <div
        className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider"
        style={{ backgroundColor: config.cardBg, color: config.secondaryColor, borderBottom: `1px solid ${config.borderColor}` }}
      >
        Invoice-Level Contributions
      </div>

      {/* Header */}
      <div
        className="grid gap-4 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider"
        style={{
          gridTemplateColumns: cols,
          color: config.secondaryColor,
          borderBottom: `1px solid ${config.borderColor}`,
        }}
      >
        <span>Invoice No</span>
        <span>Date</span>
        <span className="text-right">Eligible Amount</span>
        <span className="text-right">Contribution</span>
      </div>

      {/* Rows */}
      {scheme.invoiceContributions.map((inv, idx) => (
        <div
          key={inv.invoiceNumber}
          className="grid gap-4 px-5 py-3 items-center"
          style={{
            gridTemplateColumns: cols,
            borderBottom: idx < scheme.invoiceContributions.length - 1 ? `1px solid ${config.borderColor}` : "none",
          }}
        >
          <button
            onClick={() => navigate(`/account/invoices/${inv.invoiceNumber}`)}
            className="text-sm font-medium text-left bg-transparent border-none p-0 cursor-pointer hover:underline"
            style={{ color: config.primaryColor }}
          >
            {inv.invoiceNumber}
          </button>
          <span className="text-xs" style={{ color: config.secondaryColor }}>
            {formatDate(inv.date)}
          </span>
          <span className="text-sm text-right" style={{ color: config.primaryColor }}>
            {formatCurrency(inv.eligibleAmount)}
          </span>
          <span className="text-sm font-medium text-right" style={{ color: config.primaryColor }}>
            {scheme.targetUnit === "$"
              ? formatCurrency(inv.contributionToTarget)
              : `${inv.contributionToTarget} ${scheme.targetUnit}`}
          </span>
        </div>
      ))}

      {/* Total row */}
      <div
        className="grid gap-4 px-5 py-3 items-center"
        style={{
          gridTemplateColumns: cols,
          borderTop: `1px solid ${config.borderColor}`,
          backgroundColor: config.cardBg,
        }}
      >
        <span className="text-xs font-semibold" style={{ color: config.primaryColor }}>
          Total
        </span>
        <span />
        <span className="text-sm font-semibold text-right" style={{ color: config.primaryColor }}>
          {formatCurrency(scheme.invoiceContributions.reduce((s, i) => s + i.eligibleAmount, 0))}
        </span>
        <span className="text-sm font-semibold text-right" style={{ color: config.primaryColor }}>
          {scheme.targetUnit === "$"
            ? formatCurrency(scheme.invoiceContributions.reduce((s, i) => s + i.contributionToTarget, 0))
            : `${scheme.invoiceContributions.reduce((s, i) => s + i.contributionToTarget, 0)} ${scheme.targetUnit}`}
        </span>
      </div>
    </div>
  );
}

function SkuTable({
  scheme,
  config,
}: {
  scheme: Scheme;
  config: typeof activeBrandConfig;
}) {
  const cols = "1.4fr 1fr 0.8fr 1fr";

  return (
    <div>
      <div
        className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider"
        style={{ backgroundColor: config.cardBg, color: config.secondaryColor, borderBottom: `1px solid ${config.borderColor}` }}
      >
        SKU-Level Breakdown
      </div>

      {/* Header */}
      <div
        className="grid gap-4 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider"
        style={{
          gridTemplateColumns: cols,
          color: config.secondaryColor,
          borderBottom: `1px solid ${config.borderColor}`,
        }}
      >
        <span>Product</span>
        <span>SKU</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Amount</span>
      </div>

      {/* Rows */}
      {scheme.skuContributions!.map((sku, idx) => (
        <div
          key={sku.sku}
          className="grid gap-4 px-5 py-3 items-center"
          style={{
            gridTemplateColumns: cols,
            borderBottom: idx < scheme.skuContributions!.length - 1 ? `1px solid ${config.borderColor}` : "none",
          }}
        >
          <span className="text-sm font-medium" style={{ color: config.primaryColor }}>
            {sku.productName}
          </span>
          <span className="text-xs" style={{ color: config.secondaryColor }}>
            {sku.sku}
          </span>
          <span className="text-sm text-right" style={{ color: config.primaryColor }}>
            {sku.quantity}
          </span>
          <span className="text-sm font-medium text-right" style={{ color: config.primaryColor }}>
            {formatCurrency(sku.amount)}
          </span>
        </div>
      ))}
    </div>
  );
}
