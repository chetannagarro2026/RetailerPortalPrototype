import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, DownloadOutlined, FileTextOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../config/brandConfig";
import { RETURN_CLAIMS } from "../data/returns";
import ClaimDetailsSidebar from "../components/returns/ClaimDetailsSidebar";
import ClaimAttachments from "../components/returns/ClaimAttachments";
import ClaimItemsTable from "../components/returns/ClaimItemsTable";
import ClaimComments from "../components/returns/ClaimComments";
import InvoiceOverlayPanel from "../components/returns/InvoiceOverlayPanel";
import CreditNoteOverlayPanel from "../components/returns/CreditNoteOverlayPanel";
import { downloadCreditNotePdf } from "../utils/creditNotePdf";


export default function ClaimDetailPage() {
  const config = activeBrandConfig;
  const navigate = useNavigate();
  const { claimId } = useParams<{ claimId: string }>();
  const [invoiceOverlayOpen, setInvoiceOverlayOpen] = useState(false);
  const closeInvoiceOverlay = useCallback(() => setInvoiceOverlayOpen(false), []);
  const [cnOverlayOpen, setCnOverlayOpen] = useState(false);
  const closeCnOverlay = useCallback(() => setCnOverlayOpen(false), []);

  const claim = RETURN_CLAIMS.find((c) => c.claimId === claimId) || null;

  if (!claim) {
    return (
      <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "64px 24px", boxSizing: "border-box" }} className="text-center">
        <FileTextOutlined className="text-5xl mb-4" style={{ color: config.secondaryColor }} />
        <h1 className="text-xl font-semibold mb-2" style={{ color: config.primaryColor }}>Claim Not Found</h1>
        <p className="text-sm mb-6" style={{ color: config.secondaryColor }}>The return claim you're looking for doesn't exist.</p>
        <button onClick={() => navigate("/account/returns")} className="text-sm font-medium px-6 py-2.5 rounded-lg text-white border-none cursor-pointer" style={{ backgroundColor: config.primaryColor }}>Back to Returns</button>
      </div>
    );
  }

  // Partial approval detection
  const hasApproval = claim.items.some((i) => i.approvedQty !== undefined);
  const isPartialApproval = hasApproval && claim.approvedAmount !== undefined && claim.approvedAmount < claim.claimedAmount;

  // Build partial approval banner text
  let partialBannerText = "";
  if (isPartialApproval) {
    const partials = claim.items
      .filter((i) => i.approvedQty !== undefined && i.approvedQty < i.returnQty)
      .map((i) => `${i.approvedQty} of ${i.returnQty} ${i.productName.split("–")[0].trim().toLowerCase()}`);
    if (partials.length > 0) {
      partialBannerText = `Partial approval: ${partials.join(", ")} approved.`;
    }
  }

  // Comment composer visibility: visible for Submitted, Under Review, Approved; hidden for Rejected, Completed
  const showComposer = ["Submitted", "Under Review", "Approved"].includes(claim.status);

  return (
    <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", boxSizing: "border-box" }}>
      {/* Back link */}
      <div className="px-4 pt-4 pb-4">
        <button
          onClick={() => navigate("/account/returns")}
          className="flex items-center gap-2 text-sm font-medium cursor-pointer bg-transparent border-none px-0"
          style={{ color: config.secondaryColor }}
        >
          <ArrowLeftOutlined style={{ fontSize: 12 }} />
          Back to Returns & Claims
        </button>
      </div>

      {/* 2-column workspace */}
      <div className="flex gap-6 px-4 pb-4" style={{ minHeight: "calc(100vh - 260px)" }}>
        {/* Left column — 70% */}
        <div style={{ flex: "0 0 70%", minWidth: 0 }}>
          {/* Header: Claim ID */}
          <h1 className="font-bold m-0 mb-5" style={{ color: config.primaryColor, fontSize: 20 }}>
            {claim.claimId}
          </h1>

          {/* Partial Approval Banner */}
          {isPartialApproval && partialBannerText && (
            <div
              className="flex items-center gap-2.5 rounded-lg px-4 py-3 mb-4 text-sm"
              style={{
                backgroundColor: "#F0F4FF",
                border: "1px solid #BFDBFE",
                color: "#1E40AF",
              }}
            >
              <InfoCircleOutlined style={{ fontSize: 14, flexShrink: 0 }} />
              {partialBannerText}
            </div>
          )}

          {/* Claimed Items Table */}
          <ClaimItemsTable claim={claim} />

          {/* Credit Note Section */}
          {claim.creditNoteNumber && (
            <div
              className="rounded-xl px-4 py-3 mb-6"
              style={{ border: "1px solid #BBF7D0", backgroundColor: "#F0FDF4" }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider m-0 mb-2" style={{ color: "#16A34A" }}>
                Credit Note Issued
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: config.primaryColor }}>
                  {claim.creditNoteNumber}
                </span>
                <button
                  onClick={() => downloadCreditNotePdf(claim)}
                  className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer border-none"
                  style={{ backgroundColor: "#16A34A", color: "#fff" }}
                >
                  <DownloadOutlined style={{ fontSize: 11 }} />
                  Download PDF
                </button>
              </div>
            </div>
          )}

          {/* Comments */}
          <ClaimComments comments={claim.comments} showComposer={showComposer} />
        </div>

        {/* Right column — 30% */}
        <div style={{ flex: "0 0 28%", minWidth: 0, alignSelf: "flex-start", position: "sticky", top: 24 }}>
          <ClaimDetailsSidebar claim={claim} onInvoiceClick={() => setInvoiceOverlayOpen(true)} onCreditNoteClick={() => setCnOverlayOpen(true)} />
          <ClaimAttachments attachments={claim.attachments} />
        </div>
      </div>

      {/* Invoice Overlay */}
      <InvoiceOverlayPanel
        invoiceNumber={claim.invoiceNumber}
        visible={invoiceOverlayOpen}
        onClose={closeInvoiceOverlay}
      />

      {/* Credit Note Overlay */}
      <CreditNoteOverlayPanel
        claim={claim}
        visible={cnOverlayOpen}
        onClose={closeCnOverlay}
      />
    </div>
  );
}
