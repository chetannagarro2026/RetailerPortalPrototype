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

interface Props {
  claim: ReturnClaim;
  onInvoiceClick?: () => void;
  onCreditNoteClick?: () => void;
}

export default function ClaimDetailsSidebar({ claim, onInvoiceClick, onCreditNoteClick }: Props) {
  const config = activeBrandConfig;
  const sts = statusStyles[claim.status] || statusStyles.Submitted;

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Claim ID", value: claim.claimId },
    {
      label: "Linked Invoice",
      value: (
        <button
          onClick={onInvoiceClick}
          className="bg-transparent border-none p-0 cursor-pointer hover:underline text-sm font-medium"
          style={{ color: config.primaryColor }}
        >
          {claim.invoiceNumber}
        </button>
      ),
    },
    {
      label: "Status",
      value: (
        <span
          className="text-[11px] font-medium px-2 py-0.5 rounded whitespace-nowrap inline-flex"
          style={{ color: sts.color, backgroundColor: "transparent", border: `1px solid ${sts.color}` }}
        >
          {claim.status}
        </span>
      ),
    },
    { label: "Created Date", value: formatDate(claim.createdAt) },
  ];

  if (claim.reviewedAt) {
    fields.push({ label: "Reviewed Date", value: formatDate(claim.reviewedAt) });
  }

  if (claim.creditNoteNumber) {
    fields.push({
      label: "Credit Note",
      value: (
        <button
          onClick={onCreditNoteClick}
          className="bg-transparent border-none p-0 cursor-pointer hover:underline text-sm font-medium"
          style={{ color: config.primaryColor }}
        >
          {claim.creditNoteNumber}
        </button>
      ),
    });
  }

  return (
    <div
      className="rounded-xl p-5 sticky top-6"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      <h3 className="text-sm font-semibold m-0 mb-4" style={{ color: config.primaryColor }}>
        Claim Details
      </h3>

      <div className="flex flex-col gap-4">
        {fields.map((f) => (
          <div key={f.label}>
            <p className="text-[11px] font-semibold uppercase tracking-wider m-0 mb-1" style={{ color: config.secondaryColor }}>
              {f.label}
            </p>
            <div className="text-sm font-medium" style={{ color: config.primaryColor }}>
              {f.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
