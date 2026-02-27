import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeftOutlined, DownloadOutlined, FileTextOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../config/brandConfig";
import { RETURN_CLAIMS } from "../data/returns";
import ClaimDetailsSidebar from "../components/returns/ClaimDetailsSidebar";
import ClaimItemsTable from "../components/returns/ClaimItemsTable";
import ClaimComments from "../components/returns/ClaimComments";
import { downloadCreditNotePdf } from "../utils/creditNotePdf";

export default function ClaimDetailPage() {
  const config = activeBrandConfig;
  const navigate = useNavigate();
  const { claimId } = useParams<{ claimId: string }>();

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

  const fmt = (v: number) => "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2 });

  return (
    <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", boxSizing: "border-box" }}>
      {/* Back link */}
      <div className="px-6 pt-6 pb-4">
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
      <div className="flex gap-6 px-6 pb-6" style={{ minHeight: "calc(100vh - 260px)" }}>
        {/* Left column — 70% */}
        <div style={{ flex: "0 0 70%", minWidth: 0 }}>
          {/* Subject */}
          <h1 className="font-bold m-0 mb-1" style={{ color: config.primaryColor, fontSize: 20 }}>
            {claim.claimId}
          </h1>
          <p className="text-sm m-0 mb-5" style={{ color: config.secondaryColor }}>
            Return claim for{" "}
            <Link
              to={`/account/invoices/${claim.invoiceNumber}`}
              className="no-underline hover:underline font-medium"
              style={{ color: config.primaryColor }}
            >
              {claim.invoiceNumber}
            </Link>
          </p>

          {/* Claimed Items */}
          <ClaimItemsTable claim={claim} />

          {/* Amounts Summary */}
          <div className="rounded-xl p-4 mt-5 mb-5" style={{ border: `1px solid ${config.borderColor}`, backgroundColor: config.cardBg }}>
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: config.secondaryColor }}>Claimed Amount</span>
              <span className="font-medium" style={{ color: config.primaryColor }}>{fmt(claim.claimedAmount)}</span>
            </div>
            {claim.approvedAmount !== undefined && (
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color: config.secondaryColor }}>Approved Amount</span>
                <span className="font-semibold" style={{ color: "#16A34A" }}>{fmt(claim.approvedAmount)}</span>
              </div>
            )}
            {claim.approvedAmount !== undefined && claim.approvedAmount < claim.claimedAmount && (
              <div className="flex justify-between text-sm">
                <span style={{ color: config.secondaryColor }}>Rejected Amount</span>
                <span style={{ color: "#DC2626" }}>{fmt(claim.claimedAmount - claim.approvedAmount)}</span>
              </div>
            )}
          </div>

          {/* Credit Note download */}
          {claim.creditNoteNumber && (
            <div
              className="rounded-xl p-4 mb-5 flex items-center justify-between"
              style={{ border: `1px solid #BBF7D0`, backgroundColor: "#F0FDF4" }}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider m-0 mb-1" style={{ color: "#16A34A" }}>Credit Note</p>
                <p className="text-sm font-medium m-0" style={{ color: config.primaryColor }}>{claim.creditNoteNumber}</p>
              </div>
              <button
                onClick={() => downloadCreditNotePdf(claim)}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg cursor-pointer text-white border-none"
                style={{ backgroundColor: "#16A34A" }}
              >
                <DownloadOutlined style={{ fontSize: 12 }} />
                Download PDF
              </button>
            </div>
          )}

          {/* Attachments */}
          {claim.attachments.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold m-0 mb-3" style={{ color: config.primaryColor }}>Attachments</h3>
              <div className="flex flex-wrap gap-2">
                {claim.attachments.map((name, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 rounded-lg" style={{ backgroundColor: config.cardBg, color: config.primaryColor, border: `1px solid ${config.borderColor}` }}>
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <ClaimComments comments={claim.comments} />
        </div>

        {/* Right column — 30% */}
        <div style={{ flex: "0 0 28%", minWidth: 0 }}>
          <ClaimDetailsSidebar claim={claim} />
        </div>
      </div>
    </div>
  );
}
