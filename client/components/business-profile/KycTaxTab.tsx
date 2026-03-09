import {
  FileTextOutlined,
  DownloadOutlined,
  UploadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { useBusinessProfile, businessProfileTransforms } from "../../context/BusinessProfileContext";

const statusStyles: Record<string, { bg: string; color: string }> = {
  Verified: { bg: "#F0FDF4", color: "#16A34A" },
  Active: { bg: "#F0FDF4", color: "#16A34A" },
  Pending: { bg: "#FFFBEB", color: "#D97706" },
  Rejected: { bg: "#FEF2F2", color: "#DC2626" },
  Expired: { bg: "#FEF2F2", color: "#DC2626" },
};

export default function KycTaxTab() {
  const config = activeBrandConfig;
  const { businessAccount, loading } = useBusinessProfile();

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  if (loading) {
    return (
      <div style={{ width: "100%" }}>
        <div className="animate-pulse space-y-5">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded w-40"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-5">
                <div className="space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="space-y-1">
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!businessAccount) {
    return (
      <div style={{ width: "100%" }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold m-0" style={{ color: config.primaryColor }}>
            KYC & Tax Information
          </h3>
          <button
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-md cursor-pointer transition-colors"
            style={{
              color: config.secondaryColor,
              border: `1px solid ${config.borderColor}`,
              backgroundColor: "#fff",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F9FAFB"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; }}
          >
            <UploadOutlined className="text-[11px]" />
            Upload New Document
          </button>
        </div>
        <p className="text-sm text-gray-500">No business account data available</p>
      </div>
    );
  }

  // Get GST/Tax information from API
  const gstInfo = businessProfileTransforms.getPrimaryGstInfo(businessAccount.taxIdentifications);
  const registrationNumber = businessAccount.businessRegNo || "Not provided";

  // Get all tax identifications for display
  const taxIdentifications = businessAccount.taxIdentifications || [];

  return (
    <div style={{ width: "100%" }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold m-0" style={{ color: config.primaryColor }}>
          KYC & Tax Information
        </h3>
        <button
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-md cursor-pointer transition-colors"
          style={{
            color: config.secondaryColor,
            border: `1px solid ${config.borderColor}`,
            backgroundColor: "#fff",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F9FAFB"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; }}
        >
          <UploadOutlined className="text-[11px]" />
          Upload New Document
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left — GST Details */}
        <DocSection
          title="GST Details"
          config={config}
          fields={[
            { label: "GST Number", value: gstInfo.number || "—" },
            {
              label: "Status",
              value: gstInfo.status === 'Active' ? 'Verified' : gstInfo.status || "—",
              badge: gstInfo.status === 'Active' ? 'Verified' : gstInfo.status,
            },
            { label: "Certificate", value: "Not available via API", isFile: false },
            { label: "Expiry Date", value: fmtDate(gstInfo.expiryDate) },
          ]}
          rejectionReason={
            gstInfo.status === "Rejected"
              ? "GST certificate could not be verified. Please upload a valid document."
              : undefined
          }
        />

        {/* Right — Registration Details */}
        <DocSection
          title="Registration Details"
          config={config}
          fields={[
            { label: "Registration Number", value: registrationNumber },
            {
              label: "Status",
              value: businessAccount.isActive ? "Active" : "Inactive",
              badge: businessAccount.isActive ? "Active" : "Inactive",
            },
            { label: "Certificate", value: "Not available via API", isFile: false },
            { label: "Expiry Date", value: "—" },
          ]}
        />
      </div>

      {/* Additional Tax Identifications */}
      {taxIdentifications.length > 0 && (
        <div
          className="mt-6 pt-5"
          style={{ borderTop: `1px solid ${config.borderColor}` }}
        >
          <h4 className="text-sm font-semibold mb-4" style={{ color: config.primaryColor }}>
            All Tax Identifications
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wider pb-2.5" style={{ color: "#9CA3AF" }}>
                    Type
                  </th>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wider pb-2.5" style={{ color: "#9CA3AF" }}>
                    Identifier
                  </th>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wider pb-2.5" style={{ color: "#9CA3AF" }}>
                    PAN Number
                  </th>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wider pb-2.5" style={{ color: "#9CA3AF" }}>
                    State
                  </th>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wider pb-2.5" style={{ color: "#9CA3AF" }}>
                    Status
                  </th>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wider pb-2.5" style={{ color: "#9CA3AF" }}>
                    Valid Until
                  </th>
                </tr>
              </thead>
              <tbody>
                {taxIdentifications.map((tax) => (
                  <tr key={tax.taxId} style={{ borderTop: `1px solid ${config.borderColor}` }}>
                    <td className="py-3 text-xs font-semibold" style={{ color: config.primaryColor }}>
                      {tax.taxType.type} ({tax.taxType.description})
                    </td>
                    <td className="py-3 text-xs" style={{ color: "#374151" }}>
                      {tax.taxIdentifier}
                    </td>
                    <td className="py-3 text-xs" style={{ color: "#374151" }}>
                      {tax.panNumber || "—"}
                    </td>
                    <td className="py-3 text-xs" style={{ color: "#374151" }}>
                      {tax.state}
                    </td>
                    <td className="py-3">
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded"
                        style={{
                          color: (statusStyles[tax.status] || statusStyles.Pending).color,
                          backgroundColor: "transparent",
                          border: `1px solid ${(statusStyles[tax.status] || statusStyles.Pending).color}`,
                        }}
                      >
                        {tax.status}
                      </span>
                    </td>
                    <td className="py-3 text-xs" style={{ color: "#6B7280" }}>
                      {fmtDate(tax.validTo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Note about limited document features */}
      <div
        className="mt-6 pt-5 text-xs text-gray-500 italic"
        style={{ borderTop: `1px solid ${config.borderColor}` }}
      >
        * Document management features (file uploads, downloads, rejection reasons) are not available through the current API. Basic tax identification information is shown from the business account data.
      </div>
    </div>
  );
}

interface FieldDef {
  label: string;
  value: string;
  badge?: string;
  isFile?: boolean;
}

function DocSection({
  title,
  config,
  fields,
  rejectionReason,
}: {
  title: string;
  config: typeof activeBrandConfig;
  fields: FieldDef[];
  rejectionReason?: string;
}) {
  return (
    <div
      className="rounded-lg p-5"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      <h4 className="text-sm font-semibold m-0 mb-4" style={{ color: config.primaryColor }}>
        {title}
      </h4>

      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f.label}>
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
              {f.label}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              {f.badge ? (
                <span
                  className="text-[11px] font-medium px-2 py-0.5 rounded"
                  style={{
                    color: (statusStyles[f.badge] || statusStyles.Pending).color,
                    backgroundColor: "transparent",
                    border: `1px solid ${(statusStyles[f.badge] || statusStyles.Pending).color}`,
                  }}
                >
                  {f.value}
                </span>
              ) : f.isFile ? (
                <span className="flex items-center gap-1.5">
                  <FileTextOutlined className="text-xs" style={{ color: config.secondaryColor }} />
                  <span className="text-sm" style={{ color: config.primaryColor }}>{f.value}</span>
                  <button
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded cursor-pointer border-none bg-transparent"
                    style={{ color: config.primaryColor }}
                  >
                    <DownloadOutlined className="text-[10px]" /> View
                  </button>
                </span>
              ) : (
                <span className="text-sm" style={{ color: config.primaryColor }}>{f.value}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {rejectionReason && (
        <div
          className="flex items-start gap-2 mt-4 rounded-md px-3 py-2.5"
          style={{ backgroundColor: "#FEF2F2" }}
        >
          <ExclamationCircleOutlined className="text-xs mt-0.5 shrink-0" style={{ color: "#DC2626" }} />
          <span className="text-xs leading-relaxed" style={{ color: "#991B1B" }}>
            {rejectionReason}
          </span>
        </div>
      )}
    </div>
  );
}
