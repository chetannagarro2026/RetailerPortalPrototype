import { activeBrandConfig } from "../../config/brandConfig";
import type { ReturnClaim } from "../../data/returns";

function fmt(val: number): string {
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

interface Props {
  claim: ReturnClaim;
}

export default function ClaimSummary({ claim }: Props) {
  const config = activeBrandConfig;
  const hasApproval = claim.approvedAmount !== undefined;
  const rejectedAmount = hasApproval ? claim.claimedAmount - claim.approvedAmount! : 0;

  return (
    <div
      className="rounded-xl p-5 mt-4 mb-5"
      style={{ backgroundColor: config.cardBg, border: `1px solid ${config.borderColor}` }}
    >
      <h3 className="text-xs font-semibold uppercase tracking-wider m-0 mb-4" style={{ color: config.secondaryColor }}>
        Claim Summary
      </h3>

      <div className="flex flex-col gap-2.5">
        {/* Claimed Amount */}
        <div className="flex justify-between items-center text-sm">
          <span style={{ color: config.secondaryColor }}>Claimed Amount</span>
          <span className="font-medium" style={{ color: config.primaryColor }}>{fmt(claim.claimedAmount)}</span>
        </div>

        {/* Approved Amount */}
        {hasApproval && (
          <div className="flex justify-between items-center text-sm">
            <span style={{ color: config.secondaryColor }}>Approved Amount</span>
            <span className="font-semibold" style={{ color: "#16A34A" }}>{fmt(claim.approvedAmount!)}</span>
          </div>
        )}

        {/* Rejected Amount */}
        {hasApproval && rejectedAmount > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span style={{ color: config.secondaryColor }}>Rejected Amount</span>
            <span className="font-medium" style={{ color: "#DC2626" }}>{fmt(rejectedAmount)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
