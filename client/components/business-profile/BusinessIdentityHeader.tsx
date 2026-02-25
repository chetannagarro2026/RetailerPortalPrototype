import {
  CheckCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { activeBrandConfig } from "../../config/brandConfig";
import { businessIdentity } from "../../data/businessProfileData";

const statusBadgeStyles: Record<string, { bg: string; color: string }> = {
  Verified: { bg: "#F0FDF4", color: "#16A34A" },
  Active: { bg: "#F0FDF4", color: "#16A34A" },
  Pending: { bg: "#FFFBEB", color: "#D97706" },
  "Pending KYC": { bg: "#FFFBEB", color: "#D97706" },
  Rejected: { bg: "#FEF2F2", color: "#DC2626" },
  Suspended: { bg: "#FEF2F2", color: "#DC2626" },
};

function Badge({ label }: { label: string }) {
  const style = statusBadgeStyles[label] || statusBadgeStyles.Pending;
  return (
    <span
      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ color: style.color, backgroundColor: style.bg }}
    >
      {label}
    </span>
  );
}

export default function BusinessIdentityHeader() {
  const config = activeBrandConfig;
  const b = businessIdentity;
  const isSuspended = b.accountStatus === "Suspended";

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div
      className="rounded-xl"
      style={{
        width: "100%",
        boxSizing: "border-box",
        backgroundColor: "#F8F9FB",
        border: `1px solid ${config.borderColor}`,
        padding: 16,
      }}
    >
      {/* Top row: title + edit button */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold m-0" style={{ color: config.primaryColor }}>
            {b.legalName}
          </h2>
          <p className="text-xs m-0 mt-0.5" style={{ color: config.secondaryColor }}>
            {b.tradeName} &bull; {b.businessType}
          </p>
        </div>
        {!isSuspended && (
          <Link
            to="/account/settings"
            className="flex items-center gap-1.5 text-xs font-medium no-underline px-3 py-1.5 rounded-md transition-colors"
            style={{
              color: config.secondaryColor,
              border: `1px solid ${config.borderColor}`,
              backgroundColor: "#fff",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F3F4F6";
              e.currentTarget.style.color = config.primaryColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fff";
              e.currentTarget.style.color = config.secondaryColor;
            }}
          >
            <EditOutlined className="text-[11px]" />
            Edit Business Info
          </Link>
        )}
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
        {/* Column 1: Business Identity */}
        <div className="space-y-2">
          <Field label="Legal Business Name" value={b.legalName} config={config} />
          <Field label="Trade Name" value={b.tradeName} config={config} />
          <Field label="Business Type" value={b.businessType} config={config} />
        </div>

        {/* Column 2: Contact Information */}
        <div className="space-y-2">
          <Field label="Primary Contact" value={b.primaryContact} config={config} />
          <Field label="Primary Email" value={b.primaryEmail} config={config} />
          <Field label="Phone" value={b.phone} config={config} />
          <Field label="Billing Email" value={b.billingEmail} config={config} />
        </div>

        {/* Column 3: Compliance Snapshot */}
        <div className="space-y-2">
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
              GST Number
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm" style={{ color: config.primaryColor }}>{b.gstNumber}</span>
              <Badge label={b.gstStatus} />
            </div>
          </div>
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
              Account Status
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge label={b.accountStatus} />
            </div>
          </div>
          <Field label="Account ID" value={b.accountId} config={config} />
          <Field label="Onboarding Date" value={fmtDate(b.onboardingDate)} config={config} />
        </div>
      </div>

      {/* Inline status row */}
      <div
        className="flex items-center gap-5 mt-2 pt-4"
        style={{ borderTop: `1px solid ${config.borderColor}` }}
      >
        <StatusCheck label="GST Verified" checked={b.gstStatus === "Verified"} />
        <StatusCheck label="KYC Approved" checked={b.kycApproved} />
        <StatusCheck label="Distributor Assigned" checked={b.distributorAssigned} />
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
    <div>
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
        className="text-xs"
        style={{ color: checked ? "#16A34A" : "#D1D5DB" }}
      />
      <span className="text-[11px]" style={{ color: checked ? "#374151" : "#9CA3AF" }}>
        {label}
      </span>
    </div>
  );
}
