import { activeBrandConfig } from "../../config/brandConfig";
import { creditTerms } from "../../data/businessProfileData";

const fmt = (v: number) =>
  "$" + v.toLocaleString("en-US", { minimumFractionDigits: 0 });

export default function CreditTermsTab() {
  const config = activeBrandConfig;
  const t = creditTerms;
  const utilPct = Math.round((t.currentUtilization / t.totalCreditLimit) * 100);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div>
      <h3 className="text-base font-semibold m-0 mb-5" style={{ color: config.primaryColor }}>
        Credit Terms & Policies
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
        {/* Left column */}
        <div className="space-y-4">
          <Field label="Credit Limit" value={fmt(t.creditLimit)} config={config} />
          <Field label="Payment Terms" value={t.paymentTerms} config={config} />
          <div>
            <Label>Overlimit Policy</Label>
            <p className="text-sm m-0 mt-0.5 leading-relaxed" style={{ color: config.primaryColor }}>
              {t.overlimitPolicy}
            </p>
          </div>
          <Field label="Grace Period" value={t.gracePeriod} config={config} />
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <Field label="Interest on Overdue" value={t.interestOnOverdue} config={config} />
          <Field label="Special Pricing Agreement" value={t.specialPricing ? "Yes" : "No"} config={config} />
          <Field label="Last Credit Review" value={fmtDate(t.lastCreditReview)} config={config} />
          <Field label="Credit Managed By" value={t.creditManagedBy} config={config} />
        </div>
      </div>

      {/* Utilization bar */}
      <div
        className="mt-6 pt-5"
        style={{ borderTop: `1px solid ${config.borderColor}` }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: config.secondaryColor }}>
            Current Utilization
          </span>
          <span className="text-xs font-semibold" style={{ color: config.primaryColor }}>
            {utilPct}% &mdash; {fmt(t.currentUtilization)} of {fmt(t.totalCreditLimit)}
          </span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#E5E7EB" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${utilPct}%`,
              backgroundColor: utilPct >= 85 ? "#DC2626" : utilPct >= 60 ? "#D97706" : config.primaryColor,
            }}
          />
        </div>
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
