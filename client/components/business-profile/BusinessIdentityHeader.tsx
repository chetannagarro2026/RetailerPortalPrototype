import {
  CheckCircleOutlined,
} from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { useBusinessProfile, businessProfileTransforms } from "../../context/BusinessProfileContext";

const statusBadgeStyles: Record<string, { color: string }> = {
  Verified: { color: "#16A34A" },
  Active: { color: "#16A34A" },
  Pending: { color: "#D97706" },
  "Pending KYC": { color: "#D97706" },
  Rejected: { color: "#DC2626" },
  Suspended: { color: "#DC2626" },
};

function Badge({ label }: { label: string }) {
  const style = statusBadgeStyles[label] || statusBadgeStyles.Pending;
  return (
    <span
      className="text-[11px] font-medium px-2 py-0.5 rounded"
      style={{
        color: style.color,
        backgroundColor: "transparent",
        border: `1px solid ${style.color}`,
      }}
    >
      {label}
    </span>
  );
}

export default function BusinessIdentityHeader() {
  const config = activeBrandConfig;
  const { businessAccount, loading, error } = useBusinessProfile();
  
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (loading) {
    return (
      <div
        className="rounded-xl animate-pulse"
        style={{
          width: "100%",
          boxSizing: "border-box",
          backgroundColor: "#F8F9FB",
          border: `1px solid ${config.borderColor}`,
          padding: "8px 16px 16px 16px",
          minHeight: 200,
        }}
      >
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl"
        style={{
          width: "100%",
          boxSizing: "border-box",
          backgroundColor: "#FEF2F2",
          border: "1px solid #FCA5A5",
          padding: "16px",
        }}
      >
        <p className="text-sm text-red-600 m-0">Failed to load business profile: {error}</p>
      </div>
    );
  }

  if (!businessAccount) {
    return (
      <div
        className="rounded-xl"
        style={{
          width: "100%",
          boxSizing: "border-box",
          backgroundColor: "#F8F9FB",
          border: `1px solid ${config.borderColor}`,
          padding: "16px",
        }}
      >
        <p className="text-sm text-gray-500 m-0">No business profile data available</p>
      </div>
    );
  }

  // Transform API data for UI display
  const displayStatus = businessProfileTransforms.getDisplayStatus(businessAccount.accountStatus);
  const gstInfo = businessProfileTransforms.getPrimaryGstInfo(businessAccount.taxIdentifications);
  const distributorAssigned = businessProfileTransforms.isDistributorAssigned(businessAccount.linkedAccounts);
  const onboardingDate = businessProfileTransforms.getOnboardingDate(businessAccount.statusTimeLine);
  const kycApproved = businessProfileTransforms.isKycApproved(businessAccount.accountStatus, businessAccount.taxIdentifications);

  return (
    <div
      className="rounded-xl"
      style={{
        width: "100%",
        boxSizing: "border-box",
        backgroundColor: "#F8F9FB",
        border: `1px solid ${config.borderColor}`,
        padding: "8px 16px 16px 16px",
      }}
    >
      {/* Top row: title */}
      <div className="mb-4">
        <h2 className="text-lg font-bold m-0" style={{ color: config.primaryColor }}>
          {businessAccount.legalName}
        </h2>
        <p className="text-xs m-0 mt-0.5" style={{ color: config.secondaryColor }}>
          {businessAccount.tradeName} &bull; {businessAccount.businessType}
        </p>
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
        {/* Column 1: Business Identity */}
        <div className="space-y-2">
          <Field label="Legal Business Name" value={businessAccount.legalName} config={config} />
          <Field label="Trade Name" value={businessAccount.tradeName} config={config} />
          <Field label="Business Type" value={businessAccount.businessType} config={config} />
        </div>

        {/* Column 2: Contact Information */}
        <div className="space-y-2">
          <Field label="Primary Contact" value={businessAccount.contactPerson} config={config} />
          <Field label="Primary Email" value={businessAccount.email} config={config} />
          <Field label="Phone" value={businessAccount.phoneNumber} config={config} />
          <Field label="Billing Email" value={businessAccount.email} config={config} />
        </div>

        {/* Column 3: Compliance Snapshot */}
        <div className="space-y-2">
          <div style={{ paddingBottom: 8 }}>
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
              GST Number
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm" style={{ color: config.primaryColor }}>{gstInfo.number || 'Not provided'}</span>
              {gstInfo.number && <Badge label={gstInfo.status} />}
            </div>
          </div>
          <div style={{ paddingBottom: 8 }}>
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
              Account Status
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge label={displayStatus} />
            </div>
          </div>
          <Field label="Account ID" value={businessAccount.businessAccId || businessAccount.accountId.toString()} config={config} />
          <Field label="Onboarding Date" value={onboardingDate ? fmtDate(onboardingDate) : 'Not available'} config={config} />
        </div>
      </div>

      {/* Inline status row */}
      <div
        className="flex items-center gap-5 mt-2 pt-4"
        style={{ borderTop: `1px solid ${config.borderColor}` }}
      >
        <StatusCheck label="GST Verified" checked={gstInfo.status === "Verified"} />
        <StatusCheck label="KYC Approved" checked={kycApproved} />
        <StatusCheck label="Distributor Assigned" checked={distributorAssigned} />
      </div>
    </div>
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
    <div style={{ paddingBottom: 8 }}>
      <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
        {label}
      </span>
      <p className="text-sm m-0 mt-0.5" style={{ color: config.primaryColor }}>
        {value}
      </p>
    </div>
  );
}

function StatusCheck({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <CheckCircleOutlined
        style={{ fontSize: 16, color: checked ? "#16A34A" : "#D1D5DB" }}
      />
      <span className="text-xs" style={{ color: checked ? "#374151" : "#9CA3AF" }}>
        {label}
      </span>
    </div>
  );
}
