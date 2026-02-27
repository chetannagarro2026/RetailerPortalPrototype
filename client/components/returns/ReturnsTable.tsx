import { Link } from "react-router-dom";
import { activeBrandConfig } from "../../config/brandConfig";
import type { ReturnClaim } from "../../data/returns";

const statusStyles: Record<string, { color: string }> = {
  Submitted: { color: "#2563EB" },
  "Under Review": { color: "#D97706" },
  Approved: { color: "#16A34A" },
  Rejected: { color: "#DC2626" },
  Completed: { color: "#6B7B99" },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmt(val: number): string {
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

interface Props {
  claims: ReturnClaim[];
}

export default function ReturnsTable({ claims }: Props) {
  const config = activeBrandConfig;
  const columns = "1.2fr 1.2fr 0.6fr 1fr 0.8fr 1fr";

  if (claims.length === 0) {
    return (
      <div
        className="rounded-xl text-center py-16"
        style={{ border: `1px solid ${config.borderColor}` }}
      >
        <p className="text-sm" style={{ color: config.secondaryColor }}>
          No claims match this filter.
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
        <span>Claim ID</span>
        <span>Invoice Reference</span>
        <span className="text-center">Items</span>
        <span className="text-right">Claimed Amount</span>
        <span>Status</span>
        <span className="text-center">Created Date</span>
      </div>

      {/* Rows */}
      {claims.map((claim, idx) => {
        const sts = statusStyles[claim.status] || statusStyles.Submitted;
        const itemCount = claim.items.filter((i) => i.returnQty > 0).length;
        return (
          <div
            key={claim.id}
            className="grid gap-4 px-5 py-4 items-center"
            style={{
              gridTemplateColumns: columns,
              borderBottom: idx < claims.length - 1 ? `1px solid ${config.borderColor}` : "none",
              backgroundColor: "#fff",
            }}
          >
            <Link
              to={`/account/returns/${claim.claimId}`}
              className="text-sm font-semibold no-underline hover:underline"
              style={{ color: config.primaryColor }}
            >
              {claim.claimId}
            </Link>

            <span className="text-sm" style={{ color: config.primaryColor }}>
              {claim.invoiceNumber}
            </span>

            <span className="text-sm text-center" style={{ color: config.primaryColor }}>
              {itemCount}
            </span>

            <span className="text-sm font-medium text-right" style={{ color: config.primaryColor }}>
              {fmt(claim.claimedAmount)}
            </span>

            <div>
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded whitespace-nowrap inline-flex"
                style={{ color: sts.color, backgroundColor: "transparent", border: `1px solid ${sts.color}` }}
              >
                {claim.status}
              </span>
            </div>

            <span className="text-xs text-center" style={{ color: config.secondaryColor }}>
              {formatDate(claim.createdAt)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
