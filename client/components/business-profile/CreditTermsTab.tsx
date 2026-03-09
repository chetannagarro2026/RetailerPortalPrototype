import { activeBrandConfig } from "../../config/brandConfig";
import { useBusinessProfile, businessProfileTransforms } from "../../context/BusinessProfileContext";

const fmt = (v: number | string) => {
  const num = typeof v === 'string' ? parseFloat(v) : v;
  return isNaN(num) ? "Not specified" : "$" + num.toLocaleString("en-US", { minimumFractionDigits: 0 });
};

export default function CreditTermsTab() {
  const config = activeBrandConfig;
  const { businessAccount, loading } = useBusinessProfile();

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Not specified";

  if (loading) {
    return (
      <div style={{ width: "100%" }}>
        <div className="animate-pulse space-y-5">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!businessAccount) {
    return (
      <div style={{ width: "100%" }}>
        <h3 className="text-base font-semibold m-0 mb-5" style={{ color: config.primaryColor }}>
          Credit Terms & Policies
        </h3>
        <p className="text-sm text-gray-500">No business account data available</p>
      </div>
    );
  }

  // Get data from API contracts
  const activeContract = businessAccount.contracts?.find(contract => contract.status === 'ACTIVE') || businessAccount.contracts?.[0];
  const paymentTerms = businessProfileTransforms.getPaymentTerms(businessAccount.contracts);

  // Since detailed credit terms are not fully available in the API, show what we have
  const creditLimit = "Not specified"; // API doesn't provide credit limit
  const overlimitPolicy = "Not specified"; // API doesn't provide this
  const gracePeriod = "Not specified"; // API doesn't provide this
  const interestOnOverdue = "Not specified"; // API doesn't provide this
  const specialPricing = "Not specified"; // API doesn't provide this
  const lastCreditReview = "Not specified"; // API doesn't provide this
  const creditManagedBy = activeContract?.signedBy || "Not specified";

  return (
    <div style={{ width: "100%" }}>
      <h3 className="text-base font-semibold m-0 mb-5" style={{ color: config.primaryColor }}>
        Credit Terms & Policies
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
        {/* Left column */}
        <div className="space-y-4">
          <Field label="Credit Limit" value={creditLimit} config={config} />
          <Field label="Payment Terms" value={paymentTerms} config={config} />
          <div>
            <Label>Overlimit Policy</Label>
            <p className="text-sm m-0 mt-0.5 leading-relaxed" style={{ color: config.primaryColor }}>
              {overlimitPolicy}
            </p>
          </div>
          <Field label="Grace Period" value={gracePeriod} config={config} />
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <Field label="Interest on Overdue" value={interestOnOverdue} config={config} />
          <Field label="Special Pricing Agreement" value={specialPricing} config={config} />
          <Field label="Last Credit Review" value={lastCreditReview} config={config} />
          <Field label="Credit Managed By" value={creditManagedBy} config={config} />
        </div>
      </div>

      {/* Contract Information */}
      {activeContract && (
        <div
          className="mt-6 pt-5"
          style={{ borderTop: `1px solid ${config.borderColor}` }}
        >
          <h4 className="text-sm font-semibold mb-4" style={{ color: config.primaryColor }}>
            Active Contract Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Contract Title" value={activeContract.contractTitle} config={config} />
            <Field label="Contract Type" value={activeContract.contractType} config={config} />
            <Field label="Status" value={activeContract.status} config={config} />
            <Field label="Currency" value={activeContract.currency} config={config} />
            <Field label="Payment Frequency" value={activeContract.pmtFreq} config={config} />
            <Field label="Customer Tier" value={activeContract.customerTier} config={config} />
            <Field label="Effective Date" value={fmtDate(activeContract.effectiveDate)} config={config} />
            <Field label="Expiry Date" value={fmtDate(activeContract.expiryDate)} config={config} />
            <Field label="Renewal Type" value={activeContract.renewalType} config={config} />
          </div>
        </div>
      )}

      {/* Note about limited data */}
      <div
        className="mt-6 pt-5 text-xs text-gray-500 italic"
        style={{ borderTop: `1px solid ${config.borderColor}` }}
      >
        * Detailed credit terms and utilization data is not available through the current API. Contact your account manager for complete credit information.
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
      {children}
    </span>
  );
}

function Field({
  label,
  value,
  config,
}: {
  label: string;
  value: string;
  config: typeof activeBrandConfig;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <p className="text-sm font-medium m-0 mt-0.5" style={{ color: config.primaryColor }}>
        {value}
      </p>
    </div>
  );
}
