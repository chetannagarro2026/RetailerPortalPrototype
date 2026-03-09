import {
  UploadOutlined,
  EyeOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { useBusinessProfile } from "../../context/BusinessProfileContext";

const statusStyles: Record<string, { bg: string; color: string }> = {
  Valid: { bg: "#F0FDF4", color: "#16A34A" },
  "Expiring Soon": { bg: "#FFFBEB", color: "#D97706" },
  Expired: { bg: "#FEF2F2", color: "#DC2626" },
  "Under Review": { bg: "#EFF6FF", color: "#2563EB" },
};

export default function DocumentsTab() {
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
          <div className="space-y-4">
            <div className="flex space-x-4 border-b pb-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded flex-1"></div>
              ))}
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex space-x-4 py-3">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded flex-1"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Check if documents array exists in API (it should be empty based on the response structure)
  const documents = businessAccount?.documents || [];

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
          onClick={() => alert("Document upload feature is not available through the current API. Please contact your account manager.")}
        >
          <UploadOutlined className="text-[10px]" />
          Upload New Document
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="py-16 text-center">
          <InboxOutlined className="text-3xl mb-3" style={{ color: "#D1D5DB" }} />
          <p className="text-sm text-gray-400 m-0 mb-1">No documents available through API</p>
          <p className="text-xs text-gray-300 m-0 mb-4">The current API does not support document management features.</p>
          
          {/* Show available document-related information from other sources */}
          <div 
            className="mt-6 mx-auto max-w-2xl"
            style={{ textAlign: 'left' }}
          >
            <h4 className="text-sm font-semibold mb-4" style={{ color: config.primaryColor, textAlign: 'center' }}>
              Available Document-Related Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tax Documents Info */}
              {businessAccount?.taxIdentifications && businessAccount.taxIdentifications.length > 0 && (
                <div
                  className="rounded-lg p-4"
                  style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
                >
                  <h5 className="text-xs font-semibold mb-3" style={{ color: config.primaryColor }}>
                    Tax Document References
                  </h5>
                  <div className="space-y-2">
                    {businessAccount.taxIdentifications.map((tax) => (
                      <div key={tax.taxId} className="text-xs">
                        <div style={{ color: "#374151" }}>
                          <strong>{tax.taxType.type}:</strong> {tax.taxIdentifier}
                        </div>
                        <div style={{ color: config.secondaryColor }}>
                          Certificate Number: {tax.taxCertificateNumber || 'Not provided'}
                        </div>
                        <div style={{ color: config.secondaryColor }}>
                          Valid until: {fmtDate(tax.validTo)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bank Details Info */}
              {businessAccount?.bankDetails && businessAccount.bankDetails.length > 0 && (
                <div
                  className="rounded-lg p-4"
                  style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
                >
                  <h5 className="text-xs font-semibold mb-3" style={{ color: config.primaryColor }}>
                    Banking Document References
                  </h5>
                  <div className="space-y-2">
                    {businessAccount.bankDetails.map((bank) => (
                      <div key={bank.id} className="text-xs">
                        <div style={{ color: "#374151" }}>
                          <strong>{bank.bankName}:</strong> {bank.bankAccNum?.replace(/\d(?=\d{4})/g, '*')}
                        </div>
                        <div style={{ color: config.secondaryColor }}>
                          Type: {bank.bankAccType || 'Business Account'}
                        </div>
                        <div style={{ color: config.secondaryColor }}>
                          Primary: {bank.isPrimary ? 'Yes' : 'No'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contract Info */}
              {businessAccount?.contracts && businessAccount.contracts.length > 0 && (
                <div
                  className="rounded-lg p-4"
                  style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
                >
                  <h5 className="text-xs font-semibold mb-3" style={{ color: config.primaryColor }}>
                    Contract References
                  </h5>
                  <div className="space-y-2">
                    {businessAccount.contracts.map((contract) => (
                      <div key={contract.contractId} className="text-xs">
                        <div style={{ color: "#374151" }}>
                          <strong>{contract.contractTitle}</strong> ({contract.contractType})
                        </div>
                        <div style={{ color: config.secondaryColor }}>
                          Number: {contract.contractNumber}
                        </div>
                        <div style={{ color: config.secondaryColor }}>
                          Status: {contract.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Account Status Info */}
              <div
                className="rounded-lg p-4"
                style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
              >
                <h5 className="text-xs font-semibold mb-3" style={{ color: config.primaryColor }}>
                  Account Verification Status
                </h5>
                <div className="space-y-2">
                  <div className="text-xs">
                    <div style={{ color: "#374151" }}>
                      <strong>Account Status:</strong> {businessAccount?.accountStatus}
                    </div>
                    <div style={{ color: config.secondaryColor }}>
                      Business Type: {businessAccount?.businessType}
                    </div>
                    <div style={{ color: config.secondaryColor }}>
                      Registration Number: {businessAccount?.businessRegNo || 'Not provided'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
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
              {documents.map((doc: any) => (
                <tr
                  key={doc.id}
                  style={{ borderTop: `1px solid ${config.borderColor}` }}
                >
                  <td className="py-3 text-xs font-semibold" style={{ color: config.primaryColor }}>
                    {doc.name || 'Unknown Document'}
                  </td>
                  <td className="py-3 text-xs" style={{ color: "#374151" }}>
                    {doc.type || 'Unknown'}
                  </td>
                  <td className="py-3 text-xs" style={{ color: "#6B7280" }}>
                    {fmtDate(doc.uploadedDate)}
                  </td>
                  <td className="py-3 text-xs" style={{ color: "#6B7280" }}>
                    {fmtDate(doc.expiryDate)}
                  </td>
                  <td className="py-3">
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded"
                      style={{
                        color: (statusStyles[doc.status] || statusStyles.Valid).color,
                        backgroundColor: "transparent",
                        border: `1px solid ${(statusStyles[doc.status] || statusStyles.Valid).color}`,
                      }}
                    >
                      {doc.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <ActionBtn icon={<EyeOutlined />} label="View" config={config} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* API Limitation Notice */}
      <div
        className="mt-6 pt-5 text-xs text-gray-500 italic"
        style={{ borderTop: `1px solid ${config.borderColor}` }}
      >
        * Document management features (upload, download, view) are not available through the current API. Contact your account manager for document-related inquiries.
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
      onClick={() => alert("Document viewing feature is not available through the current API.")}
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
