import {
  FileTextOutlined,
  DownloadOutlined,
  UploadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { kycDocuments } from "../../data/businessProfileData";

const statusStyles: Record<string, { bg: string; color: string }> = {
  Verified: { bg: "#F0FDF4", color: "#16A34A" },
  Pending: { bg: "#FFFBEB", color: "#D97706" },
  Rejected: { bg: "#FEF2F2", color: "#DC2626" },
  Expired: { bg: "#FEF2F2", color: "#DC2626" },
};

export default function KycTaxTab() {
  const config = activeBrandConfig;
  const gstDoc = kycDocuments.find((d) => d.type === "GST Certificate");
  const regDoc = kycDocuments.find((d) => d.type === "Doctor Registration");

  const fmtDate = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  return (
    <div>
      <h3 className="text-base font-semibold m-0 mb-5" style={{ color: config.primaryColor }}>
        KYC & Tax Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left — GST */}
        <DocSection
          title="GST Details"
          config={config}
          fields={[
            { label: "GST Number", value: gstDoc?.number || "—" },
            {
              label: "Status",
              value: gstDoc?.status || "—",
              badge: gstDoc?.status,
            },
            { label: "Certificate", value: gstDoc?.fileName || "—", isFile: !!gstDoc?.fileName },
            { label: "Expiry Date", value: fmtDate(gstDoc?.expiryDate || "") },
          ]}
          rejectionReason={
            gstDoc?.status === "Rejected"
              ? "GST certificate could not be verified. Please upload a valid document."
              : undefined
          }
        />

        {/* Right — Doctor Registration */}
        <DocSection
          title="Registration Details"
          config={config}
          fields={[
            { label: "Registration Number", value: regDoc?.number || "—" },
            {
              label: "Status",
              value: regDoc?.status || "—",
              badge: regDoc?.status,
            },
            { label: "Certificate", value: regDoc?.fileName || "Not uploaded", isFile: !!regDoc?.fileName },
            { label: "Expiry Date", value: fmtDate(regDoc?.expiryDate || "") },
          ]}
          rejectionReason={
            regDoc?.status === "Rejected"
              ? "Registration document was rejected. Reason: illegible scan."
              : undefined
          }
        />
      </div>

      {/* Upload button */}
      <div className="mt-6">
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
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    color: (statusStyles[f.badge] || statusStyles.Pending).color,
                    backgroundColor: (statusStyles[f.badge] || statusStyles.Pending).bg,
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
