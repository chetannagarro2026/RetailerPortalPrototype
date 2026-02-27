import { useEffect } from "react";
import { CloseOutlined, DownloadOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import type { ReturnClaim } from "../../data/returns";
import { downloadCreditNotePdf } from "../../utils/creditNotePdf";

function fmt(val: number): string {
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

interface Props {
  claim: ReturnClaim;
  visible: boolean;
  onClose: () => void;
}

export default function CreditNoteOverlayPanel({ claim, visible, onClose }: Props) {
  const config = activeBrandConfig;

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, onClose]);

  if (!visible || !claim.creditNoteNumber) return null;

  const hasApproval = claim.items.some((i) => i.approvedQty !== undefined);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.35)", zIndex: 999 }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(600px, 85vw)",
          backgroundColor: "#fff",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${config.borderColor}` }}
        >
          <div>
            <h2 className="text-base font-bold m-0" style={{ color: config.primaryColor }}>
              Credit Note {claim.creditNoteNumber}
            </h2>
            <p className="text-xs m-0 mt-0.5" style={{ color: config.secondaryColor }}>
              Issued for claim {claim.claimId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer bg-transparent"
            style={{ border: `1px solid ${config.borderColor}`, color: config.secondaryColor }}
          >
            <CloseOutlined style={{ fontSize: 12 }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5" style={{ backgroundColor: config.cardBg }}>
          {/* Meta Info */}
          <div
            className="rounded-xl p-4 mb-5"
            style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
          >
            <div className="grid grid-cols-2 gap-4">
              <MetaField label="Credit Note" value={claim.creditNoteNumber!} config={config} />
              <MetaField label="Claim ID" value={claim.claimId} config={config} />
              <MetaField label="Invoice" value={claim.invoiceNumber} config={config} />
              <MetaField label="Issue Date" value={formatDate(claim.reviewedAt || claim.createdAt)} config={config} />
              <MetaField label="Status" value={claim.status} config={config} />
            </div>
          </div>

          {/* Items Table */}
          <div
            className="rounded-xl overflow-hidden mb-5"
            style={{ border: `1px solid ${config.borderColor}` }}
          >
            <div
              className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider"
              style={{ backgroundColor: config.cardBg, color: config.secondaryColor, borderBottom: `1px solid ${config.borderColor}` }}
            >
              Credit Note Items
            </div>
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${config.borderColor}` }}>
                  <th className="text-[11px] font-semibold uppercase tracking-wider py-3 px-4 text-left" style={{ color: config.secondaryColor }}>Product</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider py-3 px-4 text-left" style={{ color: config.secondaryColor }}>SKU</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider py-3 px-4 text-center" style={{ color: config.secondaryColor }}>
                    {hasApproval ? "Approved Qty" : "Qty"}
                  </th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider py-3 px-4 text-right" style={{ color: config.secondaryColor }}>Unit Price</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider py-3 px-4 text-right" style={{ color: config.secondaryColor }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {claim.items.map((item, idx) => {
                  const qty = hasApproval ? (item.approvedQty ?? 0) : item.returnQty;
                  const amt = qty * item.unitPrice;
                  return (
                    <tr key={item.itemId} style={{ borderBottom: idx < claim.items.length - 1 ? `1px solid ${config.borderColor}` : "none", backgroundColor: "#fff" }}>
                      <td className="py-3 px-4 font-medium" style={{ color: config.primaryColor }}>{item.productName}</td>
                      <td className="py-3 px-4 text-xs" style={{ color: config.secondaryColor }}>{item.sku}</td>
                      <td className="py-3 px-4 text-center" style={{ color: config.primaryColor }}>{qty}</td>
                      <td className="py-3 px-4 text-right" style={{ color: config.primaryColor }}>{fmt(item.unitPrice)}</td>
                      <td className="py-3 px-4 text-right font-medium" style={{ color: config.primaryColor }}>{fmt(amt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Total */}
            <div
              className="px-5 py-4"
              style={{ borderTop: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
            >
              <div className="flex flex-col items-end gap-1">
                {hasApproval && claim.approvedAmount !== undefined && claim.approvedAmount < claim.claimedAmount && (
                  <div className="flex items-center gap-6">
                    <span className="text-xs" style={{ color: config.secondaryColor }}>Claimed Amount</span>
                    <span className="text-sm font-medium w-28 text-right" style={{ color: config.secondaryColor }}>{fmt(claim.claimedAmount)}</span>
                  </div>
                )}
                <div
                  className="flex items-center gap-6 pt-1"
                  style={{ borderTop: hasApproval && claim.approvedAmount !== undefined && claim.approvedAmount < claim.claimedAmount ? `1px solid ${config.borderColor}` : "none", marginTop: hasApproval && claim.approvedAmount !== undefined && claim.approvedAmount < claim.claimedAmount ? 4 : 0, paddingTop: hasApproval && claim.approvedAmount !== undefined && claim.approvedAmount < claim.claimedAmount ? 8 : 0 }}
                >
                  <span className="text-xs font-semibold" style={{ color: config.primaryColor }}>Credit Total</span>
                  <span className="text-sm font-bold w-28 text-right" style={{ color: config.primaryColor }}>
                    {fmt(claim.approvedAmount ?? claim.claimedAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={() => downloadCreditNotePdf(claim)}
            className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-lg cursor-pointer text-white border-none w-full justify-center"
            style={{ backgroundColor: config.primaryColor }}
          >
            <DownloadOutlined style={{ fontSize: 13 }} />
            Download Credit Note PDF
          </button>
        </div>
      </div>
    </>
  );
}

function MetaField({ label, value, config }: { label: string; value: string; config: typeof activeBrandConfig }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider m-0 mb-1" style={{ color: config.secondaryColor }}>
        {label}
      </p>
      <p className="text-sm font-medium m-0" style={{ color: config.primaryColor }}>
        {value}
      </p>
    </div>
  );
}
