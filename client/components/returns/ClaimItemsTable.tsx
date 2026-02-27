import { activeBrandConfig } from "../../config/brandConfig";
import type { ReturnClaim } from "../../data/returns";

function fmt(val: number): string {
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

interface Props {
  claim: ReturnClaim;
}

export default function ClaimItemsTable({ claim }: Props) {
  const config = activeBrandConfig;
  const hasApproval = claim.items.some((i) => i.approvedQty !== undefined);

  return (
    <div className="rounded-xl overflow-hidden mb-4" style={{ border: `1px solid ${config.borderColor}` }}>
      <div
        className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider"
        style={{ backgroundColor: config.cardBg, color: config.secondaryColor, borderBottom: `1px solid ${config.borderColor}` }}
      >
        Claimed Items
      </div>

      <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${config.borderColor}` }}>
            <th className="text-[11px] font-semibold uppercase tracking-wider py-3 px-4 text-left" style={{ color: config.secondaryColor }}>Product</th>
            <th className="text-[11px] font-semibold uppercase tracking-wider py-3 px-4 text-left" style={{ color: config.secondaryColor }}>SKU</th>
            <th className="text-[11px] font-semibold uppercase tracking-wider py-3 px-4 text-center" style={{ color: config.secondaryColor }}>Claimed Qty</th>
            {hasApproval && (
              <>
                <th className="text-[11px] font-semibold uppercase tracking-wider py-3 px-4 text-center" style={{ color: config.secondaryColor }}>Approved Qty</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider py-3 px-4 text-center" style={{ color: config.secondaryColor }}>Rejected Qty</th>
              </>
            )}
            <th className="text-[11px] font-semibold uppercase tracking-wider py-3 px-4 text-right" style={{ color: config.secondaryColor }}>Claimed Amt</th>
            {hasApproval && (
              <th className="text-[11px] font-semibold uppercase tracking-wider py-3 px-4 text-right" style={{ color: config.secondaryColor }}>Approved Amt</th>
            )}
            <th className="text-[11px] font-semibold uppercase tracking-wider py-3 px-4 text-left" style={{ color: config.secondaryColor }}>Reason</th>
          </tr>
        </thead>
        <tbody>
          {claim.items.map((item, idx) => {
            const rejectedQty = item.approvedQty !== undefined ? item.returnQty - item.approvedQty : 0;
            return (
              <tr key={item.itemId} style={{ borderBottom: idx < claim.items.length - 1 ? `1px solid ${config.borderColor}` : "none", backgroundColor: "#fff" }}>
                <td className="py-3 px-4 font-medium" style={{ color: config.primaryColor }}>{item.productName}</td>
                <td className="py-3 px-4 text-xs" style={{ color: config.secondaryColor }}>{item.sku}</td>
                <td className="py-3 px-4 text-center">{item.returnQty}</td>
                {hasApproval && (
                  <>
                    <td className="py-3 px-4 text-center font-medium" style={{ color: "#16A34A" }}>{item.approvedQty ?? "—"}</td>
                    <td className="py-3 px-4 text-center" style={{ color: rejectedQty > 0 ? "#DC2626" : config.secondaryColor }}>{rejectedQty > 0 ? rejectedQty : "—"}</td>
                  </>
                )}
                <td className="py-3 px-4 text-right">{fmt(item.returnQty * item.unitPrice)}</td>
                {hasApproval && (
                  <td className="py-3 px-4 text-right font-medium" style={{ color: "#16A34A" }}>{item.approvedQty !== undefined ? fmt(item.approvedQty * item.unitPrice) : "—"}</td>
                )}
                <td className="py-3 px-4 text-xs" style={{ color: config.secondaryColor }}>{item.reason}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer Summary — right-aligned like invoice detail */}
      {hasApproval && claim.approvedAmount !== undefined && (
        <div
          className="px-5 py-4"
          style={{ borderTop: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
        >
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-6">
              <span className="text-xs" style={{ color: config.secondaryColor }}>Claimed Amount</span>
              <span className="text-sm font-medium w-28 text-right" style={{ color: config.primaryColor }}>{fmt(claim.claimedAmount)}</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-xs" style={{ color: config.secondaryColor }}>Approved Amount</span>
              <span className="text-sm font-semibold w-28 text-right" style={{ color: "#16A34A" }}>{fmt(claim.approvedAmount)}</span>
            </div>
            {claim.approvedAmount < claim.claimedAmount && (
              <div className="flex items-center gap-6">
                <span className="text-xs" style={{ color: config.secondaryColor }}>Rejected Amount</span>
                <span className="text-sm font-medium w-28 text-right" style={{ color: "#DC2626" }}>{fmt(claim.claimedAmount - claim.approvedAmount)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
