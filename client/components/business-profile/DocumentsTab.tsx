import {
  UploadOutlined,
  EyeOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { complianceDocuments } from "../../data/businessProfileData";

const statusStyles: Record<string, { bg: string; color: string }> = {
  Valid: { bg: "#F0FDF4", color: "#16A34A" },
  "Expiring Soon": { bg: "#FFFBEB", color: "#D97706" },
  Expired: { bg: "#FEF2F2", color: "#DC2626" },
  "Under Review": { bg: "#EFF6FF", color: "#2563EB" },
};

export default function DocumentsTab() {
  const config = activeBrandConfig;

  const fmtDate = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  return (
    <div style={{ width: "100%" }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold m-0" style={{ color: config.primaryColor }}>
          Compliance Documents
        </h3>
        <button
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md cursor-pointer transition-colors"
          style={{
            color: config.secondaryColor,
            border: `1px solid ${config.borderColor}`,
            backgroundColor: "#fff",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F9FAFB"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; }}
        >
          <UploadOutlined className="text-[10px]" />
          Upload New Document
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ borderCollapse: "collapse", tableLayout: "fixed" }}>
          <thead>
            <tr>
              <Th>Document Name</Th>
              <Th>Type</Th>
              <Th>Uploaded</Th>
              <Th>Expiry</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {complianceDocuments.map((doc) => {
              const st = statusStyles[doc.status] || statusStyles.Valid;
              return (
                <tr
                  key={doc.id}
                  style={{ borderTop: `1px solid ${config.borderColor}` }}
                >
                  <td className="py-3 text-xs font-semibold" style={{ color: config.primaryColor }}>
                    {doc.name}
                  </td>
                  <td className="py-3 text-xs" style={{ color: "#374151" }}>
                    {doc.type}
                  </td>
                  <td className="py-3 text-xs" style={{ color: "#6B7280" }}>
                    {fmtDate(doc.uploadedDate)}
                  </td>
                  <td className="py-3 text-xs" style={{ color: "#6B7280" }}>
                    {fmtDate(doc.expiryDate)}
                  </td>
                  <td className="py-3">
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ color: st.color, backgroundColor: st.bg }}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <ActionBtn icon={<EyeOutlined />} label="View" config={config} />
                      <ActionBtn icon={<SwapOutlined />} label="Replace" config={config} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActionBtn({
  icon,
  label,
  config,
}: {
  icon: React.ReactNode;
  label: string;
  config: typeof activeBrandConfig;
}) {
  return (
    <button
      className="text-[11px] font-medium flex items-center gap-1 px-2 py-1 rounded cursor-pointer border-none bg-transparent transition-colors"
      style={{ color: config.secondaryColor }}
      onMouseEnter={(e) => { e.currentTarget.style.color = config.primaryColor; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = config.secondaryColor; }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      {label}
    </button>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: string }) {
  return (
    <th
      className="text-[10px] font-semibold uppercase tracking-wider pb-2.5 text-left"
      style={{ color: "#9CA3AF", textAlign: align as any }}
    >
      {children}
    </th>
  );
}
